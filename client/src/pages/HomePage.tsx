
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useRef, useState } from 'react';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const getProfileRoute = () => {
    if (!isAuthenticated) {
      return '/login';
    }
    
    if (user?.userType === 'competitor') {
      return '/competitors';
    } else if (user?.userType === 'spectator') {
      return '/spectators';
    }
    
    return '/login';
  };

  const getProfileButtonText = () => {
    if (!isAuthenticated) {
      return 'My Profile';
    }
    
    return user?.userType === 'competitor' ? 'My Dashboard' : 'My Profile';
  };
  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-16">
      <section className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
        {/* Hero content */}
        <div className="lg:w-1/2">
          <h1 className="neon-title text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight tracking-wide">
            Vibecoding Championship
          </h1>
          
          <p className="text-xl mb-8 text-gray-300 font-medium leading-relaxed">
            Welcome to the 60-minute app development championship! 
            Are you competing or here to watch and vote?
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to={getProfileRoute()} className="modern-button-secondary font-pixel">
              {getProfileButtonText()}
            </Link>
            <Link to="/games" className="modern-button font-pixel">
              Explore Apps
            </Link>
          </div>
        </div>
        
        {/* Hero image - Updated with new styling */}
        <div className="lg:w-1/2 relative">
          <div className="modern-card p-0 overflow-hidden group hover:scale-105 transition-transform duration-300">
            <img 
              src="https://i.postimg.cc/Xv8njF5N/VIBER-FOURTH-EDITION-FINAL.png" 
              alt="Viber Fourth Edition" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="mb-16">
        <h2 className="text-neon-orange text-3xl md:text-4xl font-display mb-8 text-center">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="modern-card p-6 text-center">
            <div className="text-neon-green text-5xl font-pixel mb-4">01</div>
            <h3 className="text-neon-orange text-xl font-pixel mb-3">Create</h3>
            <p className="text-gray-300 leading-relaxed">
              Build an AI-powered app in just 60 minutes using your favorite tools.
            </p>
          </div>
          
          <div className="modern-card p-6 text-center">
            <div className="text-neon-green text-5xl font-pixel mb-4">02</div>
            <h3 className="text-neon-orange text-xl font-pixel mb-3">Submit</h3>
            <p className="text-gray-300 leading-relaxed">
              Share your creation and showcase your rapid development skills.
            </p>
          </div>
          
          <div className="modern-card p-6 text-center">
            <div className="text-neon-green text-5xl font-pixel mb-4">03</div>
            <h3 className="text-neon-orange text-xl font-pixel mb-3">Compete</h3>
            <p className="text-gray-300 leading-relaxed">
              Get votes from the audience and climb the leaderboard to win recognition and prizes.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Partners section */}
      <section className="mb-16 overflow-hidden">
        <h2 className="text-neon-orange text-3xl md:text-4xl font-display mb-10 text-center">
          Our Partners
        </h2>
        
        <div className="relative">
          {/* Fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling carousel */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className={`flex gap-16 items-center py-8 ${isDragging ? '' : 'animate-scroll'}`}>
              {/* First set of logos */}
              <div className="flex items-center justify-center min-w-[180px]">
                <a 
                  href="https://delecto.com.au/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://i.postimg.cc/VNzDm8hf/Delecto-2.png" 
                    alt="Delecto" 
                    className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <a 
                  href="https://us.espres.so/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://i.postimg.cc/wvv2RkHn/Espresso.jpg" 
                    alt="Espresso" 
                    className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <a 
                  href="https://ns.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://i.postimg.cc/5tmKC0zQ/ns-logo-white.png" 
                    alt="NS Logo" 
                    className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/RFgHRTpg/replit-logo-jpg.jpg" 
                  alt="Replit" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/fLmPSJHT/Arc.jpg" 
                  alt="Arc" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/0ycXmJc3/Nucleus-Logo.jpg" 
                  alt="Nucleus" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/PJYF83Rz/Nanobag-LOGO-FINAL-RED.jpg" 
                  alt="Nanobag" 
                  className="max-h-11 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/hvFqNk56/Devfolio-White.jpg" 
                  alt="Devfolio" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/B6VrHr3F/fracton-rec-black-skeleton.jpg" 
                  alt="Fracton" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/PfZH1qLt/I-Bet-on-You-LOGO.jpg" 
                  alt="I Bet on You" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/Vsr7m1gw/66-A486-FB-9089-46-E5-AC89-97-FB57-D01219.jpg" 
                  alt="Kindred" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center justify-center min-w-[180px]">
                <a 
                  href="https://delecto.com.au/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://i.postimg.cc/VNzDm8hf/Delecto-2.png" 
                    alt="Delecto" 
                    className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <a 
                  href="https://us.espres.so/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://i.postimg.cc/wvv2RkHn/Espresso.jpg" 
                    alt="Espresso" 
                    className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <a 
                  href="https://ns.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="https://i.postimg.cc/5tmKC0zQ/ns-logo-white.png" 
                    alt="NS Logo" 
                    className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/RFgHRTpg/replit-logo-jpg.jpg" 
                  alt="Replit" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/fLmPSJHT/Arc.jpg" 
                  alt="Arc" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/0ycXmJc3/Nucleus-Logo.jpg" 
                  alt="Nucleus" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/PJYF83Rz/Nanobag-LOGO-FINAL-RED.jpg" 
                  alt="Nanobag" 
                  className="max-h-11 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/hvFqNk56/Devfolio-White.jpg" 
                  alt="Devfolio" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/B6VrHr3F/fracton-rec-black-skeleton.jpg" 
                  alt="Fracton" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/PfZH1qLt/I-Bet-on-You-LOGO.jpg" 
                  alt="I Bet on You" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-center min-w-[180px]">
                <img 
                  src="https://i.postimg.cc/Vsr7m1gw/66-A486-FB-9089-46-E5-AC89-97-FB57-D01219.jpg" 
                  alt="Kindred" 
                  className="max-h-16 object-contain filter brightness-90 hover:brightness-110 transition-all duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="text-center">
        <div className="glass-effect p-8 md:p-12">
          <h2 className="text-neon-orange text-3xl md:text-4xl font-display mb-6">
            Ready to Explore?
          </h2>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300 leading-relaxed font-medium">
            Explore our collection of AI-generated apps created by developers during 60-minute sprints.
            Try them out, vote, and even submit your own creation!
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/games" className="modern-button font-pixel">
              Explore Apps
            </Link>
            <Link to="/submit" className="modern-button-secondary font-pixel">
              Submit Your App
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
