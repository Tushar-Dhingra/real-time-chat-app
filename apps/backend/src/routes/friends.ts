import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';
import { createClient } from 'redis';

const router = express.Router();
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

router.post('/request', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { receiverUsername } = req.body;
    const senderId = req.userId!;

    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingRequest = await prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId: receiver.id } }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: { senderId, receiverId: receiver.id },
      include: { sender: { select: { username: true } } }
    });

    await redis.publish('friend-request', JSON.stringify({
      type: 'FRIEND_REQUEST',
      receiverId: receiver.id,
      data: friendRequest
    }));

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/respond', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.userId!;

    const request = await prisma.friendRequest.findFirst({
      where: { id: requestId, receiverId: userId }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: action }
    });

    await redis.publish('friend-response', JSON.stringify({
      type: 'FRIEND_RESPONSE',
      senderId: request.senderId,
      action
    }));

    res.json({ message: `Request ${action.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const friends = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: { select: { id: true, username: true, isOnline: true, lastSeen: true } },
        receiver: { select: { id: true, username: true, isOnline: true, lastSeen: true } }
      }
    });

    const friendList = friends.map((f) => {
      return f.senderId === userId ? f.receiver : f.sender;
    });

    res.json(friendList);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: { username: true } } }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;