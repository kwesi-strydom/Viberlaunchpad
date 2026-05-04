
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-lg mx-auto">
        <h1 className="font-pixel text-6xl text-viber-purple mb-4 pixel-text">
          404
        </h1>
        
        <div className="font-pixel text-viber-red mb-8 text-xl pixel-text">
          Page Not Found
        </div>
        
        <p className="text-gray-300 mb-10">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        
        <div className="flex justify-center">
          <Link to="/" className="pixel-button">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
