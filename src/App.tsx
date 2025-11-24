import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";
import Onboarding from "./pages/Onboarding";
import ProfilePage from "./pages/ProfilePage";
import Pricing from "./pages/Pricing";
import Editor from "./pages/Editor";
import NotFound from "./pages/NotFound";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isNewUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is logged in, profile is incomplete, and not already on onboarding page
    if (!loading && user && isNewUser && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [user, isNewUser, loading, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/get-started" element={
        <ProtectedRoute>
          <GetStarted />
        </ProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/editor" element={
        <ProtectedRoute>
          <Editor />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
