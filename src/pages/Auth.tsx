import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Mail, Lock, Github, Chrome } from 'lucide-react';
import BackgroundBubbles from '@/components/animations/BackgroundBubbles';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    // Mock authentication
    if (email && password) {
      toast({
        title: "Authentication Successful",
        description: `${isLogin ? 'Logged in' : 'Account created'} successfully!`,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Authentication Failed",
        description: "Please enter valid credentials",
        variant: "destructive",
      });
    }
  };

  const handleWalletConnect = (walletName: string) => {
    toast({
      title: "Wallet Connected",
      description: `${walletName} wallet connected successfully!`,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundBubbles />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 fade-in">
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display mb-2 text-gradient">
              Welcome to GlobePayX
            </h1>
            <p className="text-foreground-muted">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* Auth Form */}
          <Card variant="glass" className="slide-up mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={handleAuth}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              <div className="text-center">
                <button
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </Card>

          {/* Social Auth */}
          <Card variant="glass" className="slide-up mb-6" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-3">
              <p className="text-sm text-foreground-muted text-center mb-4">
                Or continue with
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => handleAuth()}>
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleAuth()}>
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
          </Card>

          {/* Wallet Connect */}
          <Card variant="glass" className="slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-3">
              <p className="text-sm text-foreground-muted text-center mb-4">
                Connect your Aptos wallet
              </p>
              
              <div className="space-y-2">
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  onClick={() => handleWalletConnect('Petra')}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Petra Wallet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleWalletConnect('Martian')}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Martian Wallet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleWalletConnect('Pontem')}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Pontem Wallet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;