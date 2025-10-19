# Setup Guide - Easy Installation

This guide will help you set up PostgreSQL and Redis for the chat application.

## 🚀 Quick Setup (Recommended - No Installation Required)

### Option A: Use Free Cloud Services (Easiest)

#### 1. PostgreSQL Database (Choose one):

**Option 1: Neon (Recommended)**
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host.region.neon.tech/dbname`)
5. Paste it in `.env` as `DATABASE_URL`

**Option 2: Supabase**
1. Go to https://supabase.com
2. Sign up and create new project
3. Go to Settings → Database
4. Copy the connection string (Connection pooling)
5. Paste it in `.env` as `DATABASE_URL`

**Option 3: ElephantSQL**
1. Go to https://www.elephantsql.com
2. Sign up for free "Tiny Turtle" plan
3. Create new instance
4. Copy the URL
5. Paste it in `.env` as `DATABASE_URL`

#### 2. Redis (Choose one):

**Option 1: Upstash (Recommended)**
1. Go to https://upstash.com
2. Sign up for free account
3. Create a Redis database
4. Copy the connection string (starts with `rediss://`)
5. Paste it in `.env` as `REDIS_URL`

**Option 2: Redis Cloud**
1. Go to https://redis.com/try-free
2. Sign up and create free database
3. Copy the connection string
4. Paste it in `.env` as `REDIS_URL`

---

## 💻 Local Installation (If you prefer local setup)

### Windows:

#### PostgreSQL:
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (default port: 5432)
3. Remember the password you set
4. Your DATABASE_URL will be:
   ```
   postgresql://postgres:YOUR_PASSWORD@localhost:5432/chatapp
   ```
5. Create database:
   - Open pgAdmin or command prompt
   - Run: `createdb chatapp`

#### Redis:
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Download Redis-x64-3.0.504.msi
3. Install with default settings (port: 6379)
4. Your REDIS_URL will be:
   ```
   redis://localhost:6379
   ```

### macOS:

#### PostgreSQL:
```bash
# Install via Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb chatapp

# Your DATABASE_URL:
postgresql://YOUR_USERNAME@localhost:5432/chatapp
```

#### Redis:
```bash
# Install via Homebrew
brew install redis
brew services start redis

# Your REDIS_URL:
redis://localhost:6379
```

### Linux (Ubuntu/Debian):

#### PostgreSQL:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb chatapp

# Your DATABASE_URL:
postgresql://postgres:password@localhost:5432/chatapp
```

#### Redis:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# Your REDIS_URL:
redis://localhost:6379
```

---

## 📝 Final .env Configuration

After setting up PostgreSQL and Redis, your `.env` file should look like:

```env
# Example with cloud services:
DATABASE_URL="postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/chatapp"
JWT_SECRET="my-super-secret-jwt-key-change-this-12345"
REDIS_URL="rediss://default:AbCdEf123456@us1-example-12345.upstash.io:6379"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3002"
PORT=3001
WS_PORT=3002
```

OR

```env
# Example with local installation:
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/chatapp"
JWT_SECRET="my-super-secret-jwt-key-change-this-12345"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3002"
PORT=3001
WS_PORT=3002
```

---

## 🎯 After Configuration

Once your `.env` is configured, run these commands:

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Generate Prisma client
cd packages/db
npm run db:generate

# 3. Push database schema
npm run db:push

# 4. Go back to root and start all services
cd ../..
npm run dev
```

---

## ✅ Verification

Your services should start on:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002

---

## 🆘 Troubleshooting

### "Prisma client not initialized"
```bash
cd packages/db
npm run db:generate
```

### "Cannot connect to database"
- Check your DATABASE_URL is correct
- Verify PostgreSQL is running
- Test connection with: `psql YOUR_DATABASE_URL`

### "Redis connection refused"
- Check your REDIS_URL is correct
- Verify Redis is running
- For local: `redis-cli ping` (should return PONG)

### Port already in use
- Change PORT in .env to another number (e.g., 3005)
- Or kill the process using that port

---

## 🎉 Recommended Quick Start

**For fastest setup with zero installation:**

1. Create free Neon database → Copy connection string
2. Create free Upstash Redis → Copy connection string
3. Update `.env` with both connection strings
4. Run: `cd packages/db && npm run db:generate && npm run db:push`
5. Run: `cd ../.. && npm run dev`
6. Open: http://localhost:3000

Done! 🚀