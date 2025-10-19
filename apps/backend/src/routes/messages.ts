import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';
import { createClient } from 'redis';

const router = express.Router();
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

router.get('/:friendId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId!;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      include: {
        reactions: { include: { user: { select: { username: true } } } }
      },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.message.updateMany({
      where: { senderId: friendId, receiverId: userId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/send', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { receiverId, content, type = 'TEXT' } = req.body;
    const senderId = req.userId!;

    const message = await prisma.message.create({
      data: { senderId, receiverId, content, type },
      include: {
        sender: { select: { username: true } },
        reactions: { include: { user: { select: { username: true } } } }
      }
    });

    await redis.publish('new-message', JSON.stringify({
      type: 'NEW_MESSAGE',
      receiverId,
      data: message
    }));

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:messageId/react', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId!;

    const existing = await prisma.reaction.findUnique({
      where: { messageId_userId: { messageId, userId } }
    });

    if (existing) {
      await prisma.reaction.update({
        where: { id: existing.id },
        data: { emoji }
      });
    } else {
      await prisma.reaction.create({
        data: { messageId, userId, emoji }
      });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { receiverId: true, senderId: true }
    });

    const targetUserId = message?.senderId === userId ? message.receiverId : message?.senderId;

    await redis.publish('message-reaction', JSON.stringify({
      type: 'MESSAGE_REACTION',
      receiverId: targetUserId,
      data: { messageId, emoji, userId }
    }));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;