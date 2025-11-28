import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/incident.types';
import { cn } from '@/utils/helpers';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-10 space-y-3 sm:space-y-4 bg-gradient-to-b from-white/85 via-white/75 to-orange-50/30 rounded-3xl sm:rounded-none">
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
              'max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-[0_18px_60px_-35px_rgba(0,0,0,0.45)] border border-white/60 backdrop-blur-sm text-sm sm:text-base transition-transform duration-200 hover:-translate-y-0.5',
              message.role === 'user'
                ? 'bg-gradient-to-br from-primary to-orange-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-900'
            )}
          >
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Attached"
                className="mb-2 rounded w-24 h-24 sm:w-28 sm:h-28 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.imageUrl, '_blank')}
              />
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.floorPlanSelection && (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/60 bg-white/70 shadow-sm">
                <div
                  className="relative aspect-[4/3] w-full bg-gray-100"
                  style={{
                    backgroundImage: `url('${message.floorPlanSelection.imagePath}')`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full drop-shadow"
                    style={{ left: `${message.floorPlanSelection.x}%`, top: `${message.floorPlanSelection.y}%` }}
                  >
                    <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary fill-primary" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 bg-white/80 gap-1">
                  <span className="font-semibold text-primary">Floor plan location</span>
                  <span className="text-xs">
                    {message.floorPlanSelection.floorLabel}, X: {message.floorPlanSelection.x.toFixed(1)}%, Y:{' '}
                    {message.floorPlanSelection.y.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            <span className={cn(
              'text-[10px] sm:text-[11px] mt-1.5 sm:mt-2 block',
              message.role === 'user' ? 'text-white/80' : 'text-gray-500'
            )}>
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="pb-28 sm:pb-16" />
    </div>
  );
}
