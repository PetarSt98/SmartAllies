import { useState, useRef } from 'react';
import { Send, Paperclip, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/api.service';

interface MessageInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
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

    let imageUrl: string | undefined;

    if (selectedImage) {
      try {
        imageUrl = await apiService.uploadImage(selectedImage);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    onSendMessage(message.trim(), imageUrl);
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
    <form
      onSubmit={handleSubmit}
      className="border-t border-orange-100/80 bg-white/80 px-6 py-4 backdrop-blur"
    >
      {imagePreview && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-orange-100/80 bg-orange-50/70 p-3 shadow-inner">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-16 w-16 object-cover rounded-lg border border-white shadow"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Attached image</p>
            <p className="text-xs text-slate-500">We will send this with your next message.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeImage}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2 rounded-2xl border border-orange-100/80 bg-white/90 px-3 py-2 shadow-lg">
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
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="shrink-0"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the incident, add context, or ask for help..."
          disabled={isLoading}
          className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          disabled={isLoading || (!message.trim() && !selectedImage)}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
