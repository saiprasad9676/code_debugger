import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Copy, Download, Code2, Zap, Check, X, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlitchButton from '@/components/GlitchButton';
import { useScrollReveal } from '@/utils/animations';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAICompletion } from '@/utils/aiService';
import { LANGUAGE_TEMPLATES, executePistonCode } from '@/utils/languageUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  theme?: string;
  onCodeChange?: (code: string) => void;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '// Write your code here...\n\nfunction helloWorld() {\n  console.log("Hello, world!");\n  return "Hello, world!";\n}\n\n// Call the function\nhelloWorld();',
  language = 'typescript',
  theme = 'vs-dark',
  onCodeChange,
  height = '500px'
}) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFixingWithAI, setIsFixingWithAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const editorRef = useRef<any>(null);
  const { ref, isIntersecting } = useScrollReveal();
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [stdin, setStdin] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setIsSettingsOpen(false);
    toast.success("API Key saved successfully");
  };

  useEffect(() => {
    const loadPyodideScript = async () => {
      if (selectedLanguage === 'python' && !pyodide && !isPyodideLoading) {
        setIsPyodideLoading(true);
        try {
          // Check if script is already loaded
          if (!(window as any).loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
            script.async = true;
            document.body.appendChild(script);
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'));
            });
          }

          const pyodideInstance = await (window as any).loadPyodide();
          setPyodide(pyodideInstance);
        } catch (error: any) {
          console.error('Failed to load Pyodide:', error);
          toast.error(`Failed to load Python runtime: ${error.message}`);
        } finally {
          setIsPyodideLoading(false);
        }
      }
    };

    loadPyodideScript();
  }, [selectedLanguage, pyodide, isPyodideLoading]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    // Store monaco instance if needed, or just use it here
    editorRef.current.monaco = monaco;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setHasError(false);
      setAiSuggestion(null);
      if (onCodeChange) {
        onCodeChange(value);
      }
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setIsOutputVisible(true);

    // Clear previous output
    setOutput('');
    setHasError(false);

    // Capture console output
    const logs: string[] = [];
    const errors: string[] = [];

    if (selectedLanguage === 'python') {
      if (!pyodide) {
        setOutput('Loading Python runtime... Please wait.');
        return; // Wait for effect to load it, or trigger it? Effect handles it.
      }

      try {
        // Capture Python output
        pyodide.setStdout({
          batched: (msg: string) => {
            logs.push(msg);
          }
        });
        pyodide.setStderr({
          batched: (msg: string) => {
            errors.push(msg);
          }
        });

        // Set stdin for Python
        // We need to use pyodide.globals.set or run a script to set sys.stdin
        // The easiest way for simple input is to mock sys.stdin
        await pyodide.runPythonAsync(`
import sys
import io
sys.stdin = io.StringIO(${JSON.stringify(stdin)})
        `);

        await pyodide.runPythonAsync(code);

        if (errors.length > 0) {
          setOutput(`Error: ${errors.join('\n')}`);
          setHasError(true);
        } else if (logs.length > 0) {
          setOutput(logs.join('\n'));
        } else {
          setOutput('Code executed successfully with no output.');
        }
      } catch (error: any) {
        setHasError(true);
        setOutput(`Error: ${error.message}`);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // JavaScript/TypeScript Execution
    if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalConsoleLog(...args);
      };

      console.error = (...args) => {
        errors.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalConsoleError(...args);
      };

      try {
        // Clear markers
        if (editorRef.current && editorRef.current.monaco) {
          const model = editorRef.current.getModel();
          editorRef.current.monaco.editor.setModelMarkers(model, 'owner', []);
        }

        // For security in a real app, you'd want to use a sandbox
        // This is just for demo purposes
        // eslint-disable-next-line no-new-func
        const result = new Function('print', code)((...args: any[]) => {
          console.log(...args);
        });

        if (errors.length > 0) {
          setOutput(`Error: ${errors.join('\n')}`);
          setHasError(true);
        } else if (logs.length > 0) {
          setOutput(logs.join('\n'));
        } else if (result !== undefined) {
          setOutput(`Result: ${result}`);
        } else {
          setOutput('Code executed successfully with no output.');
        }
      } catch (error) {
        setHasError(true);
        let errorMessage = 'An unknown error occurred.';

        if (error instanceof Error) {
          errorMessage = error.message;

          // Try to parse line number from stack
          // Stack format varies, but often contains "at <anonymous>:line:col"
          // Since we use new Function, it might be relative to the function body
          const stack = error.stack || '';
          const match = stack.match(/<anonymous>:(\d+):(\d+)/);

          if (match && editorRef.current && editorRef.current.monaco) {
            const lineNumber = parseInt(match[1], 10);
            // Adjust line number if needed (new Function wraps code)
            // Usually it's 1-based relative to the string passed to new Function
            // So it should match the editor line numbers if the code is the same

            const model = editorRef.current.getModel();
            editorRef.current.monaco.editor.setModelMarkers(model, 'owner', [{
              startLineNumber: lineNumber,
              startColumn: 1,
              endLineNumber: lineNumber,
              endColumn: 1000,
              message: errorMessage,
              severity: 8 // MarkerSeverity.Error
            }]);
          }
        }

        setOutput(errorMessage);
      } finally {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        setIsRunning(false);
      }
      return;
    }

    // Piston Execution for other languages
    try {
      const result = await executePistonCode(selectedLanguage, code, stdin);

      // Check if there's actual output (stdout)
      const hasOutput = result.run.stdout && result.run.stdout.trim().length > 0;
      const hasStderr = result.run.stderr && result.run.stderr.trim().length > 0;
      const hasCompileError = result.compile && result.compile.stderr && result.compile.stderr.trim().length > 0;

      // If there's a compilation error with no output, show error
      if (hasCompileError && !hasOutput) {
        setHasError(true);
        setOutput(`Compilation Error:\n${result.compile.stderr}`);
      }
      // If there's runtime stderr but also stdout, show output with warning
      else if (hasStderr && hasOutput) {
        setOutput(`${result.run.stdout}\n\n⚠️ Warning:\n${result.run.stderr}`);
      }
      // If there's only stderr with no output, it's an error
      else if (hasStderr && !hasOutput) {
        setHasError(true);
        setOutput(`Error:\n${result.run.stderr}`);
      }
      // Otherwise show the output
      else {
        setOutput(result.run.stdout || 'Code executed successfully with no output.');
      }
    } catch (error: any) {
      setHasError(true);
      setOutput(`Execution Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const fixWithAI = async () => {
    console.log("=== AI Fix Started ===");
    console.log("Current language:", selectedLanguage);
    console.log("Current error:", output);
    console.log("API Key present:", !!apiKey);

    setIsFixingWithAI(true);
    try {
      const prompt = `You are an expert coding assistant. Fix the following ${selectedLanguage} code that has this error: "${output}".
    
Code:
${code}

Instructions:
1. Analyze the error and the code.
2. Provide the COMPLETE fixed code.
3. Do NOT provide explanations, markdown formatting, or code blocks. Just the raw code.
4. If the code is incomplete, complete it to make it runnable.`;

      console.log("Calling getAICompletion...");
      const response = await getAICompletion({
        text: prompt,
        language: selectedLanguage,
        apiKey: apiKey // Pass the custom API key
      });

      console.log("AI Response received:", response);

      if (!response.isError) {
        // Extract code from the response
        let fixedCode = response.text;

        // If the response is in a code block, extract just the code
        // Match ```language\n code ``` or just ``` code ```
        // Allow for optional language identifier, optional spaces, and capture content
        const codeBlockRegex = /```(?:[\w\s]*)\n?([\s\S]*?)```/;
        const match = fixedCode.match(codeBlockRegex);
        if (match && match[1]) {
          fixedCode = match[1].trim();
        } else {
          // Fallback: if no code blocks, try to strip inline backticks if it's a single line or short
          if (fixedCode.startsWith('`') && fixedCode.endsWith('`')) {
            fixedCode = fixedCode.slice(1, -1);
          }
        }

        console.log("Fixed code extracted successfully");
        setAiSuggestion(fixedCode);
      } else {
        const errorMessage = response.errorMessage || 'Unknown error';
        console.error("AI Response error:", errorMessage);
        toast.error(`Failed to get AI suggestions: ${errorMessage}`);
        setOutput(`AI Error: ${errorMessage}\n\nPlease check your API key in Settings or try again later.`);
        setHasError(true);
      }
    } catch (error: any) {
      console.error("=== AI Fix Error ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      const errorMessage = error.message || "Unknown error";
      toast.error("Failed to get AI suggestions");
      setOutput(`AI Error: ${errorMessage}\n\nPlease check your API key in Settings or try again later.`);
      setHasError(true);
    } finally {
      setIsFixingWithAI(false);
      console.log("=== AI Fix Completed ===");
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setCode(aiSuggestion);
      setAiSuggestion(null);
      toast.success("Applied AI suggestion");
    }
  };

  const dismissAISuggestion = () => {
    setAiSuggestion(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${selectedLanguage}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded successfully");
  };

  const languageOptions = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'rust', label: 'Rust' },
    { value: 'scala', label: 'Scala' },
    { value: 'perl', label: 'Perl' },
    { value: 'lua', label: 'Lua' },
    { value: 'r', label: 'R' },
    { value: 'dart', label: 'Dart' },
    { value: 'haskell', label: 'Haskell' },
    { value: 'elixir', label: 'Elixir' },
    { value: 'clojure', label: 'Clojure' },
    { value: 'fsharp', label: 'F#' },
    { value: 'groovy', label: 'Groovy' },
  ];

  return (
    <div
      ref={ref}
      className={`border rounded-xl shadow-sm overflow-hidden transition-opacity duration-1000 ${isIntersecting ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="bg-card border-b flex justify-between items-center p-2 px-4">
        <div className="flex items-center space-x-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Editor</span>
          <div className="w-40">
            <Select
              value={selectedLanguage}
              onValueChange={(value) => {
                setSelectedLanguage(value);
                // Update code to template if it's the default "Hello World" or empty, 
                // or just always update it as per user request "when i can the language the code should also change"
                // To be safe and user-friendly, let's update it.
                if (LANGUAGE_TEMPLATES[value]) {
                  setCode(LANGUAGE_TEMPLATES[value]);
                  if (onCodeChange) onCodeChange(LANGUAGE_TEMPLATES[value]);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                <span className="text-xs">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editor Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Google Gemini API Key"
                    className="col-span-3"
                    type="password"
                  />
                </div>
                <div className="col-span-4 text-xs text-muted-foreground space-y-2">
                  <p className="font-semibold">How to get your FREE API key:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Create API Key"</li>
                    <li>Copy the key and paste it above</li>
                  </ol>
                  <p className="text-yellow-600 dark:text-yellow-500 mt-2">
                    ⚠️ The shared key has quota limits. Use your own key for unlimited AI fixes!
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveApiKey}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
          >
            <Copy className="h-4 w-4 mr-1" />
            <span className="text-xs">Copy</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">Download</span>
          </Button>
          <GlitchButton
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-1" />
            <span className="text-xs">{isRunning ? 'Running...' : (isPyodideLoading && selectedLanguage === 'python' ? 'Loading Python...' : 'Run')}</span>
          </GlitchButton>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className={`transition-all duration-300 ${isOutputVisible ? 'w-full md:w-1/2' : 'w-full'}`}>
          <Editor
            height={height}
            language={selectedLanguage}
            value={code}
            theme={theme}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 10 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              automaticLayout: true,
            }}
          />
        </div>

        {isOutputVisible && (
          <div className="border-t md:border-t-0 md:border-l bg-card p-4 w-full md:w-1/2 flex flex-col" style={{ height }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Output</h3>
              <div className="flex items-center space-x-2">
                {hasError && !isFixingWithAI && !aiSuggestion && (
                  <GlitchButton
                    size="sm"
                    onClick={fixWithAI}
                    disabled={isFixingWithAI}
                    className="text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {isFixingWithAI ? 'Fixing...' : 'Fix with AI'}
                  </GlitchButton>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOutputVisible(false)}
                >
                  <span className="text-xs">Hide</span>
                </Button>
              </div>
            </div>

            <div className={`rounded-lg p-3 font-mono text-sm overflow-auto flex-1 whitespace-pre-wrap ${hasError ? 'bg-red-500/10 border border-red-500/20' : 'bg-secondary'}`}>
              {isRunning ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>Running code...</span>
                </div>
              ) : (
                <div>
                  {hasError && <div className="font-bold text-red-500 mb-2">Execution Error:</div>}
                  <div className={`${hasError ? 'text-red-500' : ''}`}>
                    {output || 'No output'}
                  </div>
                </div>
              )}
            </div>

            {aiSuggestion && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">AI Suggestion</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyAISuggestion}
                      className="text-xs text-green-500 border-green-500 hover:bg-green-500/10"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={dismissAISuggestion}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 font-mono text-sm overflow-auto max-h-[200px] whitespace-pre-wrap border border-green-500/20">
                  {aiSuggestion}
                </div>
              </div>
            )}

            {isFixingWithAI && !aiSuggestion && (
              <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Getting AI suggestions...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
