import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import { useToast } from '@/hooks/use-toast';
import { Home, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const SpectatorsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { games, loading, error, rateGame, ratingInProgress, refreshGames } = useGames();
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your spectator dashboard",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate, toast]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.userType !== 'spectator') {
      toast({
        title: "Access Restricted",
        description: "This is the spectator dashboard. Competitors have their own portal.",
        variant: "destructive",
      });
      navigate('/competitors');
    }
  }, [isLoading, isAuthenticated, user, navigate, toast]);

  // Get session ID for fetching ratings
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let storedSessionId = localStorage.getItem('viber_session_id');
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem('viber_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Fetch user's personal ratings from backend (use authenticated endpoint for better sync)
  const { data: userRatingsData = [] } = useQuery({
    queryKey: ['/api/user/ratings'],
    queryFn: async () => {
      const response = await fetch('/api/user/ratings', {
        credentials: 'include' // Include cookies for authentication
      });
      if (!response.ok) {
        // Fallback to session-based if authentication fails
        if (sessionId) {
          const fallbackResponse = await fetch(`/api/ratings/${sessionId}`);
          if (fallbackResponse.ok) {
            return fallbackResponse.json();
          }
        }
        throw new Error('Failed to fetch ratings');
      }
      return response.json();
    },
    enabled: !!user
  });

  // Convert ratings array to object for easier lookup
  useEffect(() => {
    const ratingsMap: Record<string, number> = {};
    userRatingsData.forEach((rating: any) => {
      ratingsMap[rating.game_id] = rating.rating;
    });
    setUserRatings(ratingsMap);
  }, [userRatingsData]);

  const handleRateGame = async (gameId: string, rating: number) => {
    try {
      console.log(`Spectator dashboard - Rating game ${gameId} with ${rating} stars`);
      
      // Update local state immediately for instant feedback
      setUserRatings(prev => ({ ...prev, [gameId]: rating }));
      
      await rateGame(gameId, rating);
      
      // Force refresh the games data to get updated averages
      await refreshGames();
      
      // Update user's personal ratings locally
      setUserRatings(prev => ({ ...prev, [gameId]: rating }));
      
      toast({
        title: "Rating Updated!",
        description: `You rated this app ${rating} stars`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create games with user's personal ratings
  const gamesWithUserRatings = games.map(game => ({
    ...game,
    avg_rating: userRatings[game.id] || 0,
    rating_count: userRatings[game.id] ? 1 : 0
  }));

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="font-pixel text-neon-orange animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <User size={28} className="text-neon-purple" />
          <div>
            <h1 className="text-purple-400 text-3xl md:text-4xl font-display">
              {user?.name}'s Dashboard
            </h1>
            <p className="text-orange-400 font-pixel">Spectator Portal</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-neon-yellow text-2xl font-display mb-3">Your Rated Apps</h2>
        <p className="text-gray-300 font-medium leading-relaxed">
          Apps you've rated are shown below with your personal ratings. 
          The ratings shown here are your individual ratings, not the average.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="font-pixel text-neon-orange animate-pulse">Loading apps...</div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="font-pixel text-red-500 mb-4">Failed to load apps</div>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : gamesWithUserRatings.filter(game => userRatings[game.id]).length === 0 ? (
        <div className="text-center py-20">
          <div className="font-pixel text-neon-yellow mb-4">No rated apps yet</div>
          <p className="text-gray-400 mb-6">Start rating apps to see them appear in your dashboard!</p>
          <Link to="/games" className="modern-button-accent font-pixel">
            Rate Some Apps
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {gamesWithUserRatings
            .filter(game => userRatings[game.id])
            .map(game => (
              <GameCard 
                key={game.id} 
                game={game}
                onRate={handleRateGame}
                isRating={ratingInProgress?.[game.id] || false}
                userRating={userRatings[game.id]}
                showUserRating={true}
              />
            ))
          }
        </div>
      )}
      
      {/* Explore Apps Button */}
      <div className="text-center pt-8 border-t border-gray-700/30 mt-8">
        <h3 className="text-neon-orange text-xl font-display mb-4">Want to rate more apps?</h3>
        <Link 
          to="/games" 
          className="modern-button font-pixel"
        >
          Explore Apps
        </Link>
      </div>
    </div>
  );
};

export default SpectatorsPage;