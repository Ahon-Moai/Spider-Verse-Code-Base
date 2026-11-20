import React, { useState } from 'react';
import { Film, Loader2, Video } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface VideoUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  csrfToken: string;
  placeholder?: string;
  className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  label,
  value,
  onChange,
  csrfToken,
  placeholder = 'Video URL or path (e.g., /uploads/video.mp4)',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxMb = 50;
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${maxMb}MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploads.php', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        setError(getErrorMessage(data?.error || data, 'Failed to upload video'));
      }
    } catch (err) {
      setError('Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
        {/* Preview Box */}
        <div className="w-16 h-12 shrink-0 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
          {value ? (
            <video
              src={value}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Film className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>

        {/* Input and Upload Action */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 font-mono truncate transition-colors"
            />

            <label className="inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium px-3.5 cursor-pointer shrink-0 transition-colors whitespace-nowrap">
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </>
              )}
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-sans">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
