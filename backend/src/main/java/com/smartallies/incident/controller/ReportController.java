package com.smartallies.incident.controller;

import com.smartallies.incident.dto.IncidentReportResponse;
import com.smartallies.incident.dto.SubmitReportRequest;
import com.smartallies.incident.model.ReportStatus;
import com.smartallies.incident.service.IncidentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final IncidentReportService reportService;

    @PostMapping("/submit")
    public ResponseEntity<IncidentReportResponse> submitReport(
            @Valid @RequestBody SubmitReportRequest request) {
        log.info("Received report submission request for session: {}", request.getSessionId());
        
        IncidentReportResponse response = reportService.submitReport(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<IncidentReportResponse> getReport(@PathVariable String reportId) {
        log.info("Retrieving report: {}", reportId);
        
        return reportService.getReport(reportId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<IncidentReportResponse> updateStatus(
            @PathVariable String reportId,
            @RequestParam ReportStatus status) {
        log.info("Updating report {} status to: {}", reportId, status);
        
        try {
            IncidentReportResponse response = reportService.updateReportStatus(reportId, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
