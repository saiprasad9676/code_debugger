
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTypewriter, useFadeIn } from '@/utils/animations';

const Pricing = () => {
  const title = useTypewriter("Simple, transparent pricing");
  const subtitle = useTypewriter("Choose the plan that works for you", 50, 1000);
  const content = useFadeIn(1500);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-typewriter-container">
            <span className="animate-typewriter">{title.displayText}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 animate-typewriter-container">
            <span className="animate-typewriter">{subtitle.displayText}</span>
          </p>
          
          <div style={content.style} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-card border rounded-xl p-8 text-left flex flex-col">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect for getting started</p>
              <div className="text-4xl font-bold mb-6">$0<span className="text-muted-foreground text-lg font-normal">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                {['Basic AI coding assistance', '3 projects', 'Community support'].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="mt-auto rounded-full">
                Get Started
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-card border-2 border-primary rounded-xl p-8 text-left flex flex-col relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">Popular</div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For individual developers</p>
              <div className="text-4xl font-bold mb-6">$19<span className="text-muted-foreground text-lg font-normal">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Advanced AI coding assistance',
                  'Unlimited projects',
                  'Priority support',
                  'Code optimization',
                  'Collaborative editing'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="mt-auto rounded-full">
                Subscribe Now
              </Button>
            </div>
            
            {/* Team Plan */}
            <div className="bg-card border rounded-xl p-8 text-left flex flex-col">
              <h3 className="text-xl font-semibold mb-2">Team</h3>
              <p className="text-muted-foreground mb-6">For teams and organizations</p>
              <div className="text-4xl font-bold mb-6">$49<span className="text-muted-foreground text-lg font-normal">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Pro',
                  'Team workspace',
                  'Advanced security',
                  'Admin controls',
                  'API access',
                  'Custom integrations'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="mt-auto rounded-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
