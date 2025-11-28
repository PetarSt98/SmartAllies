import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HRMessageBubble } from './HRMessageBubble';
import { apiService } from '@/services/api.service';
import { cn } from '@/utils/helpers';
import type { HRSession } from '@/types/hr.types';
import type { ChatMessage } from '@/types/incident.types';
import { Send } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface HRChatInterfaceProps {
  sessionId: string;
  hrSession: HRSession;
  initialMessage?: string;
  previousMessages?: ChatMessage[];
}

export function HRChatInterface({ 
  sessionId, 
  hrSession, 
  initialMessage,
  previousMessages = []
}: HRChatInterfaceProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hrMessages: Message[] = [];
    
    if (initialMessage) {
      hrMessages.push({
        text: initialMessage,
        isUser: false,
        timestamp: new Date(),
      });
    }
    
    setMessages(hrMessages);
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || sessionEnded) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    setMessages((prev) => [
      ...prev,
      { text: userMessage, isUser: true, timestamp: new Date() },
    ]);

    setIsLoading(true);

    try {
      const response = await apiService.sendHRMessage({
        sessionId,
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { text: response.message, isUser: false, timestamp: new Date() },
      ]);

      if (response.sessionEnded && response.ticketId) {
        setSessionEnded(true);
        setTicketId(response.ticketId);
      }
    } catch (error) {
      console.error('Failed to send HR message:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, there was an error. Please try again.',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-orange-50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6 h-full">
        <header className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-xl backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            {hrSession.hrPartnerImage && (
              <img
                src={hrSession.hrPartnerImage}
                alt={hrSession.hrPartnerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">HR Partner: {hrSession.hrPartnerName}</h1>
              <p className="text-sm text-gray-600">Confidential, human support</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Card className="flex flex-col h-full border-orange-100/70 shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-orange-300 flex-shrink-0" />
            <div className="flex-1 overflow-y-auto p-6 pb-48 sm:pb-64 bg-gradient-to-b from-white/85 via-white/70 to-transparent space-y-4 min-h-0">
              {previousMessages.length > 0 && (
                <>
                  <div className="mb-4 pb-4 border-b border-orange-100/80">
                    <p className="text-xs text-gray-500 mb-3 text-center uppercase tracking-wide">Previous Conversation</p>
                    {previousMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex mb-4',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-5 py-3 shadow-md border border-white/50 backdrop-blur-sm',
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg'
                              : 'bg-white/90 text-gray-900'
                          )}
                        >
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Attached"
                              className="mb-2 rounded max-w-full h-auto"
                            />
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <span className="text-[11px] mt-2 block text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-primary text-center bg-orange-50 py-2 rounded-full font-semibold">
                      Now connected with HR Partner: {hrSession.hrPartnerName}
                    </p>
                  </div>
                </>
              )}

              {messages.map((msg, index) => (
                <HRMessageBubble
                  key={index}
                  message={msg.text}
                  isUser={msg.isUser}
                  hrPartnerName={!msg.isUser ? hrSession.hrPartnerName : undefined}
                  hrPartnerImage={!msg.isUser ? hrSession.hrPartnerImage : undefined}
                  timestamp={msg.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {sessionEnded && ticketId && (
              <div className="bg-green-50/90 border-t border-green-200 p-4 pb-48 sm:pb-8 backdrop-blur space-y-3 flex-shrink-0">
                <p className="text-green-800 text-center font-medium">
                  Your conversation has ended. A ticket has been created for your incident.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate(`/report/${ticketId}`)}
                    className="shadow-lg"
                  >
                    View Ticket
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                  >
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {!sessionEnded && (
          <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-safe flex-shrink-0">
            <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border-t border-orange-100/60 rounded-2xl shadow-lg pb-4 sm:pb-6">
              <div className="border-t border-orange-100/70 p-5 bg-white/80 backdrop-blur">
                <div className="flex gap-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading || sessionEnded}
                    className="flex-1 shadow-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim() || sessionEnded}
                    size="icon"
                    className="shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
