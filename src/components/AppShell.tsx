import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  demo?: boolean;
  /** If true, renders content full-bleed without the max-width cap (used by Journal). */
  fullBleed?: boolean;
}

export default function AppShell({ children, demo = false, fullBleed = false }: AppShellProps) {
  return (
    <div className="flex w-full min-h-dvh">
      <Sidebar demo={demo} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className={fullBleed ? 'flex-1 flex flex-col min-h-0' : 'flex-1 w-full md:max-w-[1100px] md:mx-auto md:px-8 md:py-6 flex flex-col'}>
          {children}
        </div>
      </div>
    </div>
  );
}