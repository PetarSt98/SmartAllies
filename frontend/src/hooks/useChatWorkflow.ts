import { useState, useCallback } from 'react';
import { apiService } from '@/services/api.service';
import { generateSessionId } from '@/utils/helpers';
import type { ChatMessage, ChatResponse } from '@/types/incident.types';

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
    async (content: string, imageUrl?: string) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        imageUrl,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await apiService.sendMessage({
          sessionId,
          message: content,
          imageUrl,
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
        setMessages((prev) => [...prev, errorMessage]);
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
