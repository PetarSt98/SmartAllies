import { useState, useCallback } from 'react';
import { apiService } from '@/services/api.service';
import { generateSessionId } from '@/utils/helpers';
import type { ChatMessage, ChatResponse } from '@/types/incident.types';
import type { FloorPlanSelection } from '@/types/floor-plan.types';

interface SendMessageOptions {
  imageUrl?: string;
  imagePreview?: string;
  floorPlanSelection?: FloorPlanSelection;
}

export function useChatWorkflow() {
  const createInitialMessages = useCallback(
    () => [
      {
        id: '1',
        role: 'assistant',
        content: "Hello! How can I assist you today?",
        timestamp: new Date(),
      } as ChatMessage,
    ],
    []
  );

  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>(createInitialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ChatResponse | null>(null);

  const sendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      setIsLoading(true);

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        imageUrl: options?.imageUrl || options?.imagePreview,
        floorPlanSelection: options?.floorPlanSelection,
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await apiService.sendMessage({
          sessionId,
          message: content,
          imageUrl: options?.imageUrl,
        });

        setCurrentResponse(response);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const resetChat = useCallback(() => {
    setSessionId(generateSessionId());
    setMessages(createInitialMessages());
    setCurrentResponse(null);
    setIsLoading(false);
  }, [createInitialMessages]);

  return {
    messages,
    isLoading,
    currentResponse,
    sendMessage,
    sessionId,
    resetChat,
  };
}
