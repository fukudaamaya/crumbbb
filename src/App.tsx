import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Journal from "./pages/Journal";
import Dashboard from "./pages/Dashboard";
import BakeDetail from "./pages/BakeDetail";
import NewBakeWizard from "./pages/NewBakeWizard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-[14px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="relative mx-auto w-full max-w-[430px] min-h-dvh bg-background shadow-[4px_0_0_hsl(var(--border)),_-4px_0_0_hsl(var(--border))]">
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedRoute><Journal /><BottomNav /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /><BottomNav /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/bake/new/:step" element={<ProtectedRoute><NewBakeWizard /></ProtectedRoute>} />
                <Route path="/bake/:id" element={<ProtectedRoute><BakeDetail /></ProtectedRoute>} />
                {/* Demo routes */}
                <Route path="/demo" element={<><Journal demo /><BottomNav demo /></>} />
                <Route path="/demo/dashboard" element={<><Dashboard demo /><BottomNav demo /></>} />
                <Route path="/demo/settings" element={<Settings demo />} />
                <Route path="/demo/bake/:id" element={<BakeDetail demo />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
