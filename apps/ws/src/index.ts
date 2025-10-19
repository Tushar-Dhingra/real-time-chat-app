import WebSocket, { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 3002 });
const redis = createClient({ url: process.env.REDIS_URL });
const subscriber = createClient({ url: process.env.REDIS_URL });

const clients = new Map<string, WebSocket>();

redis.connect();
subscriber.connect();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(1008, 'Token required');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    
    clients.set(userId, ws);
    console.log(`User ${userId} connected`);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'TYPING') {
          const targetWs = clients.get(message.receiverId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'TYPING',
              senderId: userId,
              isTyping: message.isTyping
            }));
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`User ${userId} disconnected`);
    });

  } catch (error) {
    ws.close(1008, 'Invalid token');
  }
});

// Subscribe to Redis channels
subscriber.subscribe('friend-request', 'friend-response', 'new-message', 'message-reaction');

subscriber.on('message', (channel, message) => {
  try {
    const data = JSON.parse(message);
    const targetWs = clients.get(data.receiverId);
    
    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      targetWs.send(JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error processing Redis message:', error);
  }
});

console.log('WebSocket server running on port 3002');