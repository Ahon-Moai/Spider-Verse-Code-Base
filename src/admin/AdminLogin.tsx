import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: (user: any, csrfToken: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success && data.data) {
        onLoginSuccess(data.data.user, data.data.csrf_token);
      } else {
        setError(getErrorMessage(data?.error || data, 'Invalid credentials. Please try again.'));
      }
    } catch (err: any) {
      setError('Connection error. Please ensure the API backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex items-center justify-center p-4 font-sans antialiased selection:bg-zinc-900 selection:text-white">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Clean Brand Mark */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-xs font-semibold tracking-tight border border-zinc-800 shadow-xs">
            AP
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Sign in to Admin Console
            </h1>
            <p className="text-xs text-zinc-500">
              Enter your credentials to manage catalog, orders, and storefront content
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-6 sm:p-7 shadow-xs">
          {error && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full h-10 rounded-md bg-white border border-zinc-200 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 rounded-md bg-white border border-zinc-200 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{loading ? 'Authenticating...' : 'Continue to Dashboard'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Footer Reference */}
        <p className="text-center text-[11px] text-zinc-500">
          Default access: <span className="font-mono text-zinc-700 font-medium">admin</span> / <span className="font-mono text-zinc-700 font-medium">admin123</span>
        </p>
      </div>
    </div>
  );
};
