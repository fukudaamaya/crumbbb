import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, BarChart2, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  demo?: boolean;
}

type RailItem = {
  to: string;
  end: boolean;
  icon: typeof BookOpen;
  label: string;
};

export default function Sidebar({ demo = false }: SidebarProps) {
  const prefix = demo ? '/demo' : '';
  const [expanded, setExpanded] = useState(false);

  const navItems: RailItem[] = [
    { to: `${prefix}/`, end: true, icon: BookOpen, label: 'Journal' },
    { to: `${prefix}/dashboard`, end: false, icon: BarChart2, label: 'Dashboard' },
  ];

  const settingsItem: RailItem = {
    to: `${prefix}/settings`,
    end: false,
    icon: SettingsIcon,
    label: 'Settings',
  };

  const renderItem = ({ to, end, icon: Icon, label }: RailItem) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center gap-4 h-11 px-4 mx-2 rounded-[6px] text-[14px] font-semibold transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-muted'
        }`
      }
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <Icon size={22} strokeWidth={2} className="shrink-0" />
      <span
        className={`whitespace-nowrap overflow-hidden transition-opacity duration-150 delay-75 ${
          expanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </span>
    </NavLink>
  );

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      className={`hidden md:flex fixed left-0 top-0 h-dvh z-40 flex-col border-r border-border bg-background overflow-hidden transition-[width] duration-200 ease-out ${
        expanded ? 'w-[240px]' : 'w-[72px]'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-[88px] flex items-center px-6">
        <NavLink
          to={`${prefix}/`}
          className="wordmark block whitespace-nowrap overflow-hidden"
          aria-label="CRUMB — Journal"
        >
          {expanded ? 'CRUMB' : 'C'}
        </NavLink>
      </div>

      <nav className="flex-1 flex flex-col justify-center space-y-1">
        {navItems.map(renderItem)}
      </nav>

      <div className="pb-4 space-y-1">{renderItem(settingsItem)}</div>
    </aside>
  );
}