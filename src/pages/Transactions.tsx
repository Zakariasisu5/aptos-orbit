import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Users, 
  Search, 
  Filter,
  ExternalLink,
  Calendar,
  Download
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

const Transactions = () => {
  const { transactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;
  
  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.currency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return ArrowUpRight;
      case 'receive': return ArrowDownLeft;
      case 'swap': return TrendingUp;
      case 'payroll': return Users;
      default: return ArrowUpRight;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success';
      case 'pending': return 'bg-warning/20 text-warning';
      case 'processing': return 'bg-accent/20 text-accent';
      case 'failed': return 'bg-destructive/20 text-destructive';
      default: return 'bg-foreground-muted/20 text-foreground-muted';
    }
  };

  const exportTransactions = () => {
    // Mock CSV export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Type,Amount,Currency,Status,Hash\n" +
      filteredTransactions.map(tx => 
        `${new Date(tx.timestamp).toLocaleDateString()},${tx.type},${tx.amount},${tx.currency},${tx.status},${tx.txHash}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          Transaction History
        </h1>
        <p className="text-foreground-muted">
          View and manage all your transaction history
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Transactions', value: transactions.length, icon: ArrowUpRight },
          { label: 'Completed', value: transactions.filter(tx => tx.status === 'completed').length, icon: ArrowDownLeft },
          { label: 'Total Volume', value: `$${transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}`, icon: TrendingUp },
          { label: 'This Month', value: transactions.filter(tx => new Date(tx.timestamp).getMonth() === new Date().getMonth()).length, icon: Calendar },
        ].map((stat, index) => (
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
              </div>
              <div className="bg-gradient-accent p-3 rounded-xl">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card variant="glass" className="slide-up">
        <div className="space-y-4">
          {/* Search */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1 min-w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="send">Send</SelectItem>
                <SelectItem value="receive">Receive</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 min-w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportTransactions} className="flex-shrink-0">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card variant="glass" className="slide-up">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Transactions</h3>
            <p className="text-sm text-foreground-muted">
              Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
            </p>
          </div>

          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-foreground-muted">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedTransactions.map((tx, index) => {
                const Icon = getTransactionIcon(tx.type);
                
                return (
                  <div 
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg hover:bg-card-glass/50 transition-colors fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Left Section */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        tx.type === 'send' ? 'bg-warning/20 text-warning' :
                        tx.type === 'receive' ? 'bg-success/20 text-success' :
                        tx.type === 'swap' ? 'bg-accent/20 text-accent' :
                        'bg-primary/20 text-primary'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium capitalize">{tx.type}</p>
                          <Badge className={getStatusColor(tx.status)}>
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-foreground-muted">
                            {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                          {(tx.recipient || tx.sender) && (
                            <p className="text-sm text-foreground-muted truncate">
                              {tx.type === 'send' ? `To: ${tx.recipient}` : 
                               tx.type === 'receive' ? `From: ${tx.sender}` :
                               tx.type === 'swap' ? `${tx.fromCurrency} → ${tx.toCurrency}` :
                               `Batch: ${tx.batchSize} employees`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Section */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">
                          {tx.type === 'receive' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {tx.currency}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${tx.txHash}`, '_blank')}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle">
              <p className="text-sm text-foreground-muted order-2 sm:order-1">
                Page {currentPage} of {totalPages}
              </p>
              
              <div className="flex space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Transactions;