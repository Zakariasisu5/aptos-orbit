import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar } from 'lucide-react';
import { mockTreasuryData, mockBalances } from '@/services/mockData';

const Treasury = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('allocation');

  const { totalValue, allocation, history } = mockTreasuryData;
  const timeRanges = ['7d', '30d', '90d', '1y'];

  const performanceMetrics = [
    {
      label: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      change: '+5.2%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      label: 'Monthly Return',
      value: '+3.8%',
      change: '+0.5%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Yield (APY)',
      value: '12.4%',
      change: '-0.2%',
      trend: 'down',
      icon: BarChart3,
    },
    {
      label: 'Risk Score',
      value: 'Medium',
      change: 'Stable',
      trend: 'stable',
      icon: PieChart,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          Treasury Management
        </h1>
        <p className="text-foreground-muted">
          Monitor and optimize your digital asset portfolio
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card 
            key={metric.label} 
            variant="glass" 
            className="slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted mb-1">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold">
                  {metric.value}
                </p>
                <p className={`text-sm flex items-center mt-1 ${
                  metric.trend === 'up' ? 'text-success' :
                  metric.trend === 'down' ? 'text-destructive' :
                  'text-foreground-muted'
                }`}>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {metric.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {metric.change}
                </p>
              </div>
              <div className="bg-gradient-accent p-3 rounded-xl">
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Portfolio Allocation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allocation">Asset Allocation</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="risk">Risk Analysis</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Allocation Chart */}
          <Card variant="glass" className="slide-up">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Portfolio Allocation</h3>
              
              {/* Pie Chart Placeholder */}
              <div className="h-80 bg-gradient-surface rounded-lg flex items-center justify-center border border-border-subtle">
                <div className="text-center space-y-4">
                  <PieChart className="w-16 h-16 text-foreground-muted mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-foreground-muted">
                      Portfolio Distribution
                    </p>
                    <p className="text-sm text-foreground-subtle">
                      Interactive pie chart visualization
                    </p>
                  </div>
                </div>
              </div>

              {/* Allocation Breakdown */}
              <div className="space-y-3">
                {allocation.map((asset, index) => (
                  <div 
                    key={asset.currency}
                    className="flex items-center justify-between p-3 rounded-lg bg-card-glass/30 hover:bg-card-glass/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: [
                            'hsl(177, 70%, 56%)', // Teal
                            'hsl(35, 92%, 66%)',  // Amber
                            'hsl(142, 76%, 36%)', // Green
                            'hsl(230, 43%, 17%)', // Navy
                            'hsl(0, 72%, 51%)'    // Red
                          ][index] 
                        }}
                      />
                      <div>
                        <p className="font-medium">{asset.currency}</p>
                        <p className="text-sm text-foreground-muted">
                          ${asset.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{asset.percentage}%</p>
                      <p className="text-sm text-foreground-muted">
                        of portfolio
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Performance Chart */}
          <Card variant="glass" className="slide-up">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Portfolio Performance</h3>
              
              {/* Line Chart Placeholder */}
              <div className="h-64 bg-gradient-surface rounded-lg flex items-center justify-center border border-border-subtle">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 text-foreground-muted mx-auto" />
                  <p className="text-foreground-muted">
                    Portfolio Value Over Time
                  </p>
                  <p className="text-sm text-foreground-subtle">
                    {timeRange} performance chart
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Asset Balances */}
          <Card variant="glass" className="slide-up">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Current Balances</h3>
              
              <div className="space-y-3">
                {Object.entries(mockBalances).map(([currency, data]) => (
                  <div 
                    key={currency}
                    className="flex items-center justify-between p-3 rounded-lg bg-card-glass/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{currency}</p>
                        <p className="text-sm text-foreground-muted">
                          {data.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${data.usdValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass" className="slide-up">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              
              <div className="space-y-2">
                <Button variant="primary" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Rebalance Portfolio
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PieChart className="w-4 h-4 mr-2" />
                  Risk Analysis
                </Button>
              </div>
            </div>
          </Card>

          {/* Market Insights */}
          <Card variant="glass" className="slide-up">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Market Insights</h3>
              
              <div className="space-y-3">
                {[
                  {
                    title: 'DeFi Yield Opportunity',
                    description: 'USDC staking yields up 2.3% this week',
                    type: 'positive'
                  },
                  {
                    title: 'Market Volatility Alert',
                    description: 'Increased volatility expected in crypto markets',
                    type: 'warning'
                  },
                  {
                    title: 'Diversification Tip',
                    description: 'Consider reducing exposure to single assets',
                    type: 'info'
                  }
                ].map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'positive' ? 'border-success/20 bg-success/5' :
                      insight.type === 'warning' ? 'border-warning/20 bg-warning/5' :
                      'border-accent/20 bg-accent/5'
                    }`}
                  >
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs text-foreground-muted mt-1">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Treasury;