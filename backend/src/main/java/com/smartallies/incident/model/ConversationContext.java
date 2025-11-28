package com.smartallies.incident.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationContext {
    
    private String sessionId;
    private WorkflowState workflowState;
    private IncidentType incidentType;
    private String initialMessage;
    private String imageUrl;
    private Double classificationConfidence;
    private boolean hrDecisionMade;
    
    @Builder.Default
    private Map<String, String> collectedFields = new HashMap<>();
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public void updateField(String fieldName, String value) {
        collectedFields.put(fieldName, value);
        updatedAt = LocalDateTime.now();
    }
    
    public String getField(String fieldName) {
        return collectedFields.get(fieldName);
    }
    
    public boolean hasField(String fieldName) {
        return collectedFields.containsKey(fieldName) && 
               collectedFields.get(fieldName) != null && 
               !collectedFields.get(fieldName).trim().isEmpty();
    }
}
