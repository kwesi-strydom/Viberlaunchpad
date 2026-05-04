import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import { useToast } from '@/hooks/use-toast';
import { Home, User, Plus, Edit } from 'lucide-react';

const CompetitorsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { games, loading, error } = useGames();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditGame = (game: any) => {
    // Navigate to submit page with game data for editing
    navigate('/submit', { state: { editGame: game } });
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your competitor dashboard",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      if (user?.userType !== 'competitor') {
        toast({
          title: "Access Restricted",
          description: "This is the competitor dashboard. Spectators have their own portal.",
          variant: "destructive",
        });
        navigate('/spectators');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, toast]);

  // Filter games by the current user's submissions
  const userSubmittedGames = games.filter(game => {
    const teamName = user?.teamName;
    const userName = user?.name;
    
    // Check if game creator matches user's team name or individual name
    return game.creator === teamName || 
           game.creator === userName ||
           game.creator === `Team ${teamName}` ||
           game.creator === `Team ${userName}`;
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="font-pixel text-viber-orange animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <User size={24} className="text-viber-purple" />
          <div>
            <h1 className="text-purple-400 text-3xl md:text-4xl font-display">
              {user?.teamName ? `${user.teamName}'s Dashboard` : `${user?.name}'s Dashboard`}
            </h1>
            <p className="text-sm text-viber-orange font-pixel">
              {user?.teamName ? `Team: ${user.teamName}` : 'Competitor Portal'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="font-pixel text-xl text-viber-yellow mb-2">Your Submitted Apps</h2>
          <p className="text-gray-400 text-sm">
            Apps you've submitted to the championship are shown below.
          </p>
        </div>
        
        <Link to="/submit" className="modern-button font-pixel flex items-center mt-4 md:mt-0">
          <Plus size={16} className="mr-2" />
          Submit App
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="font-pixel text-viber-orange animate-pulse">Loading apps...</div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="font-pixel text-red-500 mb-4">Failed to load apps</div>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : userSubmittedGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="font-pixel text-viber-yellow mb-4">No apps submitted yet</div>
          <p className="text-gray-400">Ready to showcase your 60-minute creation?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userSubmittedGames
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(game => (
              <GameCard 
                key={game.id} 
                game={game}
                onRate={() => {}} // Competitors can't rate their own apps
                isRating={false}
                showEditButton={true}
                onEdit={handleEditGame}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default CompetitorsPage;