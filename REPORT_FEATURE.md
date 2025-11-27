# Report Submission & Viewing Feature

## ✅ Implementation Complete

### Backend Changes

#### New Models
- **`ReportStatus.java`** - Enum with 4 stages: SUBMITTED → ACKNOWLEDGED → INVESTIGATION → CLOSED
- **`IncidentReport.java`** - Complete report entity with all incident details

#### New DTOs
- **`SubmitReportRequest.java`** - Request to submit a report
- **`IncidentReportResponse.java`** - Report response with all details

#### New Service
- **`IncidentReportService.java`** - In-memory storage for reports
  - `submitReport()` - Create and store new report
  - `getReport()` - Retrieve report by ID
  - `updateReportStatus()` - Update report status

#### New Controller
- **`ReportController.java`** - REST endpoints
  - `POST /api/reports/submit` - Submit new report
  - `GET /api/reports/{reportId}` - Get report by ID
  - `PUT /api/reports/{reportId}/status` - Update status

### Frontend Changes

#### New Types
- **`report.types.ts`** - TypeScript interfaces for reports

#### New Components
- **`StatusTimeline.tsx`** - Visual timeline showing current status with 4 stages
- **`ReportPage.tsx`** - Full report view page showing all details
- **`SubmitReportDialog.tsx`** - Dialog for submitting reports (with name/anonymous options)

#### Updated Components
- **`ChatInterface.tsx`** - Added submit buttons when report is ready
- **`App.tsx`** - Added React Router with routes for chat and report pages
- **`api.service.ts`** - Added `submitReport()` and `getReport()` methods

### Features Implemented

#### 1. Report Submission
- Users can submit reports from the chat interface
- Choice between:
  - **Submit** (with name)
  - **Submit Anonymously**
  - **Cancel**
- Optional phone number field (for Facility incidents)

#### 2. Report Status Tracking
- 4-stage status system with visual timeline:
  1. **SUBMITTED** - Report created
  2. **ACKNOWLEDGED** - Report reviewed
  3. **INVESTIGATION** - Under investigation
  4. **CLOSED** - Resolved
- Visual indicators:
  - Completed stages: Green with checkmark
  - Current stage: Highlighted in primary color
  - Future stages: Gray

#### 3. Unique Report URLs
- Each report has a unique ID: `/report/{reportId}`
- Shareable link - anyone can view with the URL
- Persists in backend memory during runtime

#### 4. Report Details Display
Based on incident type, the report page shows:

**All Incidents:**
- Incident type
- Description
- Submitted by (or "Anonymous")
- Submission timestamp
- Current status timeline

**Facility Incidents:**
- Floor plan location
- Attached image
- Additional collected fields

**Human Incidents:**
- Who/What/When/Where details
- Resources accessed

### API Endpoints

```
POST /api/reports/submit
Body: {
  "sessionId": "string",
  "submittedBy": "string" (optional),
  "anonymous": boolean,
  "phoneNumber": "string" (optional)
}
Response: IncidentReportResponse

GET /api/reports/{reportId}
Response: IncidentReportResponse

PUT /api/reports/{reportId}/status?status=ACKNOWLEDGED
Response: IncidentReportResponse
```

### Usage Flow

1. **User completes incident report in chat**
2. **Bot presents submit options** (Submit / Submit Anonymously / Cancel)
3. **User clicks submit button**
4. **Submit dialog appears** asking for name (optional) and phone (optional for Facility)
5. **User submits**
6. **Frontend navigates to** `/report/{reportId}`
7. **Report page displays** all incident details with status timeline
8. **URL can be shared** with managers/HR to view report

### Next Steps (Optional Enhancements)

- [ ] Add backend persistence (database instead of in-memory)
- [ ] Email notifications when status changes
- [ ] Admin panel to manage reports and update statuses
- [ ] Filter/search reports by type, status, date
- [ ] Export reports to PDF
- [ ] Add comments/notes to reports
- [ ] File attachments (multiple images/documents)

### Testing

**Submit a Report:**
1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Complete an incident report in chat
4. Click "Submit Report" or "Submit Anonymously"
5. Fill in details (optional)
6. Submit
7. View report page at `/report/{reportId}`

**View Report Status:**
- Note the report ID from URL
- Status timeline shows current stage
- Share URL with others to view

**Update Status (via API):**
```bash
curl -X PUT "http://localhost:8080/api/reports/{reportId}/status?status=ACKNOWLEDGED"
```

---

## Configuration

No additional configuration needed. The feature works with existing:
- Ollama configuration
- CORS settings
- Spring Boot setup

## Build Status

✅ Backend compiled successfully
✅ Frontend built successfully
✅ All TypeScript types validated
✅ React Router configured
✅ API endpoints tested

