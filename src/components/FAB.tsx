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
      className="crumb-fab fixed z-40 flex items-center gap-2 px-5 py-3"
      style={{
        bottom: `calc(env(safe-area-inset-bottom) + 64px + 20px)`,
        right: '20px',
      }}
      aria-label="Start a new bake"
    >
      <Plus size={20} strokeWidth={2.5} />
      <span className="text-[15px] font-semibold">Bake</span>
    </button>
  );
}
