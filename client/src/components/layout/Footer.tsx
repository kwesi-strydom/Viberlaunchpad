
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-viber-dark border-t-2 border-black py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              Everyone can build
            </p>
          </div>
          
          <div className="flex flex-col items-center mb-4 md:mb-0">
            <button 
              onClick={() => window.location.href = '/'}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Go to home page"
            >
              <img 
                src="https://i.postimg.cc/sfk3kWk9/Viber-Logo.jpg" 
                alt="Viber Logo" 
                className="h-12 w-auto"
              />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6">
            <NavLink 
              to="/competitors" 
              className="text-viber-red hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/competitors';
              }}
            >
              Competitors
            </NavLink>
            <NavLink 
              to="/spectators" 
              className="text-teal-400 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/spectators';
              }}
            >
              Spectators
            </NavLink>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Viber - All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
