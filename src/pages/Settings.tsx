import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, LogOut } from 'lucide-react';
import { useSettings, ACCENT_COLORS, type WeekStart, type TempUnit } from '@/contexts/SettingsContext';
import DemoBanner from '@/components/DemoBanner';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings({ demo = false }: { demo?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDemo = demo || location.pathname.startsWith('/demo');
  const { weekStart, tempUnit, accentColor, setWeekStart, setTempUnit, setAccentColor } = useSettings();
  const { signOut } = useAuth();

  const backPath = isDemo ? '/demo/dashboard' : '/dashboard';

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {isDemo && <DemoBanner />}

      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background"
        style={{ paddingTop: isDemo ? '12px' : 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button onClick={() => navigate(backPath)} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold" style={{ fontFamily: 'Raleway, sans-serif' }}>
          Settings
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Start of the Week */}
        <div className="crumb-card p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>Start of the Week</h3>
          <div className="flex border border-border rounded-[6px] overflow-hidden"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            {(['sunday', 'monday'] as WeekStart[]).map(val => (
              <button
                key={val}
                onClick={() => setWeekStart(val)}
                className={`flex-1 py-2.5 text-[14px] font-semibold transition-colors ${
                  weekStart === val
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground'
                }`}
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {val === 'sunday' ? 'Sunday' : 'Monday'}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Unit */}
        <div className="crumb-card p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>Temperature Unit</h3>
          <div className="flex border border-border rounded-[6px] overflow-hidden"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            {(['C', 'F'] as TempUnit[]).map(val => (
              <button
                key={val}
                onClick={() => setTempUnit(val)}
                className={`flex-1 py-2.5 text-[14px] font-semibold transition-colors ${
                  tempUnit === val
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground'
                }`}
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {val === 'C' ? '°C Celsius' : '°F Fahrenheit'}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Colour */}
        <div className="crumb-card p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>Accent Colour</h3>
          <div className="grid grid-cols-4 gap-4 justify-items-center">
            {ACCENT_COLORS.map(c => {
              const isActive = accentColor === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setAccentColor(c.name)}
                  className="flex flex-col items-center gap-1.5"
                  aria-label={c.name}
                >
                  <div
                    className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform"
                    style={{
                      backgroundColor: `hsl(${c.primary})`,
                      borderColor: isActive ? 'hsl(var(--foreground))' : 'transparent',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {isActive && <Check size={18} strokeWidth={3} color="white" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={async () => {
            if (!isDemo) await signOut();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[6px] border border-border text-destructive font-semibold text-[14px] hover:bg-destructive/10 transition-colors"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
