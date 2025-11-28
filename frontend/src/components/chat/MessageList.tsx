import type { ChatMessage } from '@/types/incident.types';
import { cn } from '@/utils/helpers';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/80 via-orange-50/40 to-white/60 px-6 py-5 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500 bg-white/70 border border-dashed border-orange-100/80 rounded-xl p-6">
          The assistant will greet you here. Share details, attach images, or use quick actions to begin.
        </div>
      ) : null}
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
              'max-w-[80%] rounded-2xl px-5 py-3 shadow-md border',
              message.role === 'user'
                ? 'bg-gradient-to-r from-primary to-orange-500 text-white border-transparent'
                : 'bg-white/90 border-orange-100 text-slate-900'
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
              <span>
                {message.role === 'user' ? 'You' : 'SmartAllies Assistant'}
              </span>
              <span className="text-[10px]">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Attached"
                className="mb-3 rounded-lg max-w-full h-auto border border-orange-100/80"
              />
            )}
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
