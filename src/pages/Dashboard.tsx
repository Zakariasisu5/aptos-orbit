import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Wallet,
  Users,
  Activity,
  DollarSign
} from 'lucide-react';
import { mockBalances, mockTransactions, mockUser } from '@/services/mockData';

const Dashboard = () => {
  const totalBalance = Object.values(mockBalances).reduce(
    (sum, { usdValue }) => sum + usdValue, 
    0
  );

  const recentTransactions = mockTransactions.slice(0, 5);

  const quickStats = [
    {
      label: 'Total Balance',
      value: `$${totalBalance.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
    },
    {
      label: 'Monthly Volume',
      value: '$45,670',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Active Payees',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: Users,
    },
    {
      label: 'Transactions',
      value: '127',
      change: '+15.3%',
      trend: 'up',
      icon: Activity,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          Financial Dashboard
        </h1>
        <p className="text-foreground-muted">
          Manage your global finances with real-time insights and secure transactions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card 
            key={stat.label} 
            variant="glass" 
            className="slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">
                  {stat.value}
                </p>
                <p className="text-sm text-success flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className="bg-gradient-accent p-3 rounded-xl">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Balance Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 font-display">
              Your Balances
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(mockBalances).map(([currency, data], index) => (
                <Card 
                  key={currency} 
                  variant="glass" 
                  className="hover:scale-105 transition-transform duration-300 slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{currency}</h3>
                    <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold mb-1">
                      {data.balance.toLocaleString()}
                    </p>
                    <p className="text-foreground-muted text-sm">
                      ≈ ${data.usdValue.toLocaleString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 font-display">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="h-16 justify-start text-left bounce-in"
                asChild
              >
                <Link to="/send">
                  <ArrowUpRight className="w-6 h-6 mr-3" />
                  <div>
                    <div className="font-semibold">Send Money</div>
                    <div className="text-sm opacity-80">Transfer funds globally</div>
                  </div>
                </Link>
              </Button>
              
              <Button 
                variant="accent" 
                size="lg" 
                className="h-16 justify-start text-left bounce-in"
                style={{ animationDelay: '0.1s' }}
                asChild
              >
                <Link to="/receive">
                  <ArrowDownLeft className="w-6 h-6 mr-3" />
                  <div>
                    <div className="font-semibold">Receive Money</div>
                    <div className="text-sm opacity-80">Get paid instantly</div>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-display">
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transactions">View All</Link>
            </Button>
          </div>
          
          <Card variant="glass" className="space-y-4">
            {recentTransactions.map((tx, index) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-card-glass/50 transition-colors fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'send' ? 'bg-warning/20 text-warning' :
                    tx.type === 'receive' ? 'bg-success/20 text-success' :
                    'bg-accent/20 text-accent'
                  }`}>
                    {tx.type === 'send' && <ArrowUpRight className="w-4 h-4" />}
                    {tx.type === 'receive' && <ArrowDownLeft className="w-4 h-4" />}
                    {tx.type === 'swap' && <TrendingUp className="w-4 h-4" />}
                    {tx.type === 'payroll' && <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-sm text-foreground-muted">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {tx.type === 'receive' ? '+' : '-'}${tx.amount}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {tx.currency}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;