import { useState, useRef } from 'react';
import { Send, Paperclip, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    const imageUrl = imagePreview ?? undefined;
    const content = message.trim() || 'Image attached';

    onSendMessage(content, imageUrl);
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
    <form onSubmit={handleSubmit} className="border-t border-orange-100/80 bg-white/90 px-4 py-5">
      {imagePreview && (
        <div className="mb-3 inline-flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-2 pr-3 shadow-inner">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-16 w-16 rounded-lg object-cover ring-1 ring-orange-200"
          />
          <div className="flex flex-col gap-1 text-sm text-orange-800">
            <span className="font-semibold">Attached image</span>
            <button
              type="button"
              onClick={removeImage}
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 underline-offset-2 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 rounded-2xl border border-orange-100/80 bg-white/90 px-3 py-2 shadow-sm ring-1 ring-orange-50">
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
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share details, attach a photo, or ask for help..."
          disabled={isLoading}
          className="flex-1 border-none bg-transparent text-base placeholder:text-orange-700/60 focus-visible:ring-orange-300"
        />
        <Button
          type="submit"
          disabled={isLoading || (!message.trim() && !selectedImage)}
          className="shadow-[0_10px_30px_rgba(249,91,53,0.35)]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
