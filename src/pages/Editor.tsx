
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

const Editor = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-6">Code Editor</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Write, test, and execute your code in our intelligent editor with AI-powered error fixing.
          </p>

          <CodeEditor height="600px" theme={theme === 'dark' ? 'vs-dark' : 'light'} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
