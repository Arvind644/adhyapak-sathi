# Quick Setup Guide

## Prerequisites Check

1. **Node.js Version**: You need Node.js 20.19+ for Prisma to work
   ```bash
   node --version
   ```
   If your version is lower, upgrade Node.js first.

2. **PostgreSQL**: Make sure PostgreSQL 14+ is installed and running
   ```bash
   psql --version
   ```

3. **pgvector Extension**: Install pgvector in your PostgreSQL database
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

**Note**: If Prisma installation fails:
- Upgrade Node.js to 20.19+ OR
- Skip Prisma for now and use a different database client

### 2. Create Environment File

```bash
cp .env.example .env.local
```

Fill in all required values in `.env.local`

### 3. Set Up Clerk

1. Go to https://clerk.com and sign up
2. Create a new application
3. Enable Google OAuth and Email/Password
4. Copy keys to `.env.local`

### 4. Set Up Database

```bash
# Create database
createdb adhyapak_shathi

# Connect and enable pgvector
psql adhyapak_shathi
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npm run db:generate
# OR
npx prisma generate

# Run migrations (creates migration files)
npm run db:migrate
# OR
npx prisma migrate dev

# Alternative: Push schema directly (for development)
npm run db:push
# OR
npx prisma db push
```

**Note**: Use `db:migrate` for production (creates migration files) or `db:push` for quick development (no migration files).

### 6. Set Up Vercel Blob Storage

1. Go to https://vercel.com
2. Create account/project
3. Go to Storage → Create Blob Store
4. Copy token to `.env.local`

### 7. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Troubleshooting

### Prisma Issues

If Prisma doesn't install:
- Upgrade Node.js: `nvm install 20.19.0 && nvm use 20.19.0`
- Or use alternative: Drizzle ORM or raw SQL

### PDF/Word Processing

If `pdf-parse` or `mammoth` fail:
- These require Node.js 20.16+
- Alternative: Use cloud services or different libraries

### Database Connection

Check your `DATABASE_URL` format:
```
postgresql://username:password@localhost:5432/database_name
```

### pgvector Not Working

Ensure extension is installed:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

If not installed:
```sql
CREATE EXTENSION vector;
```

## Next Steps

1. Upload some knowledge base documents (PDF/Word)
2. Test query functionality
3. Upload a lesson plan
4. Try voice input (requires ElevenLabs API key)

