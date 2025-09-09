import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/layout/Navbar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={
              <div>
                <Navbar />
                <Dashboard />
              </div>
            } />
            <Route path="/send" element={
              <div>
                <Navbar />
                <div className="p-8 text-center text-foreground-muted">Send Money - Coming Soon</div>
              </div>
            } />
            <Route path="/receive" element={
              <div>
                <Navbar />
                <div className="p-8 text-center text-foreground-muted">Receive Money - Coming Soon</div>
              </div>
            } />
            <Route path="/forex" element={
              <div>
                <Navbar />
                <div className="p-8 text-center text-foreground-muted">FOREX - Coming Soon</div>
              </div>
            } />
            <Route path="/payroll" element={
              <div>
                <Navbar />
                <div className="p-8 text-center text-foreground-muted">Payroll - Coming Soon</div>
              </div>
            } />
            <Route path="/treasury" element={
              <div>
                <Navbar />
                <div className="p-8 text-center text-foreground-muted">Treasury - Coming Soon</div>
              </div>
            } />
            <Route path="/transactions" element={
              <div>
                <Navbar />
                <div className="p-8 text-center text-foreground-muted">Transactions - Coming Soon</div>
              </div>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
