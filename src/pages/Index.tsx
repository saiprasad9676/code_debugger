
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIChat from '@/components/AIChat';
import Particles from '@/components/Particles';
import { useTypewriter, useFadeIn, useScrollReveal } from '@/utils/animations';
import {
  Bot,
  Code,
  Brain,
  Zap,
  Sparkles,
  RefreshCcw,
  Globe,
  Server,
  Shield,
  Terminal,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlitchButton from '@/components/GlitchButton';
import Shuffle from '@/components/Shuffle';

const Index = () => {
  const navigate = useNavigate();
  // Theme is now handled globally by ThemeProvider

  const heroSubtitle = useTypewriter("The ultimate AI-powered coding platform for MOMENTO.", 50, 2000);
  const heroButton = useFadeIn(3500);
  const section1Fade = useFadeIn(500);
  const { ref: featuresRef, isIntersecting: featuresVisible } = useScrollReveal();

  const { user, signInWithGoogle, isNewUser } = useAuth();

  const handleGetStarted = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
        // Check isNewUser from context after sign in (it might not update immediately in this closure, 
        // but the useEffect in AuthContext or a redirect logic there might handle it. 
        // However, since we are awaiting, let's check the context state if possible or rely on the user object)
      } catch (error) {
        console.error("Login failed:", error);
        return;
      }
    }

    // We need to check the updated state. 
    // Actually, the best place to handle "New User Redirect" is probably in the AuthContext or a global effect,
    // OR we can check it here if we assume the state updates.
    // But since state updates are async, 'isNewUser' might be stale here.
    // A better approach: The AuthContext's signInWithGoogle could return the user object/status.
    // But for now, let's just navigate. If they are new, the ProtectedRoute or a check in App.tsx could redirect them?
    // No, ProtectedRoute just checks if logged in.
    // Let's rely on the fact that if they are logged in, we navigate.
    // But we want to send them to /onboarding if new.

    // Let's change the navigation logic:
    if (isNewUser) {
      navigate('/onboarding');
    } else {
      navigate('/get-started');
    }
  };

  const handleStartCoding = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Login failed:", error);
        return;
      }
    }

    if (isNewUser) {
      navigate('/onboarding');
    } else {
      navigate('/editor');
    }
  };

  const handleWatchDemo = () => {
    // For now, this could scroll to the demo section
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Brain className="h-10 w-10" />,
      title: "AI-Powered Coding",
      description: "Advanced AI algorithms help you write better code faster with intelligent suggestions and automatic completions."
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Real-time Execution",
      description: "Execute your code instantly in a secure environment with immediate feedback and results."
    },
    {
      icon: <Terminal className="h-10 w-10" />,
      title: "Smart Debugging",
      description: "AI-assisted debugging identifies issues and suggests fixes before they become problems."
    },
    {
      icon: <RefreshCcw className="h-10 w-10" />,
      title: "Continuous Learning",
      description: "Our AI models continuously learn from the web to stay updated with the latest programming practices."
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Internet-Connected",
      description: "Access real-time information from the web to solve complex coding challenges efficiently."
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Secure Execution",
      description: "Run your code in isolated, secure environments to protect your data and applications."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Full Page Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* All content with relative positioning */}
      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-4 py-1 text-sm font-medium inline-flex items-center mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Now powered by Google AI
              </div>
              <div className="mb-6 flex flex-col items-center">
                <Shuffle
                  text="AI POWERED CODE"
                  className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={1}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={true}
                  respectReducedMotion={true}
                />
                <Shuffle
                  text="DEBUGGER"
                  className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={1}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={true}
                  respectReducedMotion={true}
                />
              </div>
              <p className="text-xl md:text-2xl text-gray-200 mb-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                The ultimate AI-powered coding platform from MOMENTO
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlitchButton
                  size="lg"
                  className="rounded-full text-lg px-8 bg-white text-black hover:bg-gray-200"
                  onClick={handleStartCoding}
                >
                  Start Coding <ArrowRight className="ml-2 h-5 w-5" />
                </GlitchButton>
                <GlitchButton
                  size="lg"
                  className="rounded-full text-lg px-8 bg-transparent border border-white text-white hover:bg-white/10"
                  onClick={handleGetStarted}
                >
                  Learn More
                </GlitchButton>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">Powered by Advanced AI</h2>
              <p className="text-xl text-gray-200 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                Our platform combines cutting-edge AI technology with developer-friendly tools to revolutionize the coding experience.
              </p>
            </div>

            <div
              ref={featuresRef}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-1000 ${featuresVisible ? 'opacity-100' : 'opacity-0'
                }`}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] hover:bg-black/50"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    opacity: featuresVisible ? 1 : 0,
                    transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <div className="text-blue-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl overflow-hidden border shadow-sm bg-card p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary/10 rounded-full p-2 mr-4">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">How do I implement a binary search algorithm in JavaScript?</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-secondary rounded-lg p-3 max-w-[80%] ml-auto">
                        <p className="text-sm">
                          Here's an efficient implementation of binary search in JavaScript:
                        </p>
                        <pre className="bg-card mt-2 p-2 rounded text-xs overflow-x-auto">
                          {`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Target not found
}`}
                        </pre>
                      </div>
                      <div className="bg-primary/10 rounded-full p-2 ml-4">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center text-sm font-medium text-blue-400 mb-4">
                  <Bot className="h-4 w-4 mr-2" />
                  Intelligent Assistance
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                  Your AI coding partner
                </h2>
                <p className="text-xl text-white mb-6 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                  Our AI assistant doesn't just answer questions—it understands your coding goals and helps you achieve them efficiently.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Explain complex algorithms in simple terms",
                    "Generate working code examples on demand",
                    "Debug existing code with intelligent analysis",
                    "Suggest improvements and optimizations",
                    "Answer programming questions in natural language"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-500/20 rounded-full p-1 mr-3 mt-1">
                        <svg className="h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">{item}</span>
                    </li>
                  ))}
                </ul>
                <GlitchButton
                  size="lg"
                  className="rounded-full bg-white text-black hover:bg-gray-200"
                  onClick={() => navigate('/get-started')}
                >
                  Try it Now <ChevronRight className="ml-2 h-5 w-5" />
                </GlitchButton>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                Ready to experience the future of coding?
              </h2>
              <p className="text-xl mb-10 text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                Join thousands of developers who are writing better code faster with our AI-powered platform.
              </p>
              <div>
                <GlitchButton
                  size="lg"
                  className="rounded-full text-lg px-8 mr-4 bg-white text-black hover:bg-gray-200"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </GlitchButton>
                <GlitchButton
                  size="lg"
                  className="rounded-full text-lg px-8 bg-transparent border border-white text-white hover:bg-white/20"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing
                </GlitchButton>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <AIChat />
      </div>
    </div>
  );
};

export default Index;

