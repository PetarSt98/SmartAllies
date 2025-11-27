import type { ChatMessage } from '@/types/incident.types';
import { cn } from '@/utils/helpers';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-orange-50/30 to-white px-6 py-5">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
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
                'relative max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ring-1',
                message.role === 'user'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-orange-200/70 shadow-[0_14px_40px_rgba(249,91,53,0.35)]'
                  : 'bg-white text-slate-900 ring-orange-100/70'
              )}
            >
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Attached"
                  className="mb-3 max-h-72 w-full max-w-full rounded-xl border border-orange-100 object-cover"
                />
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <span
                className={cn(
                  'mt-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]',
                  message.role === 'user' ? 'text-orange-50/80' : 'text-orange-600'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
