import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-4">📧</span>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>Email sent</h2>
        <p className="text-muted-foreground text-[14px] max-w-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Check your inbox for a password reset link.
        </p>
        <Link to="/login" className="mt-6 text-primary font-semibold text-[14px] underline">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="wordmark text-center mb-2">CRUMB</h1>
        <p className="text-center text-muted-foreground text-[14px] mb-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="crumb-label">Email</label>
            <input type="email" className="crumb-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {error && <p className="text-destructive text-[13px] font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px]">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <Link to="/login" className="block mt-6 text-center text-[13px] text-muted-foreground underline">Back to login</Link>
      </div>
    </div>
  );
}
