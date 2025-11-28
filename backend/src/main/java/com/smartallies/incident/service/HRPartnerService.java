package com.smartallies.incident.service;

import com.smartallies.incident.dto.ConnectHRResponse;
import com.smartallies.incident.dto.HRChatResponse;
import com.smartallies.incident.dto.IncidentReportResponse;
import com.smartallies.incident.dto.SubmitReportRequest;
import com.smartallies.incident.model.ConversationContext;
import com.smartallies.incident.model.HRSession;
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
public class HRPartnerService {

    private final Map<String, HRSession> hrSessions = new ConcurrentHashMap<>();
    private final Map<String, List<String>> conversationHistory = new ConcurrentHashMap<>();
    private final ConversationContextService contextService;
    private final ChatClient.Builder chatClientBuilder;
    private final LlmService llmService;
    private final IncidentReportService incidentReportService;

    private static final List<HRPartner> HR_PARTNERS = List.of(
            new HRPartner("Sarah Mitchell", "https://i.pravatar.cc/150?img=1"),
            new HRPartner("Michael Chen", "https://i.pravatar.cc/150?img=12"),
            new HRPartner("Emily Rodriguez", "https://i.pravatar.cc/150?img=5"),
            new HRPartner("David Kim", "https://i.pravatar.cc/150?img=8")
    );

    public ConnectHRResponse connectToHR(String sessionId) {
        log.info("Connecting session {} to HR partner", sessionId);

        ConversationContext context = contextService.getContext(sessionId);
        if (context == null) {
            throw new IllegalArgumentException("Session not found");
        }

        HRPartner partner = selectRandomHRPartner();
        
        HRSession session = HRSession.builder()
                .sessionId(sessionId)
                .hrPartnerName(partner.name())
                .hrPartnerImage(partner.image())
                .hrPartnerId(UUID.randomUUID().toString())
                .isActive(true)
                .startedAt(LocalDateTime.now())
                .build();

        hrSessions.put(sessionId, session);
        conversationHistory.put(sessionId, new ArrayList<>());
        
        String greeting = String.format(
                "Hello, I'm %s from HR. I'm here to help you with your concern. " +
                "You can speak freely - this conversation is confidential and you remain anonymous. " +
                "How can I assist you today?",
                partner.name()
        );

        return ConnectHRResponse.builder()
                .connected(true)
                .hrPartnerName(partner.name())
                .hrPartnerImage(partner.image())
                .message(greeting)
                .build();
    }

    public HRChatResponse sendMessageToHR(String sessionId, String userMessage) {
        log.info("Processing HR chat message for session: {}", sessionId);

        HRSession session = hrSessions.get(sessionId);
        if (session == null || !session.isActive()) {
            throw new IllegalArgumentException("No active HR session found");
        }

        List<String> history = conversationHistory.get(sessionId);
        history.add("User: " + userMessage);

        String hrResponse = generateHRResponse(sessionId, userMessage, history);
        history.add("HR: " + hrResponse);

        boolean shouldEnd = detectConversationConclusion(sessionId, history, hrResponse);
        
        if (shouldEnd) {
            return endHRSession(sessionId, history);
        }

        return HRChatResponse.builder()
                .message(hrResponse)
                .hrPartnerName(session.getHrPartnerName())
                .hrPartnerImage(session.getHrPartnerImage())
                .sessionEnded(false)
                .build();
    }

    private String generateHRResponse(String sessionId, String userMessage, List<String> history) {
        ConversationContext context = contextService.getContext(sessionId);
        HRSession session = hrSessions.get(sessionId);

        String conversationContext = String.join("\n", history);
        
        String systemPrompt = String.format(
                "You are %s, a professional and empathetic HR partner. " +
                "You are speaking with an anonymous employee about a workplace incident. " +
                "The initial incident was: %s\n\n" +
                "Your role:\n" +
                "- Listen actively and show empathy\n" +
                "- Ask clarifying questions about what happened\n" +
                "- Gather important details (timeline, people involved, impact)\n" +
                "- Offer support and next steps\n" +
                "- Keep responses concise (2-3 sentences)\n" +
                "- Maintain professional yet warm tone\n" +
                "- After gathering sufficient information (4-6 exchanges), naturally conclude by:\n" +
                "  * Thanking them for sharing\n" +
                "  * Indicating you've documented everything\n" +
                "  * Mentioning next steps (ticket creation, follow-up)\n\n" +
                "IMPORTANT: Only provide YOUR response as the HR partner. " +
                "Do NOT generate or simulate the user's response. " +
                "Do NOT include 'User:' in your output.\n\n" +
                "Previous conversation:\n%s",
                session.getHrPartnerName(),
                context.getInitialMessage(),
                conversationContext
        );

        ChatClient chatClient = chatClientBuilder.build();
        
        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userMessage)
                .call()
                .content();
        
