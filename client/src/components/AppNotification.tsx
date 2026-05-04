import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AppNotificationProps {
  creator: string;
  title: string;
  thumbnail_url?: string | null;
  onClose: () => void;
}

const AppNotification = ({ creator, title, thumbnail_url, onClose }: AppNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`w-[280px] transition-all duration-300 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gray-900/95 border-2 border-orange-500/50 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="relative">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white transition-colors"
            data-testid="button-close-notification"
          >
            <X size={16} />
          </button>

          <div className="p-3 bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-b border-orange-500/30">
            <p className="text-xs font-pixel text-orange-400 uppercase tracking-wider">
              New Submission!
            </p>
          </div>

          {thumbnail_url && (
            <div className="relative h-32 overflow-hidden bg-gray-800">
              <img
                src={thumbnail_url}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-3">
            <p className="text-white font-semibold text-sm mb-1 line-clamp-1" data-testid="text-app-title">
              {title}
            </p>
            <p className="text-orange-400 text-sm font-pixel" data-testid="text-team-name">
              Team {creator} has just shipped
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNotification;
