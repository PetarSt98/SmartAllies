package com.smartallies.incident.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.smartallies.incident.config.EmergencyConfig;
import com.smartallies.incident.dto.ChatRequest;
import com.smartallies.incident.dto.ChatResponse;
import com.smartallies.incident.model.ConversationContext;
import com.smartallies.incident.model.IncidentClassification;
import com.smartallies.incident.model.IncidentType;
import com.smartallies.incident.model.WorkflowState;
import com.smartallies.incident.util.PromptTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatOrchestrationService {

    private final ConversationContextService contextService;
    private final LlmService llmService;
    private final ResourceService resourceService;
    private final EmergencyConfig emergencyConfig;

    public ChatResponse processMessage(ChatRequest request) {
        log.info("Processing message for session: {}", request.getSessionId());
        
        ConversationContext context = contextService.getOrCreateContext(request.getSessionId());
        
        return switch (context.getWorkflowState()) {
            case INITIAL -> handleInitialMessage(context, request);
            case AWAITING_CLASSIFICATION_CONFIRMATION -> handleClassificationConfirmation(context, request);
            case CLASSIFICATION_CONFIRMED -> handlePostClassificationActions(context, request);
            case COLLECTING_DETAILS -> handleDetailsCollection(context, request);
            case AWAITING_REPORT_CONFIRMATION -> handleReportConfirmation(context, request);
            case AWAITING_HR_DECISION -> handleHRDecision(context, request);
            case EMERGENCY_ACTIVE -> handleEmergencyFlow(context, request);
            default -> buildErrorResponse("Invalid workflow state");
        };
    }

    private ChatResponse handleInitialMessage(ConversationContext context, ChatRequest request) {
        log.info("Handling initial message for session: {}", request.getSessionId());
        
        context.setInitialMessage(request.getMessage());
        context.setImageUrl(request.getImageUrl());
        
        String classificationPrompt = PromptTemplates.buildClassificationPrompt(
                request.getMessage(), 
                request.getImageUrl() != null
        );
        
        String llmResponse = llmService.generateResponse(classificationPrompt);
        IncidentClassification classification = llmService.parseClassificationResponse(llmResponse);
        
        context.setIncidentType(classification.getType());
        context.setClassificationConfidence(classification.getConfidence());
        context.setWorkflowState(WorkflowState.AWAITING_CLASSIFICATION_CONFIRMATION);
        contextService.updateContext(context);
        
        String confirmationMessage = String.format(
                "I understand this is a %s incident. %s\n\nIs this correct?",
                classification.getType().toString().toLowerCase(),
                classification.getReasoning()
        );
        
        return ChatResponse.builder()
                .message(confirmationMessage)
                .incidentType(classification.getType())
                .workflowState(context.getWorkflowState())
                .suggestedActions(Arrays.asList("Yes", "No"))
                .metadata(Map.of(
                        "confidence", classification.getConfidence(),
                        "reasoning", classification.getReasoning()
                ))
                .build();
    }

    private ChatResponse handleClassificationConfirmation(ConversationContext context, ChatRequest request) {
        log.info("Handling classification confirmation for session: {}", request.getSessionId());
        
        String userResponse = request.getMessage();
        boolean affirmative = llmService.isAffirmativeReply(userResponse);

        if (affirmative) {
            context.setWorkflowState(WorkflowState.CLASSIFICATION_CONFIRMED);
            contextService.updateContext(context);
            
            return handlePostClassificationActions(context, request);
        } else {
            context.setWorkflowState(WorkflowState.INITIAL);
            context.setIncidentType(null);
            contextService.updateContext(context);
            
            return ChatResponse.builder()
                    .message("I apologize for the misunderstanding. Could you please provide more details about what happened?")
                    .workflowState(context.getWorkflowState())
                    .build();
        }
    }

    private ChatResponse handlePostClassificationActions(ConversationContext context, ChatRequest request) {
        log.info("Handling post-classification actions for type: {}", context.getIncidentType());
        
        return switch (context.getIncidentType()) {
            case HUMAN -> handleHumanIncidentStart(context);
            case FACILITY -> handleFacilityIncidentStart(context);
            case EMERGENCY -> handleEmergencyStart(context);
        };
    }

    private ChatResponse handleHumanIncidentStart(ConversationContext context) {
        List<String> resources = resourceService.getResourcesForIncidentType(IncidentType.HUMAN);
        
        StringBuilder message = new StringBuilder();
        message.append("I'm here to support you through this. Here are some resources that might help:\n\n");
        resources.forEach(resource -> message.append("• ").append(resource).append("\n"));
        message.append("\nWould you like me to help you draft an incident report?");
        
        context.setWorkflowState(WorkflowState.AWAITING_REPORT_CONFIRMATION);
        contextService.updateContext(context);
        
        return ChatResponse.builder()
                .message(message.toString())
                .incidentType(context.getIncidentType())
                .workflowState(context.getWorkflowState())
                .resources(resources)
                .suggestedActions(Arrays.asList("Yes, help me report this", "No, thank you"))
                .build();
    }

    private ChatResponse handleFacilityIncidentStart(ConversationContext context) {
        context.setWorkflowState(WorkflowState.COLLECTING_DETAILS);
        contextService.updateContext(context);
        
        return ChatResponse.builder()
                .message("I'll help you report this facility issue. Let me gather some details.\n\n" +
                        "Please describe what happened in detail.")
                .incidentType(context.getIncidentType())
                .workflowState(context.getWorkflowState())
                .metadata(Map.of("requiredFields", Arrays.asList("what", "where", "picture")))
                .build();
    }

    private ChatResponse handleEmergencyStart(ConversationContext context) {
        context.setWorkflowState(WorkflowState.EMERGENCY_ACTIVE);
        contextService.updateContext(context);
        
        String emergencyMessage = String.format("""
                🚨 EMERGENCY PROTOCOL ACTIVATED 🚨
                
                Swiss Emergency Numbers:
                • Police: %s
                • Ambulance: %s
                • Fire: %s
                • Company Samaritans: %s
                
                Please provide the LOCATION of the emergency immediately.
                """,
                emergencyConfig.getPoliceNumber(),
                emergencyConfig.getAmbulanceNumber(),
                emergencyConfig.getFireNumber(),
                emergencyConfig.getSamaritanNumber()
        );
        
        return ChatResponse.builder()
                .message(emergencyMessage)
                .incidentType(IncidentType.EMERGENCY)
                .workflowState(context.getWorkflowState())
                .metadata(Map.of(
                        "isEmergency", true,
                        "emergencyNumbers", Map.of(
                                "police", emergencyConfig.getPoliceNumber(),
                                "ambulance", emergencyConfig.getAmbulanceNumber(),
                                "fire", emergencyConfig.getFireNumber(),
                                "samaritan", emergencyConfig.getSamaritanNumber()
                        )
                ))
                .build();
    }

    private ChatResponse handleReportConfirmation(ConversationContext context, ChatRequest request) {
        String userResponse = request.getMessage().toLowerCase().trim();
        boolean affirmative = llmService.isAffirmativeReply(userResponse);
        
        if (affirmative) {
            context.setWorkflowState(WorkflowState.COLLECTING_DETAILS);
            contextService.updateContext(context);

            String detailsPrompt = PromptTemplates.buildDetailsCollectionPrompt(
                    context.getInitialMessage()
            );
            String llmResponse = llmService.generateResponse(detailsPrompt);
            
            return ChatResponse.builder()
                    .message(llmResponse)
                    .incidentType(context.getIncidentType())
                    .workflowState(context.getWorkflowState())
                    .metadata(Map.of("requiredFields", Arrays.asList("who", "what", "when", "where")))
                    .build();
        } else {
            context.setWorkflowState(WorkflowState.COMPLETED);
            contextService.updateContext(context);
            
            return ChatResponse.builder()
                    .message("I understand. If you change your mind or need support, please don't hesitate to reach out.")
                    .incidentType(context.getIncidentType())
                    .workflowState(context.getWorkflowState())
                    .build();
        }
    }

    private ChatResponse handleHRDecision(ConversationContext context, ChatRequest request) {
        log.info("Handling HR decision for session: {}", request.getSessionId());
        
        String userResponse = request.getMessage().toLowerCase().trim();
        
        if (userResponse.contains("connect") || userResponse.contains("hr")) {
            context.setWorkflowState(WorkflowState.HR_CONNECTED);
            context.setHrDecisionMade(true);
            contextService.updateContext(context);
            
            return ChatResponse.builder()
                    .message("Connecting you to an HR partner...")
                    .incidentType(context.getIncidentType())
                    .workflowState(context.getWorkflowState())
                    .metadata(Map.of("connectToHR", true))
                    .build();
        } else if (userResponse.contains("share") || userResponse.contains("more") || userResponse.contains("details")) {
            context.setWorkflowState(WorkflowState.COLLECTING_DETAILS);
            context.setHrDecisionMade(true);
            contextService.updateContext(context);
            
            return ChatResponse.builder()
                    .message("Of course. Please share any additional details you'd like to include about the incident. " +
                            "This could be more context, specific examples, or anything else you think is important. " +
                            "When you're done, let me know.")
                    .incidentType(context.getIncidentType())
                    .workflowState(context.getWorkflowState())
                    .build();
        } else {
            context.setWorkflowState(WorkflowState.REPORT_READY);
            context.setHrDecisionMade(true);
            contextService.updateContext(context);
            
            String summaryPrompt = PromptTemplates.buildReportSummaryPrompt(
                    context.getIncidentType(),
                    context.getInitialMessage(),
                    context.getCollectedFields()
            );
            String summaryResponse = llmService.generateResponse(summaryPrompt);
            JsonNode summaryJson = llmService.parseJsonResponse(summaryResponse);
            String summary = summaryJson.get("summary").asText();
            
            context.updateField("summary", summary);
            
            return ChatResponse.builder()
                    .message("Here's a summary of your report:\n\n" + summary + 
                            "\n\nWould you like to submit this report?")
                    .incidentType(context.getIncidentType())
                    .workflowState(context.getWorkflowState())
                    .suggestedActions(Arrays.asList("Submit", "Submit Anonymously", "Cancel"))
                    .metadata(Map.of("summary", summary, "collectedFields", context.getCollectedFields()))
                    .build();
        }
    }

    private ChatResponse handleDetailsCollection(ConversationContext context, ChatRequest request) {
        log.info("Collecting details for {} incident", context.getIncidentType());
        
        String detailsPrompt = PromptTemplates.buildDetailsCollectionPrompt(
                context.getIncidentType(),
                context.getInitialMessage(),
                context.getCollectedFields(),
                request.getMessage()
        );
        
        String llmResponse = llmService.generateResponse(detailsPrompt);
        JsonNode jsonResponse = llmService.parseJsonResponse(llmResponse);
        
        JsonNode extractedFields = jsonResponse.get("extractedFields");
        extractedFields.fields().forEachRemaining(entry -> {
            if (!entry.getValue().isNull() && !entry.getValue().asText().equals("null")) {
                context.updateField(entry.getKey(), entry.getValue().asText());
            }
        });
        
        String responseMessage = jsonResponse.get("message").asText();
        boolean allFieldsCollected = Stream.of("what", "where").allMatch(context::hasField);
        
        if (allFieldsCollected) {
            if (context.getIncidentType() == IncidentType.HUMAN && !context.isHrDecisionMade()) {
                context.setWorkflowState(WorkflowState.AWAITING_HR_DECISION);
                contextService.updateContext(context);
                
                return ChatResponse.builder()
                        .message("Thank you for sharing those details. " +
                                "Would you like to share more details about this incident, " +
                                "or would you prefer to connect with an HR partner who can provide " +
                                "confidential support? You will remain anonymous.")
                        .incidentType(context.getIncidentType())
                        .workflowState(context.getWorkflowState())
                        .suggestedActions(Arrays.asList("Share more details", "Connect to HR Partner"))
                        .build();
            }
            
            context.setWorkflowState(WorkflowState.REPORT_READY);
            
            String summaryPrompt = PromptTemplates.buildReportSummaryPrompt(
                    context.getIncidentType(),
                    context.getInitialMessage(),
                    context.getCollectedFields()
            );
            String summaryResponse = llmService.generateResponse(summaryPrompt);
            JsonNode summaryJson = llmService.parseJsonResponse(summaryResponse);
            String summary = summaryJson.get("summary").asText();
            
            context.updateField("summary", summary);
            
            return ChatResponse.builder()
                    .message("Here's a summary of your report:\n\n" + summary + 
                            "\n\nWould you like to submit this report?")
                    .incidentType(context.getIncidentType())
                    .workflowState(context.getWorkflowState())
                    .suggestedActions(Arrays.asList("Submit", "Submit Anonymously", "Cancel"))
                    .metadata(Map.of("summary", summary, "collectedFields", context.getCollectedFields()))
                    .build();
        }
        
        contextService.updateContext(context);
        
        return ChatResponse.builder()
                .message(responseMessage)
                .incidentType(context.getIncidentType())
                .workflowState(context.getWorkflowState())
                .metadata(Map.of("collectedFields", context.getCollectedFields()))
                .build();
    }

    private ChatResponse handleEmergencyFlow(ConversationContext context, ChatRequest request) {
        log.warn("Handling emergency flow for session: {}", request.getSessionId());
        
        String detailsPrompt = PromptTemplates.buildDetailsCollectionPrompt(
                IncidentType.EMERGENCY,
                context.getInitialMessage(),
                context.getCollectedFields(),
                request.getMessage()
        );
        
        String llmResponse = llmService.generateResponse(detailsPrompt);
        JsonNode jsonResponse = llmService.parseJsonResponse(llmResponse);
        
        JsonNode extractedFields = jsonResponse.get("extractedFields");
        extractedFields.fields().forEachRemaining(entry -> {
            if (!entry.getValue().isNull() && !entry.getValue().asText().equals("null")) {
                context.updateField(entry.getKey(), entry.getValue().asText());
            }
        });
        
        boolean hasLocation = jsonResponse.has("hasLocation") && 
                             jsonResponse.get("hasLocation").asBoolean();
        
        if (hasLocation && context.hasField("location")) {
            log.warn("EMERGENCY ALERT: Location confirmed - {}", context.getField("location"));
            context.setWorkflowState(WorkflowState.ALERT_SENT);

            String alertMessage = String.format("""
                    ✅ Emergency alert sent to company Samaritans!
                    Location: %s
                    Help is on the way. Please stay calm.
                    """, context.getField("location"));
            
            return ChatResponse.builder()
                    .message(alertMessage)
                    .incidentType(IncidentType.EMERGENCY)
                    .workflowState(context.getWorkflowState())
                    .metadata(Map.of(
                            "alertSent", true,
                            "location", context.getField("location"),
                            "collectedFields", context.getCollectedFields()
                    ))
                    .build();
        }
        
        contextService.updateContext(context);
        
        return ChatResponse.builder()
                .message(jsonResponse.get("message").asText())
                .incidentType(IncidentType.EMERGENCY)
                .workflowState(context.getWorkflowState())
                .metadata(Map.of("collectedFields", context.getCollectedFields()))
                .build();
    }

    private ChatResponse buildErrorResponse(String errorMessage) {
        return ChatResponse.builder()
                .message("I encountered an error: " + errorMessage)
                .build();
    }
}
