import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type MessageType = 'orderUpdate' | 'notification' | 'ping';

interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

type OrderUpdatePayload = {
  orderId: number;
  status: string;
  timestamp: number;
};

type NotificationPayload = {
  title: string;
  message: string;
  timestamp: number;
  orderId?: number;
};

type WebSocketContextType = {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  notifications: NotificationPayload[];
  clearNotifications: () => void;
  reconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const connectWebSocket = () => {
    try {
      // Create WebSocket connection using the /ws path
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        
        // Authenticate with user ID if available
        if (user) {
          newSocket.send(JSON.stringify({
            type: 'auth',
            payload: { userId: user.id }
          }));
        }
      };

      newSocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'orderUpdate':
              handleOrderUpdate(message.payload as OrderUpdatePayload);
              break;
            case 'notification':
              handleNotification(message.payload as NotificationPayload);
              break;
            case 'ping':
              // Respond with pong to keep connection alive
              newSocket.send(JSON.stringify({ type: 'pong' }));
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        
        // Try to reconnect after delay
        setTimeout(() => {
          if (document.visibilityState !== 'hidden') {
            connectWebSocket();
          }
        }, 3000);
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        newSocket.close();
      };

      setSocket(newSocket);

      // Add visibility change listener to reconnect when tab becomes visible
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        newSocket.close();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !isConnected) {
      connectWebSocket();
    }
  };

  const handleOrderUpdate = (payload: OrderUpdatePayload) => {
    toast({
      title: 'Order Update',
      description: `Order #${payload.orderId} status changed to: ${payload.status}`,
      duration: 5000,
    });
  };

  const handleNotification = (payload: NotificationPayload) => {
    // Add notification to state
    setNotifications(prev => [payload, ...prev].slice(0, 20)); // Keep last 20 notifications
    
    // Show toast
    toast({
      title: payload.title,
      description: payload.message,
      duration: 5000,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const reconnect = () => {
    if (socket) {
      socket.close();
    }
    connectWebSocket();
  };

  // Connect when component mounts or user changes
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user?.id]); // Reconnect if user ID changes

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      lastMessage,
      notifications,
      clearNotifications,
      reconnect
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}