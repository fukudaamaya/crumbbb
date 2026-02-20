import { NavLink } from 'react-router-dom';
import { BookOpen, BarChart2 } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center py-3 gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <BookOpen
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span
                className="text-[11px] font-semibold tracking-wide uppercase"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Journal
              </span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center py-3 gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <BarChart2
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span
                className="text-[11px] font-semibold tracking-wide uppercase"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Dashboard
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
