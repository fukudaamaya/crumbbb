import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Journal from "./pages/Journal";
import Dashboard from "./pages/Dashboard";
import BakeDetail from "./pages/BakeDetail";
import NewBakeWizard from "./pages/NewBakeWizard";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Journal /><BottomNav /></>} />
          <Route path="/dashboard" element={<><Dashboard /><BottomNav /></>} />
          <Route path="/bake/new/:step" element={<NewBakeWizard />} />
          <Route path="/bake/:id" element={<BakeDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
