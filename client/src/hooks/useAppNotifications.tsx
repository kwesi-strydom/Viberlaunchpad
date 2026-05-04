import { useEffect, useState } from 'react';

interface AppNotification {
  id: string;
  creator: string;
  title: string;
  thumbnail_url?: string | null;
}

export const useAppNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('Connected to notification WebSocket');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'new_app' && message.data) {
              const notification: AppNotification = {
                id: message.data.id || Date.now().toString(),
                creator: message.data.creator || 'Unknown',
                title: message.data.title || 'New App',
                thumbnail_url: message.data.thumbnail_url
              };
              setNotifications((prev) => [...prev, notification]);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed, reconnecting in 3s...');
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, removeNotification };
};
