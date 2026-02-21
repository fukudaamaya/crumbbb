import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-4">📬</span>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>Check your email</h2>
        <p className="text-muted-foreground text-[14px] max-w-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link to="/login" className="mt-6 text-primary font-semibold text-[14px] underline" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="wordmark text-center mb-2">CRUMB</h1>
        <p className="text-center text-muted-foreground text-[14px] mb-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Create your baking journal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="crumb-label">Display Name</label>
            <input
              type="text"
              className="crumb-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="e.g. Jane Baker"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="crumb-label">Email</label>
            <input
              type="email"
              className="crumb-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="crumb-label">Password</label>
            <input
              type="password"
              className="crumb-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-destructive text-[13px] font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px]">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            setError('');
            const { error } = await lovable.auth.signInWithOAuth('google', {
              redirect_uri: window.location.origin,
            });
            if (error) setError(error.message);
          }}
          className="crumb-input w-full flex items-center justify-center gap-2 py-3 text-[15px] font-medium cursor-pointer hover:bg-muted transition-colors"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <p className="mt-6 text-center text-[13px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold underline">Sign in</Link>
        </p>
        <div className="mt-2 text-center">
          <Link
            to="/demo"
            className="text-[13px] text-muted-foreground underline"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Explore demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
