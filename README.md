# Real-Time Chat Application

A full-stack real-time chat application built with modern technologies, featuring friend requests, real-time messaging, and message reactions.

## 🏗️ Architecture

This project follows a **monorepo architecture** using Turborepo with clear separation of concerns:

```
Real-Time Chat App/
├── apps/
│   ├── frontend/          # Next.js App Router with TypeScript & Tailwind
│   ├── backend/           # Express.js REST API with JWT auth
│   └── ws/               # WebSocket server with Redis Pub/Sub
├── packages/
│   └── db/               # Shared Prisma client and schema
├── turbo.json            # Turborepo configuration
└── package.json          # Root package configuration
```

## ✨ Features

### Core Features
- ✅ **User Authentication** - JWT-based signup/login
- ✅ **Friend Request System** - Send, receive, accept/reject friend requests
- ✅ **Real-time Notifications** - Toast notifications for friend requests and messages
- ✅ **Real-time Messaging** - WebSocket-based instant messaging
- ✅ **Online Status** - See who's online/offline
- ✅ **Typing Indicators** - See when friends are typing

### Creative Feature: Message Reactions 🎉
- React to messages with emojis (👍, ❤️, 😂, 😮)
- Real-time reaction updates across all connected clients
- Visual reaction display on messages

### Bonus Features
- **Redis Pub/Sub** - Scalable real-time event broadcasting
- **Responsive UI** - WhatsApp-like interface with Tailwind CSS
- **TypeScript** - Full type safety across the entire stack

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hot Toast
- **Backend**: Node.js, Express.js, JWT, bcryptjs
- **WebSocket**: Node.js with `ws` library
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Pub-Sub**: Redis
- **Monorepo**: Turborepo

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis server
- npm or yarn

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Real-Time\ Chat\ App
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your actual values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `REDIS_URL`: Your Redis connection string

### 3. Database Setup

```bash
# Generate Prisma client
cd packages/db
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Start Development Servers

From the root directory, start all services:

```bash
# Start all apps in development mode
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket Server**: ws://localhost:3002

### 5. Individual Service Commands

You can also run services individually:

```bash
# Frontend only
cd apps/frontend && npm run dev

# Backend API only
cd apps/backend && npm run dev

# WebSocket server only
cd apps/ws && npm run dev
```

## 📁 Project Structure

### `apps/frontend` - Next.js Application
- **Pages**: Authentication, Dashboard with chat interface
- **Components**: Reusable UI components
- **Hooks**: Custom hooks for WebSocket connection
- **Lib**: API utilities and authentication helpers

### `apps/backend` - REST API Server
- **Routes**: Authentication, friends, messages endpoints
- **Middleware**: JWT authentication middleware
- **Integration**: Redis pub/sub for real-time events

### `apps/ws` - WebSocket Server
- **Real-time Communication**: Message broadcasting, typing indicators
- **Redis Integration**: Subscribe to events from API server
- **Connection Management**: User session handling

### `packages/db` - Shared Database Package
- **Prisma Schema**: User, FriendRequest, Message, Reaction models
- **Client Export**: Shared Prisma client for all apps

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login

### Friends
- `POST /friends/request` - Send friend request
- `POST /friends/respond` - Accept/reject friend request
- `GET /friends` - Get user's friends list
- `GET /friends/requests` - Get pending friend requests

### Messages
- `GET /messages/:friendId` - Get chat history with friend
- `POST /messages/send` - Send new message
- `POST /messages/:messageId/react` - Add reaction to message

## 🎯 Usage Guide

1. **Sign Up/Login**: Create account or login with existing credentials
2. **Add Friends**: Use the "+" button to send friend requests by username
3. **Manage Requests**: Click the bell icon to see and respond to friend requests
4. **Start Chatting**: Click on a friend to open chat interface
5. **React to Messages**: Hover over messages to add emoji reactions
6. **Real-time Features**: See typing indicators and receive instant notifications

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all endpoints
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🚀 Production Deployment

### Build Commands
```bash
# Build all apps
npm run build

# Build specific app
cd apps/frontend && npm run build
cd apps/backend && npm run build
cd apps/ws && npm run build
```

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment, especially:
- Secure `JWT_SECRET`
- Production database URLs
- Redis connection strings
- Proper CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is part of a skill evaluation process and is for educational purposes.

---

**Note**: This application demonstrates modern full-stack development practices with real-time features, scalable architecture, and clean code organization.