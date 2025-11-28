import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatWorkflow } from '@/hooks/useChatWorkflow';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ActionButtons } from './ActionButtons';
import { FloorPlanSelector } from '@/components/floor-plan/FloorPlanSelector';
import { HRChatInterface } from '@/components/hr/HRChatInterface';
import { SamaritanChatInterface } from '@/components/samaritan/SamaritanChatInterface';
import { IncidentType, WorkflowState } from '@/types/incident.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiService } from '@/services/api.service';
import type { HRSession } from '@/types/hr.types';
import type { SamaritanSession } from '@/types/samaritan.types';
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
  const [samaritanSession, setSamaritanSession] = useState<SamaritanSession | null>(null);
  const [isConnectingSamaritan, setIsConnectingSamaritan] = useState(false);
  const [showSamaritanAlert, setShowSamaritanAlert] = useState(false);
  const [_latestFloorSelection, setLatestFloorSelection] = useState<FloorPlanSelection | null>(null);
  const [_facilityDetails, setFacilityDetails] = useState('');
  const [_facilityImage, setFacilityImage] = useState<File | null>(null);
  const [_facilityImagePreview, setFacilityImagePreview] = useState<string | null>(null);
  const [_facilityDetailsSaved, setFacilityDetailsSaved] = useState(false);
  const [_facilityDetailsError, setFacilityDetailsError] = useState<string | null>(null);

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

  const connectToSamaritan = async () => {
    setIsConnectingSamaritan(true);
    setShowSamaritanAlert(false);
    try {
      const response = await apiService.connectToSamaritan({ sessionId });
      setSamaritanSession({
        connected: response.connected,
        samaritanName: response.samaritanName,
        samaritanImage: response.samaritanImage,
        message: response.message,
      });
    } catch (error) {
      console.error('Failed to connect to Samaritan:', error);
      alert('Failed to connect to emergency Samaritan. Please try again.');
    } finally {
      setIsConnectingSamaritan(false);
    }
  };

  useEffect(() => {
    if (currentResponse?.metadata?.connectToSamaritan && !samaritanSession && !isConnectingSamaritan && !showSamaritanAlert) {
      setShowSamaritanAlert(true);
    }
  }, [currentResponse?.metadata?.connectToSamaritan, samaritanSession, isConnectingSamaritan, showSamaritanAlert]);

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

  // const _handleFacilityImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFacilityImage(file);
  //     setFacilityDetailsSaved(false);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFacilityImagePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const _removeFacilityImage = () => {
  //   setFacilityImage(null);
  //   setFacilityImagePreview(null);
  //   setFacilityDetailsSaved(false);
  // };

  // const _handleSaveFacilityDetails = async () => {
  //   if (!latestFloorSelection) return;

  //   setIsSavingFacilityDetails(true);
  //   setFacilityDetailsError(null);

  //   try {
  //     let imageUrl: string | undefined;

  //     if (facilityImage) {
  //       // const uploadResult = await apiService.uploadImage(facilityImage);
  //     }

  //     await apiService.saveFacilityDetails({
  //       sessionId,
  //       details: facilityDetails.trim() || undefined,
  //       imageUrl,
  //       floor: latestFloorSelection.floor,
  //     });

  //     setFacilityDetailsSaved(true);
  //   } catch (error) {
  //     console.error('Failed to save facility details', error);
  //     setFacilityDetailsError('Could not save details. Please try again.');
  //   } finally {
  //     setIsSavingFacilityDetails(false);
  //   }
  // };

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
    (currentResponse?.incidentType === IncidentType.FACILITY &&
      currentResponse?.metadata?.requiredFields &&
      Array.isArray(currentResponse.metadata.requiredFields) &&
      (currentResponse.metadata.requiredFields as string[]).includes('where')) ||
    (currentResponse?.incidentType === IncidentType.EMERGENCY &&
      currentResponse?.metadata?.showFloorPlan === true);

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

  // const _shouldShowFacilityDetails =
  //   currentResponse?.incidentType === IncidentType.FACILITY && Boolean(latestFloorSelection);

  if (samaritanSession?.connected) {
    return (
      <SamaritanChatInterface
        sessionId={sessionId}
        samaritanSession={samaritanSession}
        initialMessage={samaritanSession.message}
        previousMessages={messages}
      />
    );
  }

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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-white via-orange-50/40 to-white">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute right-4 top-1/4 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-orange-50 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 mx-auto h-[520px] max-w-4xl bg-gradient-to-br from-orange-200/30 via-white/40 to-orange-100/30 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4 pb-32">
        <header className="sticky top-3 sm:top-5 z-30 flex items-center justify-between border border-white/70 bg-white/90 px-4 sm:px-6 py-3 sm:py-4 shadow-xl backdrop-blur-2xl rounded-2xl">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img src="/images/logo/SQ.svg" alt="SmartAllies logo" className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 drop-shadow-lg" />
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500/80 font-semibold">smart safety</p>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">SmartAlly Concierge</h1>
            </div>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 bg-orange-50/70 border border-orange-100 px-3 py-1.5 rounded-full shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            Live assistance ready
          </div>
        </header>

        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="col-span-2 bg-white/80 backdrop-blur-xl border border-orange-100 rounded-3xl shadow-[0_25px_80px_-45px_rgba(249,115,22,0.65)] px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-500/80 font-semibold">secure session</p>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Chat with confidence</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Encrypted updates, human-like guidance, and rapid escalation when you need it.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 shadow-lg">24/7 coverage</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 text-orange-700 bg-white/80 text-xs sm:text-sm font-semibold px-3 py-1.5 shadow-inner">Mobile-first</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 text-orange-700 bg-white/80 text-xs sm:text-sm font-semibold px-3 py-1.5 shadow-inner">Empathetic AI</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-3xl shadow-[0_25px_80px_-35px_rgba(249,115,22,0.9)] px-4 sm:px-5 py-4 sm:py-6 border border-white/20">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">session id</p>
              <p className="text-lg sm:text-xl font-bold mt-1 break-all">{sessionId}</p>
              <p className="text-sm text-white/80 mt-2">Use this if you need to reconnect or share context with responders.</p>
            </div>
          </div>

          <Card className="flex flex-col min-h-[70vh] sm:min-h-[75vh] overflow-hidden border border-orange-100/70 shadow-[0_30px_100px_-60px_rgba(0,0,0,0.45)] rounded-3xl bg-white/90 backdrop-blur-xl">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-orange-300 rounded-full" />
            <MessageList messages={messages} />

            {showFloorPlan ? (
              <div className="p-4 sm:p-6 border-t border-orange-100/80 bg-white/80 backdrop-blur-xl">
                <FloorPlanSelector onLocationSelect={handleLocationSelect} />
              </div>
            ) : null}

            {shouldShowActions && (
              <div className="border-t border-orange-100/70 bg-gradient-to-r from-white via-orange-50/60 to-white px-3 sm:px-6 py-4 sm:py-6">
                <ActionButtons
                  response={currentResponse}
                  onActionClick={handleActionClick}
                  isLoading={isLoading || isConnectingHR}
                />
              </div>
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
              <div className="border-t border-orange-100/70 p-3 sm:p-6 bg-white/80 backdrop-blur-xl space-y-3 sm:space-y-4">
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
            <div className="border-t border-orange-100/70 bg-gradient-to-r from-white via-orange-50/50 to-white px-3 sm:px-6 pb-6 pt-4 sm:pt-6 sticky bottom-0 backdrop-blur-xl">
              <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
            </div>
          </Card>
        </div>

        <AlertDialog open={showSamaritanAlert} onOpenChange={setShowSamaritanAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emergency First Aid Responder Available</AlertDialogTitle>
              <AlertDialogDescription>
                A trained first aid responder (Samaritan) is ready to assist you. They will guide you through the emergency situation via chat. Would you like to connect now?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={connectToSamaritan}>
                Connect to First Aid Responder
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
