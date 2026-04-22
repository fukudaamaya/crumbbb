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
import RecipeHistory from "./pages/RecipeHistory";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

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
            <div className="relative w-full min-h-dvh bg-background flex flex-col md:flex-row mx-auto max-w-[430px] md:max-w-none max-h-dvh overflow-hidden shadow-[4px_0_0_hsl(var(--border)),_-4px_0_0_hsl(var(--border))] md:shadow-none">
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedRoute><AppShell fullBleed><Journal /></AppShell><BottomNav /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell><BottomNav /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />
                <Route path="/recipe/:id" element={<ProtectedRoute><AppShell><RecipeHistory /></AppShell></ProtectedRoute>} />
                <Route path="/bake/new/:step" element={<ProtectedRoute><AppShell><NewBakeWizard /></AppShell></ProtectedRoute>} />
                <Route path="/bake/:id" element={<ProtectedRoute><AppShell><BakeDetail /></AppShell></ProtectedRoute>} />
                {/* Demo routes */}
                <Route path="/demo" element={<><AppShell demo fullBleed><Journal demo /></AppShell><BottomNav demo /></>} />
                <Route path="/demo/dashboard" element={<><AppShell demo><Dashboard demo /></AppShell><BottomNav demo /></>} />
                <Route path="/demo/settings" element={<AppShell demo><Settings demo /></AppShell>} />
                <Route path="/demo/bake/:id" element={<AppShell demo><BakeDetail demo /></AppShell>} />
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
