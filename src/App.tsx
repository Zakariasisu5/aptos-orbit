import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SendMoney from "./pages/SendMoney";
import ReceiveMoney from "./pages/ReceiveMoney";
import ForexSwap from "./pages/ForexSwap";
import Payroll from "./pages/Payroll";
import Treasury from "./pages/Treasury";
import Transactions from "./pages/Transactions";
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <div>
                <Navbar />
                <Dashboard />
              </div>
            } />
            <Route path="/send" element={
              <div>
                <Navbar />
                <SendMoney />
              </div>
            } />
            <Route path="/receive" element={
              <div>
                <Navbar />
                <ReceiveMoney />
              </div>
            } />
            <Route path="/forex" element={
              <div>
                <Navbar />
                <ForexSwap />
              </div>
            } />
            <Route path="/payroll" element={
              <div>
                <Navbar />
                <Payroll />
              </div>
            } />
            <Route path="/treasury" element={
              <div>
                <Navbar />
                <Treasury />
              </div>
            } />
            <Route path="/transactions" element={
              <div>
                <Navbar />
                <Transactions />
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
