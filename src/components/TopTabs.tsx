import { NavLink } from 'react-router-dom';

interface TopTabsProps {
  demo?: boolean;
}

export default function TopTabs({ demo = false }: TopTabsProps) {
  const prefix = demo ? '/demo' : '';
  const tabs = [
    { to: `${prefix}/`, end: true, label: 'Journal' },
    { to: `${prefix}/dashboard`, end: false, label: 'Dashboard' },
  ];

  return (
    <div className="hidden md:block border-b border-border">
      <nav className="flex gap-6 px-8">
        {tabs.map(({ to, end, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative py-3 text-[15px] transition-colors ${
                isActive
                  ? 'font-bold text-foreground after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:bg-primary'
                  : 'font-semibold text-muted-foreground hover:text-foreground'
              }`
            }
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
