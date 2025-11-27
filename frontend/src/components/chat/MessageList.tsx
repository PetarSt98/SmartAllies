import type { ChatMessage } from '@/types/incident.types';
import { cn } from '@/utils/helpers';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-900'
            )}
          >
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Attached"
                className="mb-2 rounded max-w-full h-auto"
              />
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
