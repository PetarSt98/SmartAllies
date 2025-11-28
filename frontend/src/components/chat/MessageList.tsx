import type { ChatMessage } from '@/types/incident.types';
import { cn } from '@/utils/helpers';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gradient-to-b from-white/80 via-white/70 to-transparent">
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
              'max-w-[80%] rounded-2xl px-5 py-3 shadow-md border border-white/50 backdrop-blur-sm',
              message.role === 'user'
                ? 'bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-900'
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
            <span className={cn(
              'text-[11px] mt-2 block',
              message.role === 'user' ? 'text-white/80' : 'text-gray-500'
            )}>
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
