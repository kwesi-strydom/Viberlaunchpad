
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GameCard from '../components/games/GameCard';
import { useGames } from '../hooks/useGames';
import { useAuth } from '@/components/AuthProvider';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GamesPage = () => {
  const { games, loading, error, rateGame, ratingInProgress, refreshGames } = useGames();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRateGame = async (gameId: string, rating: number) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/games');
      toast({
        title: "Login Required",
        description: "Please sign up first, then log in to rate apps",
        variant: "destructive",
      });
      navigate('/signup');
      return;
    }
    
    // Check if user is a spectator (only spectators can rate apps)
    if (isAuthenticated && user?.userType === 'competitor') {
      toast({
        title: "Access Restricted",
        description: "Only spectators can rate apps. Competitors cannot vote on submissions.",
        variant: "destructive",
      });
      return;
    }
    
    await rateGame(gameId, rating);
  };
  
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    refreshGames();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <h1 className="text-orange-400 text-3xl md:text-4xl font-display">
            Apps Gallery
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900/80 border border-gray-700/50 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 w-full transition-all"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button 
            onClick={handleRefresh}
            className="modern-button-accent flex items-center gap-2 text-sm font-pixel"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="text-neon-orange font-pixel animate-pulse">Loading apps...</div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="font-pixel text-red-400 mb-4">Failed to load apps</div>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="font-pixel text-neon-yellow mb-4">No apps found</div>
          {searchQuery ? (
            <p className="text-gray-400">Try a different search query</p>
          ) : (
            <p className="text-gray-400">Be the first to submit an app!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(game => (
              <GameCard 
                key={game.id} 
                game={game}
                onRate={handleRateGame}
                isRating={ratingInProgress?.[game.id] || false}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default GamesPage;
