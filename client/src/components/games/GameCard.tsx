
import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Game } from '@/types';

interface GameCardProps {
  game: Game;
  onRate: (id: string, rating: number) => void;
  isRating?: boolean;
  userRating?: number; // Individual user's rating for this game
  showUserRating?: boolean; // Whether to show user's rating instead of average
  showEditButton?: boolean; // Whether to show edit button for competitors
  onEdit?: (game: Game) => void; // Callback for edit action
}

const GameCard = ({ game, onRate, isRating = false, userRating, showUserRating = false, showEditButton = false, onEdit }: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const handlePlayNow = () => {
    window.open(game.game_url, '_blank');
  };
  
  const handleRating = (rating: number) => {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    console.log(`Rating clicked: ${rating} stars for game ${game.id} (Mobile: ${isMobile})`);
    onRate(game.id, rating);
  };

  // Generate stars for display
  const renderStars = () => {
    const stars = [];
    // Show user's individual rating if available and requested, otherwise show average
    const baseRating = showUserRating && userRating ? userRating : (game.avg_rating || 0);
    const displayRating = hoverRating !== null ? hoverRating : baseRating;
    
    for (let i = 1; i <= 5; i++) {
      const difference = displayRating - i + 1;
      
      if (difference >= 1) {
        // Full star
        stars.push(
          <Star 
            key={i} 
            className="text-viber-yellow cursor-pointer touch-manipulation" 
            fill="currentColor"
            onClick={() => handleRating(i)}
            onMouseEnter={() => setHoverRating(i)}
            onTouchStart={() => setHoverRating(i)}
            style={{ minHeight: '24px', minWidth: '24px' }}
          />
        );
      } else if (difference > 0 && difference < 1) {
        // Half star
        stars.push(
          <StarHalf 
            key={i} 
            className="text-viber-yellow cursor-pointer touch-manipulation" 
            fill="currentColor" 
            onClick={() => handleRating(i - 0.5)}
            onMouseEnter={() => setHoverRating(i - 0.5)}
            onTouchStart={() => setHoverRating(i - 0.5)}
            style={{ minHeight: '24px', minWidth: '24px' }}
          />
        );
      } else {
        // Empty star
        stars.push(
          <Star 
            key={i} 
            className="text-gray-400 hover:text-viber-yellow cursor-pointer touch-manipulation"
            onClick={() => handleRating(i)}
            onMouseEnter={() => setHoverRating(i)}
            onTouchStart={() => setHoverRating(i)}
            style={{ minHeight: '24px', minWidth: '24px' }}
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <div 
      className="modern-card p-0 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverRating(null);
      }}
    >
      <div className="relative">
        <img 
          src={game.thumbnail_url || '/placeholder.svg'} 
          alt={game.title}
          className="w-full h-48 object-cover rounded-t-lg"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-t-lg">
          <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {showEditButton && onEdit ? (
              <div className="space-y-2">
                <button 
                  className="modern-button w-full text-sm font-pixel"
                  onClick={handlePlayNow}
                >
                  Play Now
                </button>
                <button 
                  className="modern-button-secondary w-full text-sm font-pixel"
                  onClick={() => onEdit(game)}
                >
                  Edit App
                </button>
              </div>
            ) : (
              <button 
                className="modern-button w-full text-sm font-pixel"
                onClick={handlePlayNow}
              >
                Play Now
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-pixel text-neon-orange text-lg mb-1 line-clamp-1 tracking-wide">{game.title}</h3>
          
          {game.creator && (
            <p className="text-xs text-orange-400 font-pixel opacity-80">
              {game.creator.startsWith('Team ') ? game.creator : `Team ${game.creator}`}
            </p>
          )}
        </div>
        
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 font-medium">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <div 
            className={`flex items-center gap-1 ${isRating ? 'opacity-70 pointer-events-none' : ''}`}
            onMouseLeave={() => setHoverRating(null)}
          >
            {renderStars()}
          </div>
          
          <div className="font-pixel text-neon-yellow flex items-center gap-2 text-sm">
            {showUserRating && userRating ? (
              <div className="text-center">
                <span className="text-lg">{userRating.toFixed(1)}</span>
                <div className="text-xs text-orange-400">Your Rating</div>
              </div>
            ) : (
              <>
                <span className="text-lg">{game.avg_rating ? game.avg_rating.toFixed(1) : '0.0'}</span>
                <span className="text-gray-400 text-xs">({game.rating_count || 0})</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
