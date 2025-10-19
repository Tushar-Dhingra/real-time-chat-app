import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@chat/db';
import authRoutes from './routes/auth';
import friendRoutes from './routes/friends';
import messageRoutes from './routes/messages';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/friends', friendRoutes);
app.use('/messages', messageRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export { prisma };