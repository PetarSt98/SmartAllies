package com.smartallies.incident.service;

import com.smartallies.incident.dto.IncidentReportResponse;
import com.smartallies.incident.dto.SubmitReportRequest;
import com.smartallies.incident.model.ConversationContext;
import com.smartallies.incident.model.IncidentReport;
import com.smartallies.incident.model.ReportStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentReportService {

    private final Map<String, IncidentReport> reportStore = new ConcurrentHashMap<>();
    private final ConversationContextService contextService;

    public IncidentReportResponse submitReport(SubmitReportRequest request) {
        log.info("Submitting report for session: {}", request.getSessionId());
        
        ConversationContext context = contextService.getContext(request.getSessionId());
        if (context == null) {
            throw new IllegalArgumentException("Session not found: " + request.getSessionId());
        }

        String reportId = UUID.randomUUID().toString();
        
        IncidentReport report = IncidentReport.builder()
                .reportId(reportId)
                .sessionId(request.getSessionId())
                .incidentType(context.getIncidentType())
                .status(ReportStatus.SUBMITTED)
                .description(context.getInitialMessage())
                .details(context.getCollectedFields())
                .imageUrl(context.getImageUrl())
                .location(context.getField("where"))
                .submittedBy(request.isAnonymous() ? "Anonymous" : request.getSubmittedBy())
                .isAnonymous(request.isAnonymous())
                .submittedAt(LocalDateTime.now())
                .lastUpdated(LocalDateTime.now())
                .build();

        reportStore.put(reportId, report);
        
        log.info("Report submitted successfully: {}", reportId);
        
        return mapToResponse(report);
    }

    public Optional<IncidentReportResponse> getReport(String reportId) {
        log.info("Retrieving report: {}", reportId);
        return Optional.ofNullable(reportStore.get(reportId))
                .map(this::mapToResponse);
    }

    public IncidentReportResponse updateReportStatus(String reportId, ReportStatus newStatus) {
        log.info("Updating report {} to status: {}", reportId, newStatus);
        
        IncidentReport report = reportStore.get(reportId);
        if (report == null) {
            throw new IllegalArgumentException("Report not found: " + reportId);
        }

        report.setStatus(newStatus);
        report.setLastUpdated(LocalDateTime.now());
        
        return mapToResponse(report);
    }

    private IncidentReportResponse mapToResponse(IncidentReport report) {
        return IncidentReportResponse.builder()
                .reportId(report.getReportId())
                .incidentType(report.getIncidentType())
                .status(report.getStatus())
                .description(report.getDescription())
                .details(report.getDetails())
                .imageUrl(report.getImageUrl())
                .location(report.getLocation())
                .submittedBy(report.getSubmittedBy())
                .anonymous(report.isAnonymous())
                .submittedAt(report.getSubmittedAt())
                .lastUpdated(report.getLastUpdated())
                .build();
    }
}
