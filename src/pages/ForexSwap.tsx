import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, Repeat, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockFXRates } from '@/services/mockData';

const ForexSwap = () => {
  const { toast } = useToast();
  const [fromCurrency, setFromCurrency] = useState('USDC');
  const [toCurrency, setToCurrency] = useState('EURC');
  const [fromAmount, setFromAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currencies = ['USDC', 'EURC', 'GHS-stable', 'USDT', 'APT', 'WETH'];
  
  // Mock exchange rate (in real app, would fetch from API)
  const exchangeRate = fromCurrency === 'USDC' && toCurrency === 'EURC' ? 0.85 : 
                      fromCurrency === 'EURC' && toCurrency === 'USDC' ? 1.18 :
                      fromCurrency === 'APT' && toCurrency === 'USDC' ? 7.85 : 1;
  
  const toAmount = fromAmount ? (parseFloat(fromAmount) * exchangeRate).toFixed(4) : '';
  const fee = parseFloat(fromAmount) * 0.003; // 0.3% fee
  const finalAmount = parseFloat(toAmount) - fee;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount('');
  };

  const handleSwap = () => {
    if (!fromAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter an amount to swap",
        variant: "destructive",
      });
      return;
    }
    setShowConfirm(true);
  };

  const confirmSwap = async () => {
    setIsSwapping(true);
    
    // Simulate swap transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSwapping(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setShowConfirm(false);
      setIsSuccess(false);
      setFromAmount('');
      toast({
        title: "Swap Successful",
        description: `Swapped ${fromAmount} ${fromCurrency} for ${finalAmount.toFixed(4)} ${toCurrency}`,
      });
    }, 2000);
  };

  const pairKey = `${fromCurrency}/${toCurrency}`;
  const rateData = mockFXRates[pairKey] || { rate: exchangeRate, change24h: 0, trend: 'stable' };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          FOREX Swap
        </h1>
        <p className="text-foreground-muted">
          Exchange currencies at the best rates with minimal fees
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Swap Interface */}
        <Card variant="glass" className="slide-up">
          <div className="space-y-6">
            {/* From Currency */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>From</Label>
                <span className="text-sm text-foreground-muted">
                  Balance: 12,543.67 {fromCurrency}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="text-xl h-14"
                  />
                </div>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full h-12 w-12 border-2"
              >
                <ArrowUpDown className="w-5 h-5" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>To</Label>
                <span className="text-sm text-foreground-muted">
                  Balance: 8,901.23 {toCurrency}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    readOnly
                    className="text-xl h-14 bg-card-glass/50"
                  />
                </div>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rate Display */}
            {fromAmount && (
              <Card variant="glass" className="bg-card-glass/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-muted">Exchange Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        1 {fromCurrency} = {exchangeRate} {toCurrency}
                      </span>
                      {rateData.trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                      {rateData.trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                      {rateData.trend === 'stable' && <Minus className="w-4 h-4 text-foreground-muted" />}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">24h Change</span>
                    <span className={`${rateData.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {rateData.change24h >= 0 ? '+' : ''}{rateData.change24h}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Fee (0.3%)</span>
                    <span>{fee.toFixed(4)} {toCurrency}</span>
                  </div>
                  
                  <div className="border-t border-border-subtle pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>You'll receive</span>
                      <span>{finalAmount.toFixed(4)} {toCurrency}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Best Rate Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success/20 text-success rounded-full glow-pulse">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Best Rate Available</span>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={handleSwap}
              disabled={!fromAmount}
            >
              <Repeat className="w-4 h-4 mr-2" />
              Swap {fromCurrency} for {toCurrency}
            </Button>
          </div>
        </Card>

        {/* Rate Chart */}
        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Price Chart</h3>
            <div className="h-64 bg-gradient-surface rounded-lg p-4 border border-border-subtle">
              {/* Simulated Chart with SVG */}
              <div className="w-full h-full relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3"/>
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="200" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3"/>
                  ))}
                  
                  {/* Price line */}
                  <polyline
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    points="0,120 50,100 100,110 150,95 200,105 250,90 300,85 350,95 400,80"
                  />
                  
                  {/* Area under curve */}
                  <polygon
                    fill="url(#chartGradient)"
                    points="0,120 50,100 100,110 150,95 200,105 250,90 300,85 350,95 400,80 400,200 0,200"
                  />
                  
                  {/* Data points */}
                  {[
                    [0, 120], [50, 100], [100, 110], [150, 95], [200, 105], 
                    [250, 90], [300, 85], [350, 95], [400, 80]
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="hsl(var(--accent))" />
                  ))}
                </svg>
                
                {/* Chart labels */}
                <div className="absolute bottom-2 left-2 text-xs text-foreground-muted">
                  {exchangeRate.toFixed(4)} {toCurrency}
                </div>
                <div className="absolute top-2 right-2 text-xs text-success">
                  +{rateData.change24h}% (24h)
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Swaps */}
        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Recent Swaps</h3>
            
            <div className="space-y-3">
              {[
                { from: 'USDC', to: 'EURC', fromAmount: 1000, toAmount: 850, time: '2 hours ago' },
                { from: 'APT', to: 'USDC', fromAmount: 50, toAmount: 392.5, time: '1 day ago' },
                { from: 'USDT', to: 'USDC', fromAmount: 2000, toAmount: 2000.2, time: '3 days ago' },
              ].map((swap, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-glass/30 hover:bg-card-glass/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <Repeat className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {swap.fromAmount} {swap.from} → {swap.toAmount} {swap.to}
                      </p>
                      <p className="text-sm text-foreground-muted">{swap.time}</p>
                    </div>
                  </div>
                  <div className="text-sm text-foreground-muted">
                    Completed
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card-glass backdrop-blur-xl border-border-subtle">
          <DialogHeader>
            <DialogTitle>Confirm Swap</DialogTitle>
          </DialogHeader>
          
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Swap Successful!</h3>
              <p className="text-foreground-muted">
                Your currencies have been exchanged
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">From:</span>
                  <span>{fromAmount} {fromCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">To:</span>
                  <span>{toAmount} {toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Fee:</span>
                  <span>{fee.toFixed(4)} {toCurrency}</span>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>You'll receive:</span>
                    <span>{finalAmount.toFixed(4)} {toCurrency}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSwapping}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={confirmSwap}
                  disabled={isSwapping}
                >
                  {isSwapping ? 'Swapping...' : 'Confirm Swap'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForexSwap;