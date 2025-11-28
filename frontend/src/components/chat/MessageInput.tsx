import { useState, useRef } from 'react';
import { Send, Paperclip, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/api.service';

interface MessageInputProps {
  onSendMessage: (message: string, options?: { imageUrl?: string; imagePreview?: string }) => void;
  isLoading: boolean;
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    const content = message.trim() || 'Image attached.';

    onSendMessage(content, { 
      imagePreview: imagePreview || undefined 
    });
    
    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-orange-100/70 p-3 sm:p-5 bg-white/80 backdrop-blur">
      {imagePreview && (
        <div className="mb-2 sm:mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl shadow-md border border-white/80"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs shadow-lg"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex gap-2 sm:gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="shadow-sm flex-shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="shadow-sm flex-shrink-0"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 shadow-sm min-w-0"
        />
        <Button type="submit" disabled={isLoading || (!message.trim() && !selectedImage)} className="shadow-lg flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
