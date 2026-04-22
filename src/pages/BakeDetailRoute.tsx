import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/use-mobile';
import AppShell from '@/components/AppShell';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import BakeDetail from './BakeDetail';
import Journal from './Journal';
import Dashboard from './Dashboard';

interface BakeDetailRouteProps {
  demo?: boolean;
}

export default function BakeDetailRoute({ demo = false }: BakeDetailRouteProps) {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isDesktop) {
    return (
      <AppShell demo={demo}>
        <BakeDetail demo={demo} />
      </AppShell>
    );
  }

  const fromDashboard = (location.state as { from?: string } | null)?.from === (demo ? '/demo/dashboard' : '/dashboard');
  const fallback = demo ? '/demo' : '/';

  const handleClose = (open: boolean) => {
    if (open) return;
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <>
      {fromDashboard ? (
        <AppShell demo={demo}>
          <Dashboard demo={demo} />
        </AppShell>
      ) : (
        <AppShell demo={demo} fullBleed>
          <Journal demo={demo} />
        </AppShell>
      )}
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="max-w-[640px] w-[calc(100vw-2rem)] max-h-[85vh] p-0 overflow-hidden gap-0">
          <BakeDetail demo={demo} asModal />
        </DialogContent>
      </Dialog>
    </>
  );
}