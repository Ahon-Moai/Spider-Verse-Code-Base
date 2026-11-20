import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  csrfToken: string;
  placeholder?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  csrfToken,
  placeholder = 'Image URL or path (e.g., /uploads/image.jpg)',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', files[0]);

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
        setError(getErrorMessage(data?.error || data, 'Failed to upload image'));
      }
    } catch (err) {
      setError('Upload error');
    } finally {
      setUploading(false);
      // Reset input value so re-selecting the same file works
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

      <div className="flex items-start gap-3">
        {/* Preview Container */}
        <div className="w-12 h-12 shrink-0 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2371717a" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
              }}
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>

        {/* Input and Upload Button */}
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
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
