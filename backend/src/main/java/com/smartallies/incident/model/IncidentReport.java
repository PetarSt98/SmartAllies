package com.smartallies.incident.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReport {
    
    private String reportId;
    private String sessionId;
    private IncidentType incidentType;
    private ReportStatus status;
    private String description;
    private Map<String, String> details;
    private String imageUrl;
    private String location;
    private String submittedBy;
    private boolean isAnonymous;
    private LocalDateTime submittedAt;
    private LocalDateTime lastUpdated;
}
