import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="wordmark text-center mb-2">CRUMB</h1>
        <p className="text-center text-muted-foreground text-[14px] mb-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Welcome back, baker.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-destructive text-[13px] font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px]">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/forgot-password" className="text-[13px] text-muted-foreground underline" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Forgot password?
          </Link>
          <p className="text-[13px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
