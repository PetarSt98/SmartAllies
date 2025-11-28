package com.smartallies.incident.service;

import com.smartallies.incident.dto.ConnectSamaritanResponse;
import com.smartallies.incident.dto.SamaritanChatResponse;
import com.smartallies.incident.dto.IncidentReportResponse;
import com.smartallies.incident.dto.SubmitReportRequest;
import com.smartallies.incident.model.ConversationContext;
import com.smartallies.incident.model.SamaritanSession;
import com.smartallies.incident.model.WorkflowState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class SamaritanService {

    private final Map<String, SamaritanSession> samaritanSessions = new ConcurrentHashMap<>();
    private final Map<String, List<String>> conversationHistory = new ConcurrentHashMap<>();
    private final ConversationContextService contextService;
    private final ChatClient.Builder chatClientBuilder;
    private final LlmService llmService;
    private final IncidentReportService incidentReportService;

    private static final List<SamaritanPartner> SAMARITAN_PARTNERS = List.of(
            new SamaritanPartner("James Anderson", "https://i.pravatar.cc/150?img=15"),
            new SamaritanPartner("Lisa Thompson", "https://i.pravatar.cc/150?img=9"),
            new SamaritanPartner("Robert Martinez", "https://i.pravatar.cc/150?img=13"),
            new SamaritanPartner("Anna Williams", "https://i.pravatar.cc/150?img=20")
    );

    public ConnectSamaritanResponse connectToSamaritan(String sessionId) {
        log.warn("EMERGENCY: Connecting session {} to Samaritan", sessionId);

        ConversationContext context = contextService.getContext(sessionId);
        if (context == null) {
            throw new IllegalArgumentException("Session not found");
        }

        SamaritanPartner partner = selectRandomSamaritan();
        
        SamaritanSession session = SamaritanSession.builder()
                .sessionId(sessionId)
                .samaritanName(partner.name())
                .samaritanImage(partner.image())
                .samaritanId(UUID.randomUUID().toString())
                .isActive(true)
                .startedAt(LocalDateTime.now())
                .emergencyLocation(context.getField("location"))
                .build();

        samaritanSessions.put(sessionId, session);
        conversationHistory.put(sessionId, new ArrayList<>());
        
        String greeting = String.format(
                "This is %s. I've received your emergency alert from location: %s. " +
                "Help is on the way. Can you tell me what's happening right now? " +
                "Who needs assistance and what is their current condition?",
                partner.name(),
                context.getField("location")
        );

        return ConnectSamaritanResponse.builder()
                .connected(true)
                .samaritanName(partner.name())
                .samaritanImage(partner.image())
                .message(greeting)
                .build();
    }

    public SamaritanChatResponse sendMessageToSamaritan(String sessionId, String userMessage) {
        log.info("Processing Samaritan chat message for session: {}", sessionId);

        SamaritanSession session = samaritanSessions.get(sessionId);
        if (session == null || !session.isActive()) {
            throw new IllegalArgumentException("No active Samaritan session found");
        }

        List<String> history = conversationHistory.get(sessionId);
        history.add("Reporter: " + userMessage);

        String samaritanResponse = generateSamaritanResponse(sessionId, userMessage, history);
        history.add("Samaritan: " + samaritanResponse);

        boolean shouldEnd = detectEmergencyResolution(sessionId, history, samaritanResponse);
        
        if (shouldEnd) {
            return endSamaritanSession(sessionId, history);
        }

        return SamaritanChatResponse.builder()
                .message(samaritanResponse)
                .samaritanName(session.getSamaritanName())
                .samaritanImage(session.getSamaritanImage())
                .sessionEnded(false)
                .build();
    }

    private String generateSamaritanResponse(String sessionId, String userMessage, List<String> history) {
        ConversationContext context = contextService.getContext(sessionId);
        SamaritanSession session = samaritanSessions.get(sessionId);

        String conversationContext = String.join("\n", history);
        
        String systemPrompt = String.format(
                "You are %s, an emergency response Samaritan for the company. " +
                "You are responding to an emergency alert from location: %s\n" +
                "Initial emergency report: %s\n\n" +
                "Your role:\n" +
                "- Stay calm and professional\n" +
                "- Assess the situation quickly\n" +
                "- Ask critical questions: Who needs help? What's their condition? Are they conscious? Any injuries?\n" +
                "- Provide immediate guidance if safe to do so\n" +
                "- Keep responses brief and action-oriented (2-3 sentences)\n" +
                "- Reassure that help is arriving\n" +
                "- After gathering key information (name, condition, immediate danger status), conclude by:\n" +
                "  * Confirming emergency services are en route\n" +
                "  * Providing any last safety instructions\n" +
                "  * Documenting the incident\n\n" +
                "IMPORTANT: Only provide YOUR response as the Samaritan. " +
                "Do NOT generate or simulate the reporter's response. " +
                "Do NOT include 'Reporter:' or 'User:' in your output.\n\n" +
                "Previous conversation:\n%s",
                session.getSamaritanName(),
                session.getEmergencyLocation(),
                context.getInitialMessage(),
                conversationContext
        );

        ChatClient chatClient = chatClientBuilder.build();
        
        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userMessage)
                .call()
                .content();
        
        if (response.contains("Reporter:") || response.contains("User:")) {
            int userIndex = Math.min(
                response.indexOf("Reporter:") != -1 ? response.indexOf("Reporter:") : Integer.MAX_VALUE,
                response.indexOf("User:") != -1 ? response.indexOf("User:") : Integer.MAX_VALUE
            );
            if (userIndex > 0 && userIndex != Integer.MAX_VALUE) {
                response = response.substring(0, userIndex).trim();
            }
        }
        
        return response;
    }

    private boolean detectEmergencyResolution(String sessionId, List<String> history, String samaritanResponse) {
        if (history.size() < 1) {
            return false;
        }

        String lastUserMessage = "";
        for (int i = history.size() - 1; i >= 0; i--) {
            if (history.get(i).startsWith("Reporter: ")) {
                lastUserMessage = history.get(i).substring(10).toLowerCase().trim();
                break;
            }
        }

        String conversationContext = String.join("\n", history.subList(Math.max(0, history.size() - 10), history.size()));
        
        String detectionPrompt = String.format(
                "You are analyzing an emergency response conversation to determine if it can be concluded.\n\n" +
                "Recent conversation:\n%s\n\n" +
                "The reporter's last message: \"%s\"\n" +
                "The Samaritan just responded: \"%s\"\n\n" +
                "Return true (resolved) if ANY apply:\n" +
                "1. Samaritan confirmed emergency services are arriving and gave final instructions\n" +
                "2. Reporter confirmed situation is stable/under control\n" +
                "3. Key information collected: who needs help, their condition, location confirmed\n" +
                "4. Conversation has 8+ exchanges and Samaritan indicated help is on the way\n" +
                "5. Reporter acknowledged Samaritan's closing/handoff statement\n\n" +
                "Return false if:\n" +
                "- Situation still developing\n" +
                "- Reporter still providing critical updates\n" +
                "- Less than 6 exchanges\n" +
                "- No confirmation of emergency services arrival\n\n" +
                "Respond ONLY with valid JSON:\n" +
                "{\n" +
                "  \"resolved\": true,\n" +
                "  \"reasoning\": \"Emergency services confirmed en route, key info collected\"\n" +
                "}",
                conversationContext,
                lastUserMessage,
                samaritanResponse
        );

        try {
            String llmResponse = llmService.generateResponse(detectionPrompt);
            com.fasterxml.jackson.databind.JsonNode result = llmService.parseJsonResponse(llmResponse);
            boolean resolved = result.get("resolved").asBoolean();
            String reasoning = result.get("reasoning").asText();
            
            log.info("Emergency resolution for session {}: {} - {}", 
                    sessionId, resolved, reasoning);
            
            return resolved;
        } catch (Exception e) {
            log.error("Failed to detect emergency resolution, using fallback", e);
            return history.size() >= 16;
        }
    }

    private SamaritanChatResponse endSamaritanSession(String sessionId, List<String> history) {
        SamaritanSession session = samaritanSessions.get(sessionId);
        ConversationContext context = contextService.getContext(sessionId);
        
        SubmitReportRequest request = SubmitReportRequest.builder()
                .sessionId(sessionId)
                .submittedBy("Emergency Response System")
                .anonymous(true)
                .build();
        IncidentReportResponse response = incidentReportService.submitReport(request);
        String ticketId = response.getReportId();
        
        session.setActive(false);
        session.setEndedAt(LocalDateTime.now());
        session.setTicketId(ticketId);

        context.setWorkflowState(WorkflowState.ALERT_SENT);
        context.updateField("ticketId", ticketId);
        contextService.updateContext(context);

        String closingMessage = String.format(
                "Thank you for the information. Emergency services are on their way to %s. " +
                "I've documented everything in incident ticket: %s\n\n" +
                "Please stay with the person if it's safe to do so. If the situation changes, " +
                "call emergency services directly at the numbers provided earlier. Stay safe.",
                session.getEmergencyLocation(),
                ticketId
        );

        return SamaritanChatResponse.builder()
                .message(closingMessage)
                .samaritanName(session.getSamaritanName())
                .samaritanImage(session.getSamaritanImage())
                .sessionEnded(true)
                .ticketId(ticketId)
                .build();
    }

    public SamaritanSession getSamaritanSession(String sessionId) {
        return samaritanSessions.get(sessionId);
    }

    private SamaritanPartner selectRandomSamaritan() {
        int index = (int) (Math.random() * SAMARITAN_PARTNERS.size());
        return SAMARITAN_PARTNERS.get(index);
    }

    private record SamaritanPartner(String name, String image) {}
}
