// Script to create .env.example file
const fs = require('fs');
const path = require('path');

const envExampleContent = `# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs (for voice transcription)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Database (PostgreSQL with pgvector)
DATABASE_URL=postgresql://user:password@localhost:5432/adhyapak_shathi
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/adhyapak_shathi
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/adhyapak_shathi

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

const envExamplePath = path.join(process.cwd(), '.env.example');

try {
  fs.writeFileSync(envExamplePath, envExampleContent, 'utf8');
  console.log('✅ Created .env.example file successfully!');
} catch (error) {
  console.error('❌ Error creating .env.example:', error);
  process.exit(1);
}

