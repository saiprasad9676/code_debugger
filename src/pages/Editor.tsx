import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Save, Check, Plus, Trash2, Menu, X as CloseIcon } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Particles from '@/components/Particles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Workspace {
  id: string;
  name: string;
  code: string;
  language: string;
  lastSaved: string;
}

const Editor = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Load all workspaces on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/workspaces/${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data);

          // Load the most recent workspace if available
          if (data.length > 0) {
            loadWorkspace(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [user, API_URL]);

  // Load specific workspace
  const loadWorkspace = async (workspaceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/workspace/${workspaceId}`);
      if (response.ok) {
        const workspace = await response.json();
        setCode(workspace.code);
        setLanguage(workspace.language || 'typescript');
        setCurrentWorkspaceId(workspace.id);
        toast.success(`Loaded: ${workspace.name}`);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
      toast.error('Failed to load workspace');
    }
  };

  // Save new workspace
  const saveNewWorkspace = async () => {
    if (!user) {
      toast.error('Please sign in to save your workspace');
      return;
    }

    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
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
          name: workspaceName,
          code,
          language,
          chatHistory: []
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setWorkspaces([result.workspace, ...workspaces]);
        setCurrentWorkspaceId(result.workspace.id);
        setIsSaveDialogOpen(false);
        setWorkspaceName('');
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

  // Update existing workspace
  const updateWorkspace = async () => {
    if (!currentWorkspaceId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/workspace/${currentWorkspaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          chatHistory: []
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setWorkspaces(workspaces.map(w =>
          w.id === currentWorkspaceId ? result.workspace : w
        ));
        setIsSaved(true);
        toast.success('Workspace updated!');
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        throw new Error('Failed to update workspace');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update workspace');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete workspace
  const deleteWorkspace = async (workspaceId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this workspace?')) return;

    try {
      const response = await fetch(`${API_URL}/api/workspace/${workspaceId}/${user.uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
        if (currentWorkspaceId === workspaceId) {
          setCurrentWorkspaceId(null);
          setCode('');
          setLanguage('typescript');
        }
        toast.success('Workspace deleted');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete workspace');
    }
  };

  // Handle save button click
  const handleSave = () => {
    if (currentWorkspaceId) {
      updateWorkspace();
    } else {
      setIsSaveDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading workspaces...</p>
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

      {/* Header */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden"
            >
              {isSidebarOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaveDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !currentWorkspaceId}
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
                      {isSaving ? 'Saving...' : 'Save'}
                    </>
                  )}
                </Button>
              </>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-8 relative z-10 flex gap-4">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="bg-card border rounded-lg p-4 h-full">
            <h2 className="text-lg font-semibold mb-4">Workspaces</h2>
            <div className="space-y-2">
              {workspaces.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workspaces yet. Create one!</p>
              ) : (
                workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentWorkspaceId === workspace.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-accent'
                      }`}
                    onClick={() => loadWorkspace(workspace.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{workspace.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(workspace.lastSaved).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkspace(workspace.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-display font-bold mb-2">Code Editor</h1>
            <p className="text-muted-foreground">
              {currentWorkspaceId
                ? `Editing: ${workspaces.find(w => w.id === currentWorkspaceId)?.name || 'Untitled'}`
                : 'Create or select a workspace to start coding'}
            </p>
          </div>

          <CodeEditor
            height="600px"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            initialCode={code}
            language={language}
            onCodeChange={(newCode) => setCode(newCode)}
          />
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g., My Python Project"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveNewWorkspace()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNewWorkspace} disabled={isSaving || !workspaceName.trim()}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Editor;
