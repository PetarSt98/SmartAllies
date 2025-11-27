package com.smartallies.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitReportRequest {
    
    private String sessionId;
    private String submittedBy;
    private boolean anonymous;
    private String phoneNumber;
}
