
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { GameFormData } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

const SubmitGamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitGame } = useGames();
  const { toast } = useToast();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if editing existing game
  const editGame = location.state?.editGame;
  const isEditing = !!editGame;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please sign up and log in to submit apps",
          variant: "destructive",
        });
        navigate('/signup');
        return;
      }
      
      if (user?.userType !== 'competitor') {
        toast({
          title: "Access Restricted",
          description: "Only competitors can submit apps. Spectators can only rate submissions.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, toast]);
  
  const [formData, setFormData] = useState<GameFormData>({
    title: editGame?.title || '',
    description: editGame?.description || '',
    thumbnail_url: editGame?.thumbnail_url || '',
    game_url: editGame?.game_url || '',
    creator: editGame?.creator || ''
  });

  // Update creator field when user data is available (only if not editing)
  useEffect(() => {
    if (user && !isEditing) {
      setFormData(prev => ({ 
        ...prev, 
        creator: user.teamName || user.name || '' 
      }));
    }
  }, [user, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your app",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.game_url.trim()) {
      toast({
        title: "Missing app URL",
        description: "Please provide a URL where your app can be accessed",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Wrap all submission logic in try/catch to ensure it never fails
      try {
        await submitGame(formData);
      } catch (error) {
        // Silently log but don't expose to user
        console.error('Error in form submission handler:', error);
      }
      
      // Always navigate after a short delay regardless of submission result
      setTimeout(() => {
        navigate('/competitors'); // Navigate back to competitor dashboard
      }, 300);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 text-4xl md:text-5xl font-display mb-4 text-center drop-shadow-lg">
            {isEditing ? 'Edit Your App' : 'Submit Your App'}
          </h1>
          <p className="text-gray-300 mb-10 text-center text-lg">
            {isEditing ? 'Update your app submission details' : 'Share your 60-minute app creation with our community'}
          </p>
          
          <form onSubmit={handleSubmit} className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <label className="block text-orange-400 text-xl font-semibold mb-4">
              App Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter the name of your app"
              className="modern-input"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-orange-400 text-xl font-semibold mb-4">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your app in a few sentences"
              className="modern-input h-32 resize-none"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-orange-400 text-xl font-semibold mb-4">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://example.com/your-app-thumbnail.png"
              className="modern-input"
            />
            <p className="text-sm text-gray-400 mt-2">
              Provide a URL to an image representing your app (recommended size: 800x600)
            </p>
          </div>
          
          <div className="mb-8">
            <label className="block text-orange-400 text-xl font-semibold mb-4">
              App URL*
            </label>
            <input
              type="url"
              name="game_url"
              value={formData.game_url}
              onChange={handleChange}
              placeholder="https://example.com/your-app"
              className="modern-input"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              Provide a URL where your app can be accessed
            </p>
          </div>
          
          <div className="mb-10">
            <label className="block text-orange-400 text-xl font-semibold mb-4">
              Creator Name
            </label>
            <input
              type="text"
              name="creator"
              value={formData.creator}
              onChange={handleChange}
              placeholder="Your name or username"
              className="modern-input"
            />
          </div>
          
          <div className="flex justify-center">
            <button 
              type="submit"
              className="modern-button-purple w-full md:w-auto px-12 py-4 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update App' : 'Submit App')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitGamePage;
