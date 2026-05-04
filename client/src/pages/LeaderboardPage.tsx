
import { useGames } from '../hooks/useGames';
import { Link } from 'react-router-dom';
import { Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LeaderboardPage = () => {
  const { games, loading, error, refreshGames } = useGames();
  
  // Get top 10 games - backend already sorts by new leaderboard formula
  // No need to re-sort on frontend as server uses Wilson Score-inspired ranking
  const topGames = games.slice(0, 10);

  console.log("Leaderboard games with ratings:", topGames.map(game => ({
    title: game.title,
    rating: game.avg_rating,
    count: game.rating_count
  })));

  const handleRefresh = () => {
    refreshGames();
  };

  // Helper function to render stars based on rating
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} className="text-neon-yellow" fill="currentColor" />);
    }
    
    // Half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative inline-block" style={{ width: '16px', height: '16px' }}>
          <Star size={16} className="text-gray-400" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star size={16} className="text-neon-yellow" fill="currentColor" />
          </div>
        </div>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-400" />);
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-2 font-pixel text-neon-yellow">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-green-400 text-3xl md:text-4xl font-display">
          Leaderboard
        </h1>
        <button 
          onClick={handleRefresh}
          className="modern-button-accent flex items-center gap-2 text-sm font-pixel"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      
      <p className="text-gray-300 text-center mb-6">Top apps by user ratings</p>
      
      {loading ? (
        <div className="text-center py-20">
          <div className="font-pixel text-neon-green animate-pulse">Loading leaderboard...</div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="font-pixel text-red-500 mb-4">Failed to load leaderboard</div>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : topGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="font-pixel text-neon-yellow mb-4">No apps yet!</div>
          <p className="text-gray-400">Be the first to submit an app.</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="modern-card p-0 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-800/50">
                <TableRow>
                  <TableHead className="py-4 px-6 text-left font-pixel text-neon-orange">#</TableHead>
                  <TableHead className="py-4 px-6 text-left font-pixel text-neon-orange">App</TableHead>
                  <TableHead className="py-4 px-6 text-center font-pixel text-neon-orange">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGames.map((game, index) => (
                  <TableRow 
                    key={game.id} 
                    className={`border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors ${index === 0 ? 'bg-gradient-to-r from-orange-500/10 to-transparent' : ''}`}
                  >
                    <TableCell className="py-4 px-6">
                      <span className={`font-pixel text-xl 
                        ${index === 0 ? 'text-neon-yellow' : 
                          index === 1 ? 'text-gray-300' : 
                            index === 2 ? 'text-yellow-600' : 'text-gray-400'}`}
                      >
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center">
                        <img 
                          src={game.thumbnail_url || '/placeholder.svg'} 
                          alt={game.title}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <div className="flex-1">
                          <a 
                            href={game.game_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold text-neon-orange font-pixel hover:text-orange-300 transition-colors cursor-pointer underline decoration-transparent hover:decoration-orange-300"
                          >
                            {game.title}
                          </a>
                          <div className="text-sm text-gray-400 line-clamp-1 font-medium">{game.description}</div>
                          {game.creator && (
                            <div className="text-xs text-orange-400 mt-1 font-pixel">Team {game.creator}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col items-center">
                        {renderRatingStars(game.avg_rating || 0)}
                        <div className="text-xs text-gray-400 mt-1">
                          {game.rating_count || 0} {game.rating_count === 1 ? 'rating' : 'ratings'}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/games" className="modern-button font-pixel">
              View All Apps
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
