import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import BackgroundBubbles from '@/components/animations/BackgroundBubbles';
import { 
  Wallet, 
  ArrowRightLeft, 
  Globe, 
  Users, 
  Shield, 
  Zap,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { mockSponsors, mockTestimonials } from '@/services/mockData';

const Landing = () => {
  const features = [
    {
      icon: ArrowRightLeft,
      title: 'Instant Remittances',
      description: 'Send money globally in seconds with minimal fees using stablecoins.',
    },
    {
      icon: Globe,
      title: 'Multi-Currency Support',
      description: 'Support for USDC, USDT, APT, and other popular cryptocurrencies.',
    },
    {
      icon: Users,
      title: 'Payroll Management',
      description: 'Streamline salary payments with batch processing and automation.',
    },
    {
      icon: TrendingUp,
      title: 'Treasury Analytics',
      description: 'Advanced portfolio management with real-time insights.',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Multi-signature wallets and enterprise-level security protocols.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built on Aptos for sub-second transaction finality.',
    },
  ];

  const stats = [
    { label: 'Total Volume', value: '$2.4B+' },
    { label: 'Countries', value: '150+' },
    { label: 'Transactions', value: '10M+' },
    { label: 'Users', value: '100K+' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundBubbles />
      
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="fade-in">
            <h1 className="text-hero mb-8 leading-tight">
              The Future of
              <br />
              <span className="text-gradient">Cross-Border Finance</span>
            </h1>
            <p className="text-xl text-foreground-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              Send money globally, manage payroll, and optimize treasury operations with 
              our next-generation Web3 financial platform built on Aptos blockchain.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center slide-up">
            <Button variant="hero" size="xl" asChild>
              <Link to="/dashboard" className="min-w-[200px]">
                <Wallet className="w-5 h-5 mr-2" />
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="min-w-[200px]">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label} 
              variant="glass" 
              className="text-center bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-foreground-muted text-sm">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 font-display">
            Why Choose <span className="text-gradient">GlobePayX</span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
            Experience the power of blockchain technology with traditional finance ease-of-use.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="glass" 
              className="fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-accent p-3 rounded-xl">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-muted">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="relative z-10 container mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4 font-display">
            Trusted by Industry Leaders
          </h2>
          <p className="text-foreground-muted">
            Partnering with the world's leading financial institutions
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-right space-x-12">
            {[...mockSponsors, ...mockSponsors].map((sponsor, index) => (
              <div 
                key={`${sponsor.name}-${index}`}
                className="flex-shrink-0 bg-card/20 backdrop-blur-sm border border-border rounded-xl p-6 min-w-[200px]"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{sponsor.logo}</div>
                  <h3 className="text-lg font-semibold mb-1">{sponsor.name}</h3>
                  <p className="text-sm text-foreground-muted">{sponsor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 container mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4 font-display">
            What Our Customers Say
          </h2>
          <p className="text-foreground-muted">
            Real feedback from finance leaders using GlobePayX
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left space-x-8">
            {[...mockTestimonials, ...mockTestimonials].map((testimonial, index) => (
              <Card 
                key={`${testimonial.id}-${index}`}
                variant="glass" 
                className="flex-shrink-0 min-w-[350px] max-w-[350px]"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <blockquote className="text-foreground-muted mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-foreground-muted">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 pb-20">
        <Card variant="gradient" className="text-center p-12">
          <h3 className="text-3xl font-bold mb-4 font-display">
            Ready to Transform Your Financial Operations?
          </h3>
          <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using GlobePayX for their global financial needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Landing;