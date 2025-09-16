import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SendMoney from "./pages/SendMoney";
import ReceiveMoney from "./pages/ReceiveMoney";
import Payroll from "./pages/Payroll";
import Transactions from "./pages/Transactions";
import Navbar from "./components/layout/Navbar";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/chat/ChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <ChatWidget />
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
              <SendMoney />
            </div>
          } />
          <Route path="/receive" element={
            <div>
              <Navbar />
              <ReceiveMoney />
            </div>
          } />
          <Route path="/payroll" element={
            <div>
              <Navbar />
              <Payroll />
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
  </QueryClientProvider>
);

export default App;
