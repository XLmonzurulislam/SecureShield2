import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from '../vite';

interface Client {
  id: string;
  userId?: number;
  ws: WebSocket;
}

type MessageType = 'orderUpdate' | 'notification' | 'ping';

interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();

  initialize(server: Server) {
    try {
      // Create WebSocket server with a specific path to avoid conflict with Vite HMR
      this.wss = new WebSocketServer({ 
        server, 
        path: '/ws'  // Use specific path for our WebSocket connections
      });
      log('WebSocket server initialized on path /ws', 'websocket');

      // Handle connection events
      this.wss.on('connection', (ws: WebSocket) => {
        const clientId = this.generateClientId();
        this.clients.set(clientId, { id: clientId, ws });
        log(`Client connected: ${clientId}`, 'websocket');

        // Send welcome message
        this.sendToClient(clientId, {
          type: 'notification',
          payload: { message: 'Connected to CyberShield WebSocket Server' }
        });

        // Handle messages
        ws.on('message', (message: string) => {
          try {
            const parsedMessage = JSON.parse(message.toString()) as any;
            this.handleMessage(clientId, parsedMessage);
          } catch (error) {
            log(`Error parsing message: ${error}`, 'websocket');
          }
        });

        // Handle disconnection
        ws.on('close', () => {
          log(`Client disconnected: ${clientId}`, 'websocket');
          this.clients.delete(clientId);
        });

        // Handle errors
        ws.on('error', (error) => {
          log(`WebSocket error for client ${clientId}: ${error}`, 'websocket');
        });
      });

      // Start heartbeat to keep connections alive
      setInterval(() => this.pingAllClients(), 30000);
    } catch (error) {
      log(`Failed to initialize WebSocket server: ${error}`, 'websocket');
    }
  }

  // Handle incoming messages from clients
  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Handle authentication message
    if (message.type === 'auth') {
      client.userId = message.payload.userId;
      this.clients.set(clientId, client);
      log(`Client ${clientId} authenticated as user ${client.userId}`, 'websocket');
      return;
    }

    // Handle pong response
    if (message.type === 'pong') {
      log(`Received pong from client ${clientId}`, 'websocket');
      return;
    }

    log(`Received message from client ${clientId}: ${JSON.stringify(message)}`, 'websocket');
  }

  // Generate a unique client ID
  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Send message to a specific client
  sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Send message to all clients
  broadcast(message: WebSocketMessage) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
    log(`Broadcast message to ${this.clients.size} clients: ${JSON.stringify(message)}`, 'websocket');
  }

  // Send message to a specific user (may be connected with multiple clients)
  sendToUser(userId: number, message: WebSocketMessage) {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        sentCount++;
      }
    });
    log(`Sent message to user ${userId} on ${sentCount} clients`, 'websocket');
  }

  // Ping all clients to keep connections alive
  private pingAllClients() {
    const pingMessage: WebSocketMessage = {
      type: 'ping',
      payload: { timestamp: Date.now() }
    };
    
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(pingMessage));
      } else {
        // Clean up dead connections
        this.clients.delete(clientId);
        log(`Removed dead connection: ${clientId}`, 'websocket');
      }
    });
  }

  // Send order update notification
  sendOrderUpdate(orderId: number, userId: number, status: string) {
    const message: WebSocketMessage = {
      type: 'orderUpdate',
      payload: {
        orderId,
        status,
        timestamp: Date.now()
      }
    };
    
    this.sendToUser(userId, message);
  }

  // Send general notification
  sendNotification(userId: number, title: string, message: string) {
    const notification: WebSocketMessage = {
      type: 'notification',
      payload: {
        title,
        message,
        timestamp: Date.now()
      }
    };
    
    this.sendToUser(userId, notification);
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService();