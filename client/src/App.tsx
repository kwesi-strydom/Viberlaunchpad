
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CompetitorsPage from "./pages/CompetitorsPage";
import SpectatorsPage from "./pages/SpectatorsPage";
import GamesPage from "./pages/GamesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SubmitGamePage from "./pages/SubmitGamePage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthProvider";
import { queryClient } from "./lib/queryClient";
import NotificationManager from "./components/NotificationManager";

const App = () => {
  // Global error handling to prevent runtime error overlays
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent rating errors from showing the error overlay
      if (event.reason?.message?.includes('already rated') || 
          event.reason?.isRatingError) {
        console.log('Rating error handled globally, preventing overlay');
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      // Prevent rating-related errors from showing overlay
      if (event.error?.isRatingError || 
          event.message?.includes('already rated')) {
        console.log('Error handled globally, preventing overlay');
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationManager />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/competitors" element={<CompetitorsPage />} />
                <Route path="/spectators" element={<SpectatorsPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/submit" element={<SubmitGamePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
