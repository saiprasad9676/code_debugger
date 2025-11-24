import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTypewriter, useFadeIn } from '@/utils/animations';
import { toast } from "sonner";
import Squares from '@/components/Squares';
import GlitchButton from '@/components/GlitchButton';

const GetStarted = () => {
  const navigate = useNavigate();
  const title = useTypewriter("Let's get you coding with AI");
  const subtitle = useTypewriter("Set up your first project in minutes", 50, 1000);
  const content = useFadeIn(1500);

  const handleCreateProject = () => {
    toast.success("New project created successfully!");
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction='diagonal'
          borderColor='#333'
          hoverFillColor='#222'
        />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Rocket className="h-8 w-8" />
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-typewriter-container">
            <span className="animate-typewriter">{title.displayText}</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 animate-typewriter-container">
            <span className="animate-typewriter">{subtitle.displayText}</span>
          </p>

          <div style={content.style} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 text-left shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-white">Quick Start Guide</h2>

            <ol className="space-y-6">
              <li className="flex">
                <div className="bg-blue-500/20 text-blue-400 rounded-full h-8 w-8 flex items-center justify-center font-semibold mr-4 flex-shrink-0 border border-blue-500/30">1</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Create your first project</h3>
                  <p className="text-gray-300">Start with a blank template or choose from our pre-built examples to get started quickly.</p>
                </div>
              </li>

              <li className="flex">
                <div className="bg-purple-500/20 text-purple-400 rounded-full h-8 w-8 flex items-center justify-center font-semibold mr-4 flex-shrink-0 border border-purple-500/30">2</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Interact with the AI</h3>
                  <p className="text-gray-300">Use natural language to ask the AI to help you build features, debug code, or optimize performance.</p>
                </div>
              </li>

              <li className="flex">
                <div className="bg-green-500/20 text-green-400 rounded-full h-8 w-8 flex items-center justify-center font-semibold mr-4 flex-shrink-0 border border-green-500/30">3</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Deploy your app</h3>
                  <p className="text-gray-300">With one click, deploy your application to our cloud hosting or export to your own infrastructure.</p>
                </div>
              </li>
            </ol>

            <div className="mt-8 flex justify-center">
              <GlitchButton size="lg" className="rounded-full px-8 py-6 text-lg font-bold tracking-wide" onClick={handleCreateProject}>
                <span className="mr-2">⚡</span> CREATE NEW PROJECT
              </GlitchButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
