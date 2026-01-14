# Adhyapak Shathi - Just-in-Time Classroom Support

A lightweight, link-based web application that provides teachers with real-time, context-aware pedagogical support. Teachers can ask classroom doubts via text or voice and receive immediate, context-relevant guidance mapped to official manuals and pedagogy practices.

## Features

- 💬 **Just-in-Time Query Support**: Ask questions via text or voice input
- 🎯 **Context-Aware Responses**: Uses teacher's past lesson plans for personalized guidance
- 📚 **Knowledge Base Access**: Search through official teaching manuals and pedagogy practices
- 📝 **Lesson Plan Management**: Upload and manage your lesson plans
- 🔍 **Query History**: Search through past queries and responses
- 📊 **Analytics Dashboard**: View usage statistics and insights
- 🌐 **Multi-language Support**: Ask questions in English or Hindi

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with pgvector extension
- **Authentication**: Clerk
- **AI/ML**: OpenAI (GPT-4, Embeddings)
- **Voice**: ElevenLabs (Speech-to-Text)
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel

## Prerequisites

- Node.js 20.19+ (required for Prisma)
- PostgreSQL 14+ with pgvector extension
- Clerk account
- OpenAI API key
- ElevenLabs API key (optional, for voice features)
- Vercel account (for blob storage)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd adhyapak-shathi
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: If you encounter Prisma installation issues due to Node.js version, please upgrade to Node.js 20.19+ or use an alternative database client.

### 3. Set Up Environment Variables

Create `.env.example` file (if it doesn't exist):

```bash
npm run create-env
# OR
node scripts/create-env-example.js
```

Then copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env.local

# On Linux/Mac
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `OPENAI_API_KEY` - From OpenAI platform
- `ELEVENLABS_API_KEY` - From ElevenLabs (optional)
- `DATABASE_URL` - PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN` - From Vercel dashboard

### 4. Set Up Database

#### Install pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Run Prisma Migrations

```bash
# Generate Prisma Client first
npm run db:generate
# OR
npx prisma generate

# Create and run migrations
npm run db:migrate
# OR
npx prisma migrate dev

# Alternative: Push schema directly (for quick development)
npm run db:push
# OR
npx prisma db push
```

**Available Prisma Scripts:**
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database (no migration files)
- `npm run db:migrate` - Create and run migrations (creates migration files)
- `npm run db:migrate:deploy` - Deploy migrations (for production)
- `npm run db:studio` - Open Prisma Studio (database GUI)

### 5. Set Up Clerk Authentication

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Configure authentication methods (Google OAuth, Email/Password)
4. Copy your publishable key and secret key to `.env.local`

### 6. Set Up Vercel Blob Storage

1. Create a Vercel account
2. Go to Storage section
3. Create a Blob store
4. Copy the read/write token to `.env.local`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
adhyapak-shathi/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Main chat interface
│   ├── profile/          # Teacher profile & lesson plans
│   ├── analytics/        # Analytics dashboard
│   ├── onboarding/       # Onboarding flow
│   └── (auth)/           # Authentication pages
├── components/
│   ├── chat/             # Chat interface components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── db.ts             # Database client
│   ├── openai.ts         # OpenAI integration
│   ├── vector-search.ts  # Vector search utilities
│   ├── document-processor.ts  # Document processing
│   └── vercel-blob.ts    # Blob storage utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts         # Clerk middleware
```

## Key Features Implementation

### Query Processing Flow

1. User submits query (text or voice)
2. If voice: Audio is transcribed using ElevenLabs
3. Query embedding is generated using OpenAI
4. Hybrid search (semantic + keyword) retrieves relevant chunks
5. Response is generated using OpenAI with RAG
6. Query and response are stored in database

### Vector Search

- Uses pgvector for semantic similarity search
- Combines with PostgreSQL full-text search for hybrid search
- Considers teacher's lesson plans from last 30 days
- Returns top 2-3 most relevant chunks

### Document Processing

- Supports PDF and Word documents
- Extracts text and chunks documents
- Generates embeddings for each chunk
- Stores in database with metadata

## API Routes

- `POST /api/query` - Process teacher query
- `POST /api/query/feedback` - Submit feedback on response
- `POST /api/voice/transcribe` - Transcribe voice input
- `POST /api/lesson-plans` - Upload lesson plan
- `GET /api/lesson-plans` - Get lesson plans
- `DELETE /api/lesson-plans/[id]` - Delete lesson plan
- `GET /api/queries/history` - Get query history
- `GET /api/analytics` - Get analytics data

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Set up PostgreSQL database (Vercel Postgres or external)
5. Deploy

### Database Setup on Vercel

If using Vercel Postgres:
1. Create Postgres database in Vercel dashboard
2. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting

### Prisma Installation Issues

If Prisma fails to install due to Node.js version:
- Upgrade to Node.js 20.19+ or use alternative database client
- Or use a different ORM like Drizzle

### PDF/Word Processing Issues

If `pdf-parse` or `mammoth` fail to install:
- These require Node.js 20.16+ or 22.3+
- Consider using alternative libraries or cloud services

### Vector Search Not Working

Ensure:
- pgvector extension is installed: `CREATE EXTENSION vector;`
- Embeddings are being generated correctly
- Database connection is working

## Contributing

This is a hackathon project. Contributions and improvements are welcome!

## License

MIT

## Hackathon Details

Built for ShikshaLokam Hackathon 2.0
[Theme 1: Just-in-Time Classroom Support](https://www.hackerearth.com/challenges/hackathon/shikshalokam-2/custom-tab/theme-1/#theme-1)
