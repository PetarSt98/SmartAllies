package com.smartallies.incident.dto;

import com.smartallies.incident.model.IncidentType;
import com.smartallies.incident.model.ReportStatus;
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
public class IncidentReportResponse {
    
    private String reportId;
    private IncidentType incidentType;
    private ReportStatus status;
    private String description;
    private Map<String, String> details;
    private String imageUrl;
    private String location;
    private String submittedBy;
    private boolean anonymous;
    private LocalDateTime submittedAt;
    private LocalDateTime lastUpdated;
}
