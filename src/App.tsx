import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Dashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/send" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <SendMoney />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/receive" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <ReceiveMoney />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/forex" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <ForexSwap />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/payroll" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Payroll />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/treasury" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Treasury />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Transactions />
              </div>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
