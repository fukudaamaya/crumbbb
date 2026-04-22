import TopHeader from './TopHeader';
import TopTabs from './TopTabs';

interface AppShellProps {
  children: React.ReactNode;
  demo?: boolean;
  /** If true, renders content full-bleed without the max-width cap (used by Journal). */
  fullBleed?: boolean;
  /** If true, renders the desktop top header + Journal/Dashboard tab nav. */
  showHeader?: boolean;
}

export default function AppShell({ children, demo = false, fullBleed = false, showHeader = false }: AppShellProps) {
  return (
    <div className="flex flex-col w-full h-dvh">
      {showHeader && <TopHeader demo={demo} />}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto">
        {showHeader && (
          <div className="w-full md:max-w-[1100px] md:mx-auto md:w-full">
            <TopTabs demo={demo} />
          </div>
        )}
        <div className={fullBleed ? 'flex-1 flex flex-col min-h-0' : 'flex-1 min-h-0 w-full md:max-w-[1100px] md:mx-auto md:px-8 md:py-6 flex flex-col'}>
          {children}
        </div>
      </div>
    </div>
  );
}