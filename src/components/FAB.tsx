import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface FABProps {
  date?: string; // optional pre-selected date
}

export default function FAB({ date }: FABProps) {
  const navigate = useNavigate();

  const handleTap = () => {
    const params = date ? `?date=${date}` : '';
    navigate(`/bake/new/1${params}`);
  };

  return (
    <button
      onClick={handleTap}
      className="fixed z-40 flex items-center gap-2 px-3 py-2 rounded-[6px] border border-border bg-background text-foreground"
      style={{
        bottom: `calc(env(safe-area-inset-bottom) + 64px + 20px)`,
        right: 'max(20px, calc(50% - 215px + 20px))',
        boxShadow: '2px 2px 0px hsl(var(--border))',
      }}
      aria-label="Start a new bake"
    >
      <Plus size={16} strokeWidth={2.5} />
      <span className="text-[13px] font-semibold">New Bake</span>
    </button>
  );
}
