package com.smartallies.incident.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartallies.incident.model.IncidentClassification;
import com.smartallies.incident.model.IncidentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResponse(String prompt) {
        log.debug("Generating LLM response for prompt length: {}", prompt.length());
        
        try {
            Prompt aiPrompt = new Prompt(prompt);
            String response = chatModel.call(aiPrompt).getResult().getOutput().getContent();
            log.debug("LLM response received: {}", response.substring(0, Math.min(100, response.length())));
            return response;
        } catch (Exception e) {
            log.error("Error calling LLM", e);
            throw new RuntimeException("Failed to generate LLM response", e);
        }
    }

    public IncidentClassification parseClassificationResponse(String llmResponse) {
        try {
            String jsonContent = extractJsonFromResponse(llmResponse);
            JsonNode jsonNode = objectMapper.readTree(jsonContent);
            
            String typeStr = jsonNode.get("type").asText();
            IncidentType type = IncidentType.valueOf(typeStr.toUpperCase());
            Double confidence = jsonNode.has("confidence") ? 
                              jsonNode.get("confidence").asDouble() : 0.5;
            String reasoning = jsonNode.has("reasoning") ? 
                             jsonNode.get("reasoning").asText() : "No reasoning provided";
            
            log.info("Classified as {} with confidence {}", type, confidence);
            
            return IncidentClassification.builder()
                    .type(type)
                    .confidence(confidence)
                    .reasoning(reasoning)
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to parse classification response: {}", llmResponse, e);
            throw new RuntimeException("Invalid LLM classification response format", e);
        }
    }

    public JsonNode parseJsonResponse(String llmResponse) {
        try {
            String jsonContent = extractJsonFromResponse(llmResponse);
            return objectMapper.readTree(jsonContent);
        } catch (Exception e) {
            log.error("Failed to parse JSON response: {}", llmResponse, e);
            throw new RuntimeException("Invalid JSON response format", e);
        }
    }

    private String extractJsonFromResponse(String response) {
        String trimmed = response.trim();
        
        int jsonStart = trimmed.indexOf('{');
        int jsonEnd = trimmed.lastIndexOf('}');
        
        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
            return trimmed.substring(jsonStart, jsonEnd + 1);
        }
        
        return trimmed;
    }

	public boolean isAffirmativeReply(String userReply) {
		String trimmedReply = userReply == null ? "" : userReply.trim();

		if (trimmedReply.isEmpty()) {
			return false;
		}

        String prompt = """
                You are a classifier that decides whether a short user reply is AFFIRMATIVE or NOT.

                - AFFIRMATIVE means the user confirms, agrees, or wants to proceed
                    (e.g. "yes", "yeah", "yep", "sure", "correct", "right", "agree",
                    "proceed", "go ahead", "confirm", "confirmed", "alright",
                    "ok", "okay", "fine", "sounds good", "that's fine", "i would like to proceed",
                    "let's go", "looks good", "all good",
                    "indeed", "exactly", "absolutely", "perfect", "that works", "works for me").
                - NOT AFFIRMATIVE means the user disagrees, rejects, corrects, or wants a change
                    (e.g. "no", "nope", "nah", "not really", "don't agree", "do not agree",
                    "wrong", "change", "another", "different", "disagree", "stop",
                    "cancel", "that's not", "isn't correct", "is not correct",
                    "no, thanks", "no thanks", "rather not").

                Respond ONLY with a JSON object in this exact format:
                { "affirmative": true }  or  { "affirmative": false }

                User reply: "%s"
                """.formatted(trimmedReply);

        String llmResponse = generateResponse(prompt);
        JsonNode json = parseJsonResponse(llmResponse);

        if (json.has("affirmative")) {
            return json.get("affirmative").asBoolean();
        }

        // fallback
        return false;
		
	}
}
