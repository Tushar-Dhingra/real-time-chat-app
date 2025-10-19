# ⚡ Quick Start - 5 Minutes Setup

## Step 1: Get Free Database & Redis (2 minutes)

### PostgreSQL (Neon - Easiest):
1. Visit: https://neon.tech
2. Click "Sign Up" → Use GitHub/Google
3. Click "Create Project"
4. Copy the connection string shown
5. Paste in `.env` file as `DATABASE_URL`

### Redis (Upstash - Easiest):
1. Visit: https://upstash.com
2. Click "Sign Up" → Use GitHub/Google
3. Click "Create Database"
4. Copy the connection string (starts with `rediss://`)
5. Paste in `.env` file as `REDIS_URL`

## Step 2: Update .env File (1 minute)

Open `.env` file and update these two lines:
```env
DATABASE_URL="paste-your-neon-connection-string-here"
REDIS_URL="paste-your-upstash-connection-string-here"
```

Keep everything else as is!

## Step 3: Setup Database (1 minute)

Run these commands:
```bash
cd packages/db
npm run db:generate
npm run db:push
cd ../..
```

## Step 4: Start Application (1 minute)

```bash
npm run dev
```

## Step 5: Open Browser

Visit: http://localhost:3000

Create an account and start chatting! 🎉

---

## 🆘 Having Issues?

### "npm: command not found"
Install Node.js from: https://nodejs.org

### "Prisma error"
```bash
cd packages/db
npm install
npm run db:generate
npm run db:push
```

### "Connection refused"
- Double-check your DATABASE_URL and REDIS_URL in `.env`
- Make sure you copied the complete connection strings

### Still stuck?
Check `SETUP_GUIDE.md` for detailed instructions!