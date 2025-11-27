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

		try {
			String prompt = """
					You are a classifier that decides whether a short user reply is AFFIRMATIVE or NOT.
					
					- AFFIRMATIVE means the user confirms, agrees, or wants to proceed
					  (e.g. "yes", "yes, that works", "proceed", "I agree", "correct", "that's fine", "go ahead").
					- NOT AFFIRMATIVE means the user disagrees, rejects, corrects, or wants a change
					  (e.g. "no", "not really", "that's wrong", "I don't agree", "let's change it", "no, pick another").
					
					You must also estimate your confidence in your classification between 0 and 1.
					
					Respond ONLY with a JSON object in this exact format:
					{
					  "affirmative": true | false,
					  "confidence": 0.0 - 1.0
					}
					
					Be conservative: if you are not clearly sure it is affirmative,
					set "affirmative" to false and lower confidence.
					
					User reply: "%s"
					""".formatted(trimmedReply);

			String llmResponse = generateResponse(prompt);
			JsonNode json = parseJsonResponse(llmResponse);

			if (json.has("affirmative")) {
				boolean affirmative = json.get("affirmative").asBoolean();
				double confidence = json.has("confidence") ? json.get("confidence").asDouble() : 0.0;

				if (affirmative && confidence >= 0.85) {
					return true;
				}

				if (!affirmative && confidence >= 0.85) {
					return false;
				}

				return fallbackAffirmativeHeuristic(trimmedReply.toLowerCase());
			}

			return fallbackAffirmativeHeuristic(trimmedReply.toLowerCase());
		}
		catch (Exception e) {
			log.warn("Falling back to heuristic affirmative detection for reply: {}", trimmedReply, e);
			return fallbackAffirmativeHeuristic(trimmedReply.toLowerCase());
		}
	}

	private boolean fallbackAffirmativeHeuristic(String replyLower) {
		String[] positiveKeywords = {
				"yes", "yeah", "yep", "sure", "correct", "right", "agree",
				"proceed", "go ahead", "confirm", "confirmed", "alright",
				"ok", "okay", "fine", "sounds good", "that's fine", "i would like to proceed",
				"let's go", "looks good", "all good"
		};

		String[] negativeKeywords = {
				"no", "nope", "nah", "not really", "don't agree", "do not agree",
				"wrong", "change", "another", "different", "disagree", "stop",
				"cancel", "that's not", "isn't correct", "is not correct"
		};

		for (String neg : negativeKeywords) {
			if (replyLower.contains(neg)) {
				return false;
			}
		}

		for (String pos : positiveKeywords) {
			if (replyLower.contains(pos)) {
				return true;
			}
		}

		return false;
	}
}
