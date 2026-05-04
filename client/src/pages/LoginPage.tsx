import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
      console.log('Attempting login for:', formData.email);
      console.log('Mobile device detected:', isMobile);
      console.log('User agent:', navigator.userAgent);
      
      // Test mobile connectivity and clear any cached issues
      if (isMobile) {
        try {
          console.log('Mobile device detected - clearing potential cache issues...');
          console.log('Current cookies:', document.cookie);
          
          // Clear any potentially corrupted session cookies
          document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          console.log('Cleared old session cookies');
          
          const testResponse = await fetch('/api/mobile-test?' + Date.now(), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          const testData = await testResponse.json();
          console.log('Mobile connectivity test result:', testData);
        } catch (testError) {
          console.error('Mobile connectivity test failed:', testError);
        }
      }
      
      const response = await fetch('/api/auth/login?' + Date.now(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        credentials: 'include', // Important for cookies on mobile
        cache: 'no-cache',
        body: JSON.stringify(formData),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Additional mobile debugging
        if (isMobile) {
          console.log('Mobile login debug info:', data.debug);
          console.log('Session ID received:', data.sessionId);
          console.log('Cookies before manual check:', document.cookie);
          
          // Manual cookie check for mobile
          const sessionCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('sessionId='));
          console.log('Session cookie found:', sessionCookie);
          
          // If no cookie was set but we got a session ID, try setting it manually
          if (!sessionCookie && data.sessionId) {
            console.log('No cookie found, setting manually for mobile...');
            document.cookie = `sessionId=${data.sessionId}; path=/; max-age=${24 * 60 * 60}; samesite=lax`;
            console.log('Manual cookie set. New cookies:', document.cookie);
          }
        }
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        // Give mobile browsers extra time to process cookies
        const delay = isMobile ? 2000 : 100;
        setTimeout(() => {
          const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectTo; // Force page reload to update auth state
        }, delay);
      } else {
        const error = await response.json();
        console.log('Login failed:', error);
        console.log('Error debug info:', error.debug);
        
        // Enhanced error messaging with specific debugging
        let errorMessage = error.message || "Invalid credentials";
        if (error.debug) {
          console.log('Login failure debug:', error.debug);
          if (error.debug.reason === 'user_not_found') {
            errorMessage = `No account found with email ${error.debug.email}. Please check your email or sign up first.`;
          } else if (error.debug.reason === 'password_mismatch') {
            errorMessage = `Incorrect password. Password type: ${error.debug.passwordType}, Length: ${error.debug.inputLength}`;
          }
          
          if (isMobile) {
            errorMessage += ` (Mobile: Try typing password manually)`;
          }
        }
          
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
      let errorDesc = "Network or connection issue. Please check your internet and try again.";
      if (isMobile) {
        errorDesc += " Try using a different browser or clearing your browser cache.";
      }
      
      toast({
        title: "Error",
        description: errorDesc,
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
          Login
        </h1>
        
        <form onSubmit={handleSubmit} className="modern-card p-8">
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
          
          <div className="mb-10">
            <label className="block text-neon-orange text-lg font-pixel mb-3">
              Password*
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300 mb-6 text-lg font-medium">Don't have an account?</p>
            <Link to="/signup" className="modern-button-secondary w-full inline-block py-4 text-lg font-pixel">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;