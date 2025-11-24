
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlitchButton from '@/components/GlitchButton';
import { useFadeIn } from '@/utils/animations';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Profile } from '@/components/Profile';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerFade = useFadeIn(100);
  const { user, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Sign in error details:', error);
      toast.error(`Failed to sign in: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out!');
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <header
      style={headerFade.style}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm py-3' : 'py-6'
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.jpg"
              alt="MOMENTO Logo"
              className="h-10 w-10 rounded-lg object-cover mr-2"
            />
            <span className="text-xl font-display font-semibold">MOMENTO</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="font-medium transition-colors hover:text-primary">Features</a>
          <a href="#editor" className="font-medium transition-colors hover:text-primary">Editor</a>
          <a href="#about" className="font-medium transition-colors hover:text-primary">About</a>
          <Link to="/pricing" className="font-medium transition-colors hover:text-primary">Pricing</Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <Profile />
            ) : (
              <>
                <GlitchButton
                  size="sm"
                  className="rounded-full"
                  onClick={handleSignIn}
                >
                  Sign In
                </GlitchButton>
                <GlitchButton
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate('/get-started')}
                >
                  Get Started
                </GlitchButton>
              </>
            )}
          </div>
        </nav>

        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="mr-2 rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <a
                href="#features"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#editor"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Editor
              </a>
              <a
                href="#about"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <Link
                to="/pricing"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 py-2">
                      {user.photoURL && (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium">{user.displayName}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full rounded-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <GlitchButton
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignIn();
                      }}
                    >
                      Sign In
                    </GlitchButton>
                    <GlitchButton
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/get-started');
                      }}
                    >
                      Get Started
                    </GlitchButton>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
