import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface MediaManagerProps {
  csrfToken: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ csrfToken }) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media.php', {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMediaList(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch media library', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
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
      if (data.success) {
        fetchMedia();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to upload image'));
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`/api/admin/media.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
      }
    } catch (e) {
      alert('Failed to delete media file');
    }
  };

  const copyToClipboard = (path: string, id: number) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Media &amp; Asset Library
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Persistent local filesystem uploads for products, campaign banners, and journal articles
          </p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto">
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-5 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-14 space-y-2.5">
            <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              No media files uploaded yet
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Upload an image above to copy its path into products or banners.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((m) => (
              <div
                key={m.id}
                className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-2.5 space-y-2.5 group"
              >
                <div className="aspect-square bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-md overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={m.file_path}
                    alt={m.original_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="text-[11px] px-0.5">
                  <p
                    className="font-medium text-zinc-900 dark:text-zinc-100 truncate"
                    title={m.original_name}
                  >
                    {m.original_name}
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-500 font-mono tabular-nums mt-0.5">
                    {(m.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/70 dark:border-zinc-800 text-[11px]">
                  <button
                    onClick={() => copyToClipboard(m.file_path, m.id)}
                    className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium cursor-pointer transition-colors"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedId === m.id ? 'Copied' : 'Copy URL'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
