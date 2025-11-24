import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Save, Check } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import Particles from '@/components/Particles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Editor = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Load workspace on mount
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/workspace/${user.uid}`);
        if (response.ok) {
          const workspace = await response.json();
          if (workspace.code) {
            setCode(workspace.code);
            setLanguage(workspace.language || 'typescript');
            toast.success('Workspace loaded!');
          }
        }
      } catch (error) {
        console.error('Failed to load workspace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspace();
  }, [user, API_URL]);

  // Save workspace
  const saveWorkspace = async () => {
    if (!user) {
      toast.error('Please sign in to save your workspace');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/workspace/${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          chatHistory: [] // For future chat implementation
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        toast.success('Workspace saved successfully!');
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        throw new Error('Failed to save workspace');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save workspace');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 30 seconds if there's code
  useEffect(() => {
    if (!user || !code) return;

    const autoSaveInterval = setInterval(() => {
      saveWorkspace();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [code, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Particles Background */}
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

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <div className="flex items-center space-x-2">
            {user && (
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={saveWorkspace}
                disabled={isSaving}
                className={isSaved ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Workspace'}
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-6">Code Editor</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Write, test, and execute your code in our intelligent editor with AI-powered error fixing.
            {user && <span className="block text-sm mt-2 text-green-500">✓ Auto-saving enabled</span>}
          </p>

          <CodeEditor
            height="600px"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            initialCode={code}
            language={language}
            onCodeChange={(newCode) => setCode(newCode)}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
