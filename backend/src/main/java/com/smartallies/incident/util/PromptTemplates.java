package com.smartallies.incident.util;

import com.smartallies.incident.model.IncidentType;

import java.util.Map;

public class PromptTemplates {

    public static final String SYSTEM_PROMPT = "You are an HR assistant that answers concisely and uses an empathetic and understanding tone.";

    private static final String CLASSIFICATION_PROMPT_V1 = """
            I need your help understanding what type of incident this is so I can assist you better.
            
            Based on what you've shared, I'll determine if this relates to:
            - HUMAN: Issues involving people - like harassment, discrimination, bullying, conflicts, or workplace behavior concerns
            - FACILITY: Problems with the physical space or equipment - damage, maintenance needs, safety hazards, or broken things
            - EMERGENCY: Urgent situations needing immediate help - medical emergencies, mental health crises, fires, security threats, or any life-threatening situation
            
            Here's what you told me: {message}
            You've also shared an image: {hasImage}
            
            Please respond with your assessment in this JSON format:
            {
              "type": "HUMAN" or "FACILITY" or "EMERGENCY",
              "confidence": 0.85,
              "reasoning": "Explain in a natural, conversational way why you think this fits this category"
            }
            
            Important: For the reasoning, write as if you're talking to someone directly - not analyzing data. Use "you" and "your" and be warm and understanding.
            """;

    private static final String HUMAN_INCIDENT_DETAILS_PROMPT = """
            You are a supportive HR assistant helping an employee report a sensitive human-related incident.
            Use an empathetic, calm, and understanding tone at all times.
            
            Current conversation context:
            Initial incident message: {initialMessage}
            User's latest message: {userMessage}
            
            The user needs to provide these details:
            - What: Detailed description of what happened
            - When: Date and time of the incident
            - Where: Location where it occurred
            - Who: Person/people involved in causing the incident
            
            Already collected fields: {collectedFields}
            
            Extract information from BOTH the initial message AND the latest message to fill in missing fields.
            Then respond with helpful guidance to collect any mandatory remaining information.
            Never pressure the user, but guide them clearly and compassionately.
            
            Respond ONLY with valid JSON. CRITICAL: Ensure ALL commas between object properties are present.
            
            Format (check commas carefully):
            {
              "extractedFields": {
                "what": "extracted value or null",
                "when": "extracted value or null",
                "where": "extracted value or null",
                "who": "extracted value or null"
              },
              "message": "Your empathetic response asking for missing information",
              "allFieldsCollected": true
            }
            
            Remember: Each line in extractedFields needs a comma EXCEPT the last property "who".
            """;

    private static final String HUMAN_INCIDENT_COLLECTING_DETAILS_PROMPT = """
            You are a supportive HR assistant helping someone report a human incident.
            Use an empathetic and understanding tone.
            
            Current conversation context:
            Initial incident: {initialMessage}
            
            The user needs to provide these details:
            - What: Detailed description of what happened
            - When: Date and time of the incident
            - Where: Location where it occurred
            - Who: Person/people involved in causing the incident
            
            Respond ONLY with a follow-up question to ask the user in order to get the details.
            """;

    private static final String FACILITY_INCIDENT_DETAILS_PROMPT = """
            You are an assistant helping report a facility incident.
            
            Current conversation context:
            Initial incident message: {initialMessage}
            User's latest message: {userMessage}
            
            The user needs to provide these mandatory details:
            - What: Detailed description of the facility issue
            - Where: Location (will be pinned on floor plan)
            - Picture: Photo of the issue (optional but recommended)
            
            Already collected fields: {collectedFields}
            
            Extract information from BOTH the initial message AND the latest message to fill in missing fields.
            
            CRITICAL: Respond with valid JSON. Ensure commas are between ALL properties.
            
            Format:
            {
              "extractedFields": {
                "what": "extracted value or null",
                "where": "extracted value or null"
              },
              "message": "Your response asking for missing information",
              "allFieldsCollected": true
            }
            """;

    private static final String EMERGENCY_DETAILS_PROMPT = """
            You are responding to an EMERGENCY situation. Be direct and clear.
            
            Current conversation context:
            Initial emergency report: {initialMessage}
            User's latest message: {userMessage}
            
            Critical information needed:
            - Location: Where is the emergency? (MANDATORY)
            - Person in distress: Name of the person who needs help
            - Condition: Current state/medical condition
            
            Already collected fields: {collectedFields}
            
            Extract information from BOTH the initial message AND the latest message.
            Guide the user urgently but calmly to provide missing critical information.
            
            CRITICAL: Respond with valid JSON. Check commas between properties.
            
            Format:
            {
              "extractedFields": {
                "location": "extracted value or null",
                "personName": "extracted value or null",
                "condition": "extracted value or null"
              },
              "message": "Your urgent but calm response",
              "hasLocation": true
            }
            """;

    public static String buildClassificationPrompt(String message, boolean hasImage) {
        return CLASSIFICATION_PROMPT_V1
                .replace("{message}", message)
                .replace("{hasImage}", String.valueOf(hasImage));
    }

    public static String buildDetailsCollectionPrompt(
            IncidentType type,
            String initialMessage,
            Map<String, String> collectedFields,
            String userMessage
    ) {
        String template = switch (type) {
            case HUMAN -> HUMAN_INCIDENT_DETAILS_PROMPT;
            case FACILITY -> FACILITY_INCIDENT_DETAILS_PROMPT;
            case EMERGENCY -> EMERGENCY_DETAILS_PROMPT;
        };

        return template
                .replace("{initialMessage}", initialMessage)
                .replace("{collectedFields}", collectedFields.toString())
                .replace("{userMessage}", userMessage);
    }

    public static String buildDetailsCollectionPrompt(String initialMessage) {
        return HUMAN_INCIDENT_COLLECTING_DETAILS_PROMPT.replace("{initialMessage}", initialMessage);
    }

    public static String buildReportSummaryPrompt(
            IncidentType type,
            String initialMessage,
            Map<String, String> fields
    ) {
        return String.format("""
                Generate a professional incident report summary based on this information:
                
                Incident Type: %s
                Initial Description: %s
                Collected Details: %s
                
                Create a clear, concise summary suitable for official reporting.
                
                Respond ONLY with valid JSON:
                {
                  "summary": "Your professional summary here"
                }
                """, type, initialMessage, fields.toString());
    }
}
