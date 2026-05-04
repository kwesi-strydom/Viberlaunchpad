import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'spectator' as 'competitor' | 'spectator',
    teamName: '',
    teammate: '',
    teammateEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          teamName: formData.teamName,
          teammate: formData.teammate,
          teammateEmail: formData.teammateEmail
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Account Created!",
          description: "Welcome to Vibecoding Championship!",
        });
        
        // Redirect based on user type
        if (formData.userType === 'competitor') {
          window.location.href = '/competitors'; // Competitors go to their dashboard
        } else {
          window.location.href = '/spectators'; // Spectators go to their dashboard
        }
      } else {
        const error = await response.json();
        toast({
          title: "Signup Failed",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-neon-purple text-4xl md:text-5xl font-display mb-10 text-center">
          Sign Up
        </h1>
        
        <form onSubmit={handleSubmit} className="modern-card p-8">
          <div className="mb-8">
            <label className="block text-neon-orange text-lg font-pixel mb-3">
              I am a*
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              required
            >
              <option value="spectator">Spectator</option>
              <option value="competitor">Competitor</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-neon-orange text-lg font-pixel mb-3">
              Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-neon-orange text-lg font-pixel mb-3">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
              required
            />
          </div>

          {formData.userType === 'competitor' && (
            <>
              <div className="mb-8">
                <label className="block text-neon-orange text-lg font-pixel mb-3">
                  Team Name*
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g., Team One, Team Two..."
                  className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
                  required
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-neon-orange text-lg font-pixel mb-3">
                  Teammate Name
                </label>
                <input
                  type="text"
                  name="teammate"
                  value={formData.teammate}
                  onChange={handleChange}
                  placeholder="Your teammate's name (optional)"
                  className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-neon-orange text-lg font-pixel mb-3">
                  Teammate Email
                </label>
                <input
                  type="email"
                  name="teammateEmail"
                  value={formData.teammateEmail}
                  onChange={handleChange}
                  placeholder="Your teammate's email (optional)"
                  className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
                />
              </div>
            </>
          )}
          
          <div className="mb-10">
            <label className="block text-neon-orange text-lg font-pixel mb-3">
              Password*
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
              required
            />
          </div>
          
          <div className="mb-10">
            <label className="block text-neon-orange text-lg font-pixel mb-3">
              Confirm Password*
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-400"
              required
            />
          </div>
          
          <div className="flex justify-center mb-8">
            <button 
              type="submit"
              className="modern-button-purple w-full py-4 text-lg font-pixel"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300 mb-6 text-lg font-medium">Already have an account?</p>
            <Link to="/login" className="modern-button-secondary w-full inline-block py-4 text-lg font-pixel">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;