import { NavLink } from 'react-router-dom';
import { BookOpen, BarChart2, Settings as SettingsIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  demo?: boolean;
}

export default function Sidebar({ demo = false }: SidebarProps) {
  const prefix = demo ? '/demo' : '';
  const navigate = useNavigate();

  const items = [
    { to: `${prefix}/`, end: true, icon: BookOpen, label: 'Journal' },
    { to: `${prefix}/dashboard`, end: false, icon: BarChart2, label: 'Dashboard' },
    { to: `${prefix}/settings`, end: false, icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside
      className="hidden md:flex shrink-0 w-[240px] flex-col border-r border-border bg-background h-dvh sticky top-0"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-6 pt-8 pb-6">
        <NavLink to={`${prefix}/`} className="wordmark block">CRUMB</NavLink>
      </div>

      {!demo && (
        <div className="px-4 pb-4">
          <button
            onClick={() => navigate('/bake/new/1')}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-[14px]"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Bake</span>
          </button>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[14px] font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`
            }
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}