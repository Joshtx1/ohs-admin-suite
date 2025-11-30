import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Trainees from "./pages/Trainees";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Pricing from "./pages/Pricing";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import ActionNotes from "./pages/ActionNotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/dashboard/clients" element={<DashboardLayout><Clients /></DashboardLayout>} />
            <Route path="/dashboard/trainees" element={<DashboardLayout><Trainees /></DashboardLayout>} />
            <Route path="/dashboard/services" element={<DashboardLayout><Services /></DashboardLayout>} />
            <Route path="/dashboard/services/:id" element={<DashboardLayout><ServiceDetail /></DashboardLayout>} />
            <Route path="/dashboard/pricing" element={<DashboardLayout><Pricing /></DashboardLayout>} />
            <Route path="/dashboard/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
            <Route path="/dashboard/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
            <Route path="/dashboard/users" element={<DashboardLayout><Users /></DashboardLayout>} />
            <Route path="/dashboard/admin" element={<DashboardLayout><Admin /></DashboardLayout>} />
            <Route path="/dashboard/action-notes" element={<DashboardLayout><ActionNotes /></DashboardLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
