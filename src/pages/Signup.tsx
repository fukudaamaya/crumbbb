import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

        <p className="mt-6 text-center text-[13px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
