
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="py-4 border-b-2 border-black bg-viber-dark">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <NavLink 
          to="/" 
          className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Go to home page"
        >
          <img 
            src="https://i.postimg.cc/sfk3kWk9/Viber-Logo.jpg" 
            alt="Viber Logo" 
            className="h-12 w-auto"
          />
        </NavLink>
        
        {/* Mobile menu button */}
        <button 
          className="lg:hidden modern-card p-2"
          onClick={toggleMenu}
        >
          <Menu className="text-orange-400" />
        </button>
        
        {/* Desktop menu */}
        <div className="hidden lg:flex space-x-4">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive 
                ? "px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg border border-purple-400/30 shadow-lg hover:shadow-purple-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 inline-flex items-center justify-center font-pixel text-sm"
                : "px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg border border-orange-400/30 shadow-lg hover:shadow-orange-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 inline-flex items-center justify-center font-pixel text-sm"
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/games" 
            className={({ isActive }) => 
              isActive ? "modern-button-secondary font-pixel" : "modern-button font-pixel"
            }
          >
            Apps
          </NavLink>
          <NavLink 
            to="/leaderboard" 
            className={({ isActive }) => 
              isActive 
                ? "modern-button-accent font-pixel" 
                : "modern-button-accent font-pixel"
            }
          >
            Leaderboard
          </NavLink>
          
          {/* Auth buttons */}
          <div className="flex items-center space-x-3 ml-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-neon-orange">
                  <User size={16} className="mr-2" />
                  <span className="text-sm font-medium">{user?.teamName || user?.name}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg border border-gray-400/30 shadow-lg hover:shadow-gray-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50 flex items-center gap-2 text-sm font-pixel"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="modern-button-secondary font-pixel">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-80 pt-20">
          <div className="px-4 py-2 flex flex-col space-y-3 items-center">
            <NavLink 
              to="/" 
              className="pixel-button w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/games" 
              className="pixel-button w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Apps
            </NavLink>
            <NavLink 
              to="/leaderboard" 
              className="bg-teal-400 hover:bg-teal-500 text-white font-pixel py-3 px-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 active:shadow-none w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </NavLink>
            
            {/* Mobile auth buttons */}
            <div className="border-t border-gray-600 pt-4 mt-4 w-full">
              {isAuthenticated ? (
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-center text-viber-orange">
                    <User size={16} className="mr-1" />
                    <span className="text-sm">{user?.teamName || user?.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="pixel-button-secondary w-full text-center flex items-center justify-center"
                  >
                    <LogOut size={14} className="mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <NavLink 
                    to="/login" 
                    className="pixel-button-accent w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                </div>
              )}
            </div>
            
            <button 
              className="mt-8 pixel-button-secondary w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
