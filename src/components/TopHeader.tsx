import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface TopHeaderProps {
  demo?: boolean;
}

export default function TopHeader({ demo = false }: TopHeaderProps) {
  const prefix = demo ? '/demo' : '';
  return (
    <header className="hidden md:flex sticky top-0 z-40 h-16 items-center justify-between px-8 bg-background border-b border-border">
      <Link to={`${prefix}/`} className="wordmark block">CRUMB</Link>
      <Link
        to={`${prefix}/settings`}
        aria-label="Settings"
        className="p-2 rounded-[6px] hover:bg-muted transition-colors text-foreground"
      >
        <Settings size={20} strokeWidth={2} />
      </Link>
    </header>
  );
}