        if (response.contains("User:") || response.contains("\nUser")) {
            int userIndex = response.indexOf("User:");
            if (userIndex == -1) {
                userIndex = response.indexOf("\nUser");
            }
            if (userIndex > 0) {
                response = response.substring(0, userIndex).trim();
            }
        }
        
        return response;
    }

    private boolean shouldEndConversation(String userMessage, int messageCount) {
        String lower = userMessage.toLowerCase();
        return messageCount >= 8 || 
               lower.contains("that's all") || 
               lower.contains("thank you") && lower.contains("bye") ||
               lower.contains("no more") ||
               lower.contains("that's everything");
    }

    private boolean detectConversationConclusion(String sessionId, List<String> history, String hrResponse) {
        if (history.size() < 4) {
            return false;
        }

        String lastUserMessage = "";
        for (int i = history.size() - 1; i >= 0; i--) {
            if (history.get(i).startsWith("User: ")) {
                lastUserMessage = history.get(i).substring(6).toLowerCase().trim();
                break;
            }
        }

        String conversationContext = String.join("\n", history.subList(Math.max(0, history.size() - 8), history.size()));
        
        String detectionPrompt = String.format(
                "You are analyzing a conversation between an HR partner and an employee to detect if it should end.\n\n" +
                "Recent conversation:\n%s\n\n" +
                "The user's last message was: \"%s\"\n" +
                "The HR partner just responded: \"%s\"\n\n" +
                "Return true (concluded) if ANY of these apply:\n" +
                "1. User expresses closure: 'thank you', 'thanks', 'bye', 'goodbye', 'that's all', 'that's everything', 'I'm done'\n" +
                "2. User confirms no more to add: 'nothing else', 'no more', 'that's it', 'all good'\n" +
                "3. HR has indicated ticket creation/next steps AND user acknowledged it positively\n" +
                "4. Conversation has 8+ exchanges and HR gave a closing statement\n" +
                "5. User gives very short positive response to HR's closing ('ok', 'yes', 'sure', 'got it')\n\n" +
                "Return false if:\n" +
                "- User is still providing information\n" +
                "- User asked a question\n" +
                "- Conversation just started (< 4 exchanges)\n\n" +
                "Respond ONLY with valid JSON:\n" +
                "{\n" +
                "  \"concluded\": true,\n" +
                "  \"reasoning\": \"User said 'thanks' indicating closure\"\n" +
                "}",
                conversationContext,
                lastUserMessage,
                hrResponse
        );

        try {
            String llmResponse = llmService.generateResponse(detectionPrompt);
            com.fasterxml.jackson.databind.JsonNode result = llmService.parseJsonResponse(llmResponse);
            boolean concluded = result.get("concluded").asBoolean();
            String reasoning = result.get("reasoning").asText();
            
            log.info("Conversation conclusion for session {}: {} - {}", 
                    sessionId, concluded, reasoning);
            
            return concluded;
        } catch (Exception e) {
            log.error("Failed to detect conversation conclusion, using fallback", e);
            return history.size() >= 12;
        }
    }

    private HRChatResponse endHRSession(String sessionId, List<String> history) {
        HRSession session = hrSessions.get(sessionId);
        ConversationContext context = contextService.getContext(sessionId);
        SubmitReportRequest request = SubmitReportRequest.builder()
                .sessionId(sessionId)
                .submittedBy("Anonymous Employee")
                .anonymous(true)
                .build();
        IncidentReportResponse response = incidentReportService.submitReport(request);
        String ticketId = response.getReportId();
        session.setActive(false);
        session.setEndedAt(LocalDateTime.now());
        session.setTicketId(ticketId);

        context.setWorkflowState(WorkflowState.REPORT_READY);
        context.updateField("ticketId", ticketId);
        contextService.updateContext(context);

        String closingMessage = String.format(
                "Thank you for sharing this with me. I've documented everything you've told me. " +
                "Your case has been assigned ticket number: %s\n\n" +
                "This ticket is now in SUBMITTED status. Our team will review it and you can track " +
                "its progress. Someone from our team will follow up within 24-48 hours. " +
                "Remember, you can reach out anytime if you need further assistance.",
                ticketId
        );

        return HRChatResponse.builder()
                .message(closingMessage)
                .hrPartnerName(session.getHrPartnerName())
                .hrPartnerImage(session.getHrPartnerImage())
                .sessionEnded(true)
                .ticketId(ticketId)
                .build();
    }

    public HRSession getHRSession(String sessionId) {
        return hrSessions.get(sessionId);
    }

    private HRPartner selectRandomHRPartner() {
        int index = (int) (Math.random() * HR_PARTNERS.size());
        return HR_PARTNERS.get(index);
    }

    private record HRPartner(String name, String image) {}
}
