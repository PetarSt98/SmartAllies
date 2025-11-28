import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatWorkflow } from '@/hooks/useChatWorkflow';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ActionButtons } from './ActionButtons';
import { FloorPlanSelector } from '@/components/floor-plan/FloorPlanSelector';
import { HRChatInterface } from '@/components/hr/HRChatInterface';
import { IncidentType, WorkflowState } from '@/types/incident.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/api.service';
import type { HRSession } from '@/types/hr.types';
import type { FloorPlanSelection } from '@/types/floor-plan.types';

export function ChatInterface() {
  const navigate = useNavigate();
  const { messages, isLoading, currentResponse, sendMessage, sessionId, resetChat } = useChatWorkflow();
  const [submissionMode, setSubmissionMode] = useState<'anonymous' | 'identified' | null>(null);
  const [submittedBy, setSubmittedBy] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [hrSession, setHrSession] = useState<HRSession | null>(null);
  const [isConnectingHR, setIsConnectingHR] = useState(false);
  const [latestFloorSelection, setLatestFloorSelection] = useState<FloorPlanSelection | null>(null);
  const [facilityDetails, setFacilityDetails] = useState('');
  const [facilityImage, setFacilityImage] = useState<File | null>(null);
  const [facilityImagePreview, setFacilityImagePreview] = useState<string | null>(null);
  const [facilityDetailsSaved, setFacilityDetailsSaved] = useState(false);
  const [facilityDetailsError, setFacilityDetailsError] = useState<string | null>(null);
  const [isSavingFacilityDetails, setIsSavingFacilityDetails] = useState(false);

  const handleActionClick = async (action: string) => {
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('connect') && lowerAction.includes('hr')) {
      await connectToHR();
    } else {
      sendMessage(action);
    }
  };

  const connectToHR = async () => {
    setIsConnectingHR(true);
    try {
      const response = await apiService.connectToHR({ sessionId });
      setHrSession({
        connected: response.connected,
        hrPartnerName: response.hrPartnerName,
        hrPartnerImage: response.hrPartnerImage,
        message: response.message,
      });
    } catch (error) {
      console.error('Failed to connect to HR:', error);
      alert('Failed to connect to HR partner. Please try again.');
    } finally {
      setIsConnectingHR(false);
    }
  };

  const handleLocationSelect = (selection: FloorPlanSelection) => {
    const location = `Floor plan location: ${selection.floorLabel}, X: ${selection.x.toFixed(1)}%, Y: ${selection.y.toFixed(1)}%`;
    setLatestFloorSelection(selection);
    setFacilityDetails('');
    setFacilityImage(null);
    setFacilityImagePreview(null);
    setFacilityDetailsSaved(false);
    setFacilityDetailsError(null);
    sendMessage(location, { floorPlanSelection: selection });
  };

  const handleFacilityImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFacilityImage(file);
      setFacilityDetailsSaved(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacilityImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFacilityImage = () => {
    setFacilityImage(null);
    setFacilityImagePreview(null);
    setFacilityDetailsSaved(false);
  };

  const handleSaveFacilityDetails = async () => {
    if (!latestFloorSelection) return;

    setIsSavingFacilityDetails(true);
    setFacilityDetailsError(null);

    try {
      let imageUrl: string | undefined;

      if (facilityImage) {
        // const uploadResult = await apiService.uploadImage(facilityImage);
      }

      await apiService.saveFacilityDetails({
        sessionId,
        details: facilityDetails.trim() || undefined,
        imageUrl,
        floor: latestFloorSelection.floor,
      });

      setFacilityDetailsSaved(true);
    } catch (error) {
      console.error('Failed to save facility details', error);
      setFacilityDetailsError('Could not save details. Please try again.');
    } finally {
      setIsSavingFacilityDetails(false);
    }
  };

  const handleSubmitReport = async (anonymous: boolean) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const report = await apiService.submitReport({
        sessionId,
        anonymous,
        submittedBy: anonymous ? undefined : submittedBy.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setSubmittedReportId(report.reportId);
      setSubmissionMode(null);
    } catch (error) {
      console.error('Failed to submit report:', error);
      setSubmissionError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSubmissionMode(null);
    setSubmittedBy('');
    setPhoneNumber('');
    setSubmissionError(null);
    setSubmittedReportId(null);
    setLatestFloorSelection(null);
    setFacilityDetails('');
    setFacilityImage(null);
    setFacilityImagePreview(null);
    setFacilityDetailsSaved(false);
    setFacilityDetailsError(null);
    resetChat();
  };



  const showFloorPlan =
    currentResponse?.incidentType === IncidentType.FACILITY &&
    currentResponse?.metadata?.requiredFields &&
    Array.isArray(currentResponse.metadata.requiredFields) &&
    (currentResponse.metadata.requiredFields as string[]).includes('where');

  const showHROptions =
    currentResponse?.workflowState === WorkflowState.AWAITING_HR_DECISION &&
    currentResponse?.incidentType === IncidentType.HUMAN;

  const canSubmit =
    currentResponse?.workflowState === WorkflowState.REPORT_READY &&
    (currentResponse?.incidentType === IncidentType.HUMAN ||
      currentResponse?.incidentType === IncidentType.FACILITY);

  const submissionComplete = Boolean(submittedReportId);

  const shouldShowActions =
    !!currentResponse?.suggestedActions?.length && !canSubmit && !submissionComplete && !showHROptions;

  const shouldShowFacilityDetails =
    currentResponse?.incidentType === IncidentType.FACILITY && Boolean(latestFloorSelection);

  if (hrSession?.connected) {
    return (
      <HRChatInterface
        sessionId={sessionId}
        hrSession={hrSession}
        initialMessage={hrSession.message}
        previousMessages={messages}
      />
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-6xl mx-auto w-full">
        <header className="sticky top-0 z-20 flex items-center border-b border-white/60 bg-white/80 px-4 sm:px-5 py-3 sm:py-4 shadow-lg backdrop-blur-md sm:mx-4 sm:mt-4 sm:rounded-2xl sm:border flex-shrink-0">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo/SQ.svg" alt="SmartAllies logo" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
            <h1 className="text-base sm:text-xl font-semibold text-gray-900 whitespace-nowrap">SmartAlly</h1>
          </button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 sm:px-4 overflow-y-auto pb-2 pt-20 sm:pt-0">
          <Card className="flex-1 flex flex-col overflow-hidden border-0 sm:border sm:border-orange-100/70 shadow-none sm:shadow-2xl rounded-none sm:rounded-2xl mt-2 sm:mt-4">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-orange-300" />
            <MessageList messages={messages} />

            {showFloorPlan ? (
              <div className="p-3 sm:p-6 border-t border-orange-100/70 bg-white/60 backdrop-blur">
                <FloorPlanSelector onLocationSelect={handleLocationSelect} />
              </div>
            ) : null}

            {shouldShowActions && (
              <ActionButtons
                response={currentResponse}
                onActionClick={handleActionClick}
                isLoading={isLoading || isConnectingHR}
              />
            )}

            {showHROptions ? (
              <div className="border-t border-orange-100/70 p-3 sm:p-6 bg-gradient-to-r from-orange-50 to-white">
                <p className="text-sm text-gray-700 mb-3 text-center font-medium">
                  Would you like to share more details or connect with an HR partner?
                </p>
                <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row justify-center">
                  <Button
                    variant="outline"
                    onClick={() => sendMessage('Share more details')}
                    disabled={isLoading || isConnectingHR}
                    className="w-full sm:w-auto"
                  >
                    Share More Details
                  </Button>
                  <Button
                    onClick={() => handleActionClick('Connect to HR')}
                    disabled={isLoading || isConnectingHR}
                    className="w-full sm:w-auto"
                  >
                    Connect to HR Partner
                  </Button>
                </div>
              </div>
            ) : null}

            {canSubmit && !submissionComplete && (
              <div className="border-t border-orange-100/70 p-3 sm:p-6 bg-white/70 backdrop-blur space-y-3 sm:space-y-4">
                <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row justify-center">
                  <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSubmissionMode('anonymous')}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Submit Anonymously
                  </Button>
                  <Button
                    onClick={() => setSubmissionMode('identified')}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Submit Report
                  </Button>
                </div>

                {submissionMode === 'anonymous' && (
                  <div className="bg-white/80 border border-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 shadow-inner">
                    <p className="text-sm text-gray-700">
                      Submit anonymously? Your name and phone number will not be shared.
                    </p>
                    <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setSubmissionMode(null)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        Back
                      </Button>
                      <Button onClick={() => handleSubmitReport(true)} disabled={isSubmitting} className="w-full sm:w-auto">
                        Confirm Anonymous Submission
                      </Button>
                    </div>
                  </div>
                )}

                {submissionMode === 'identified' && (
                  <div className="bg-white/80 border border-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 shadow-inner">
                    <p className="text-sm text-gray-700">
                      Please share your name and an optional phone number so we can follow up.
                    </p>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Name</label>
                        <Input
                          value={submittedBy}
                          onChange={(e) => setSubmittedBy(e.target.value)}
                          placeholder="Enter your name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Phone Number (optional)</label>
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                          type="tel"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setSubmissionMode(null)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => handleSubmitReport(false)}
                        disabled={isSubmitting || !submittedBy.trim()}
                        className="w-full sm:w-auto"
                      >
                        Submit with Details
                      </Button>
                    </div>
                  </div>
                )}

                {submissionError && <p className="text-sm text-red-600 text-center">{submissionError}</p>}
              </div>
            )}

            {submissionComplete && submittedReportId && (
              <div className="border-t border-orange-100/70 p-3 sm:p-6 bg-green-50/80 backdrop-blur space-y-3">
                <p className="text-sm text-green-800 font-medium text-center">
                  Your report has been submitted. You can view it now or start a new conversation.
                </p>
                <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/report/${submittedReportId}`)}
                  >
                    View submitted report
                  </Button>
                  <Button onClick={handleCancel} variant="ghost">
                    Start new chat
                  </Button>
                </div>
              </div>
            )}

          </Card>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 z-20 sm:px-4 pb-safe flex-shrink-0">
          <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border-t border-white/60 sm:border sm:rounded-2xl shadow-lg pb-4 sm:pb-6">
            <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
