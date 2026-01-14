# ShikshaLokam – Just-in-Time Classroom Support Web App

## Project Overview

A lightweight, link-based web application that provides teachers with real-time, context-aware pedagogical support. The app enables teachers to ask classroom doubts via text or voice and receive immediate, context-relevant guidance mapped to official manuals and pedagogy practices. Teachers can upload their lesson plans, which are used to provide personalized, context-aware responses.

### Key Characteristics
- **Link-based web app**: Accessible via standard URL through web browser, no installation required
- **Online-only**: Requires internet connectivity (no offline mode)
- **Mobile-responsive**: Optimized for mobile devices with thumb-friendly navigation
- **Multi-language query support**: Teachers can ask questions in English or Hindi
- **Voice & text input**: Support for both text and voice queries
- **Context-aware responses**: Uses teacher's past lesson plans (last 30 days) to provide personalized guidance

---

## Core Features

### 1. Just-in-Time Query Support (Text + Voice)
- Teachers can ask classroom doubts via chat or voice input
- Voice queries are recorded (max 2 minutes), then transcribed using ElevenLabs
- Responses are generated using OpenAI with RAG (Retrieval-Augmented Generation)
- Hybrid search (semantic + keyword) retrieves relevant content from knowledge base and teacher's lesson plans
- Teachers receive immediate, context-relevant guidance mapped to official manuals and pedagogy practices

### 2. Response Type Selection
Teachers can select their preferred response format before or after asking a question:
- Step-by-step instructions
- Quick tips
- Detailed explanations
- Manual excerpts from official documents
- Visual aids (if available in knowledge base)
- All of the above as selectable options

Response type selection is available via modal interface, and teachers can request different response types for the same query.

### 3. Knowledge Base Access
- Core content sourced from official manuals and pedagogy practices (PDF and Word documents)
- Documents are processed, chunked, and indexed using pgvector for semantic search
- Teachers can upload their own lesson plans (max 5MB per file)
- Lesson plans support drag-and-drop and file picker upload
- Teachers can add metadata tags to their lesson plans for organization
- Teachers can delete their uploaded content anytime
- Knowledge base documents are searchable using hybrid search (semantic + keyword)

### 4. Context-Aware Responses
- System considers teacher's past lesson plans from last 30 days to provide context
- Responses reference relevant lesson plans when applicable
- System suggests teachers to "read in notes X for more details" when relevant
- Top 2-3 most relevant document chunks are retrieved and used in response generation

### 5. Chat History & Search
- All queries and responses are saved per teacher
- Chat history persists across sessions
- Teachers can search their past queries (up to 3 months of history)
- Past responses are clickable to re-request different response types

### 6. Response Quality Feedback
- Teachers can mark responses as "not relevant"
- Provides retry button for failed queries
- Clear error messages when AI service is unavailable ("AI service is not available, please try later")
- Manual retry mechanism (no automatic retry)

### 7. Escalation System (Future)
- One-tap escalation of unresolved classroom issues (implementation details TBD)
- Full context included: query, guidance shown, and voice input if used
- Email escalation via SMTP service (details TBD)

### 8. Analytics Dashboard (Demo)
- Total queries across all teachers
- Queries per teacher
- Average response time
- Most common topics
- Response type distribution
- Visible for demo purposes

---

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 16.1.1 with React 19.2.3
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with pgvector extension
- **Authentication**: Clerk (Google OAuth and email/password)
- **File Storage**: Vercel Blob Storage
- **LLM**: OpenAI API
- **Voice Processing**: ElevenLabs (speech-to-text)
- **Vector Search**: pgvector with hybrid search (semantic + keyword)
- **Deployment**: Vercel

### System Architecture

#### Query Processing Flow
1. Teacher submits query (text or voice)
2. If voice: Record audio (max 2 minutes) → Transcribe using ElevenLabs → Get transcript
3. Generate embeddings for query using OpenAI embeddings API
4. Perform hybrid search (semantic + keyword) in:
   - Knowledge base documents (PDF/Word docs)
   - Teacher's lesson plans (last 30 days)
5. Retrieve top 2-3 most relevant document chunks
6. Inject retrieved chunks into OpenAI prompt with response type specification
7. Generate response using OpenAI API
8. Display response to teacher with source references
9. Store query, response, and metadata in database

#### Response Generation Pipeline
- **RAG Implementation**: Yes, using Retrieval-Augmented Generation
- **Search Strategy**: Hybrid search (semantic similarity + keyword matching)
- **Chunk Retrieval**: Top 2-3 most relevant chunks
- **Prompt Engineering**: Includes retrieved chunks as context, specifies response type format
- **Source Citation**: Responses reference source documents/chunks when applicable

### Database Schema

#### Users Table
- `id` (UUID, primary key)
- `clerk_user_id` (string, unique)
- `email` (string, unique)
- `name` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Queries Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `original_text` (text) - stores the original text form of query
- `voice_transcript` (text, nullable) - if query was voice-based
- `response_type` (enum: step-by-step, quick-tip, detailed, manual-excerpt, visual-aid, all)
- `ai_response` (text)
- `sources_used` (JSONB) - array of document IDs and chunk references
- `is_relevant` (boolean, nullable) - teacher feedback
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Lesson Plans Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `file_name` (string)
- `file_url` (string) - Vercel Blob Storage URL
- `file_size` (integer) - in bytes
- `tags` (text[]) - array of tags
- `metadata` (JSONB) - additional metadata (subject, grade, topic, etc.)
- `extracted_text` (text) - text extracted from document
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Knowledge Base Documents Table
- `id` (UUID, primary key)
- `file_name` (string)
- `file_url` (string) - Vercel Blob Storage URL
- `document_type` (enum: pdf, word)
- `tags` (text[]) - array of tags for organization
- `extracted_text` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Document Chunks Table (for vector search)
- `id` (UUID, primary key)
- `document_id` (UUID, foreign key → knowledge_base_documents or lesson_plans)
- `document_type` (enum: knowledge_base, lesson_plan)
- `chunk_text` (text)
- `chunk_index` (integer)
- `embedding` (vector) - pgvector embedding
- `metadata` (JSONB) - page number, section, etc.
- `created_at` (timestamp)

#### Escalations Table (Future)
- `id` (UUID, primary key)
- `query_id` (UUID, foreign key → queries)
- `user_id` (UUID, foreign key → users)
- `status` (enum: pending, resolved)
- `email_sent` (boolean)
- `email_sent_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Analytics Table (for demo)
- `id` (UUID, primary key)
- `query_id` (UUID, foreign key → queries)
- `response_time_ms` (integer)
- `response_type` (enum)
- `topics` (text[]) - extracted topics
- `created_at` (timestamp)

---

## User Flows

### Teacher Onboarding Flow
1. Teacher visits web app URL
2. **Onboarding Page 1**: Welcome message with app purpose
3. **Onboarding Page 2**: Key features overview
4. Teacher clicks "Get Started"
5. Authentication via Clerk (Google OAuth or email/password)
6. Redirect to Teacher Home/Chat Screen

### Query Flow (Text)
1. Teacher navigates to Chat Screen
2. Teacher types query in input box
3. (Optional) Teacher selects response type via modal
4. Teacher clicks send
5. System shows loading state with progress indicators:
   - "Searching knowledge base..."
   - "Generating response..."
6. Response appears in chat with source references
7. Teacher can:
   - Mark response as not relevant
   - Request different response type for same query
   - Ask follow-up question
   - View past queries in history

### Query Flow (Voice)
1. Teacher navigates to Chat Screen
2. Teacher toggles to voice mode (toggle button in input area)
3. Teacher clicks record button
4. System shows recording indicator (waveform, timer, stop button)
5. Teacher records (max 2 minutes) and stops
6. System shows "Transcribing..." status
7. Transcript appears in input box (preview)
8. Teacher can:
   - Edit transcript before sending
   - Cancel and re-record
   - Send as-is
9. After sending, follows same flow as text query

### Lesson Plan Upload Flow
1. Teacher navigates to profile or lesson plans section
2. Teacher clicks "Upload Lesson Plan"
3. Teacher can:
   - Drag and drop file
   - Use file picker
4. System validates file (max 5MB, supported formats)
5. Teacher adds metadata:
   - Tags (with autocomplete suggestions for common tags)
   - Subject, grade, topic (optional)
6. System processes file:
   - Uploads to Vercel Blob Storage
   - Extracts text
   - Chunks document
   - Generates embeddings
   - Stores in database
7. Teacher can view, search, filter, and delete their lesson plans

### Chat History Search Flow
1. Teacher navigates to chat screen
2. Teacher clicks search icon or uses search bar
3. Teacher types search query
4. System searches past queries (last 3 months)
5. Results show matching queries with timestamps
6. Teacher clicks result to view full conversation context

---

## UI/UX Specifications

### Design Principles
- **Mobile-first**: Optimized for mobile devices with thumb-friendly navigation
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Clean & Modern**: Beautiful, intuitive interface
- **Fast & Responsive**: Clear loading states and progress indicators

### Key Screens

#### 1. Teacher Home / Chat Screen
**Primary Interface**
- Chat interface with message history
- Input area at bottom with:
  - Text input field
  - Toggle button for text/voice mode
  - Send button
  - Response type selection button (opens modal)
- Voice recording UI:
  - When in voice mode, shows record button
  - During recording: waveform visualization, timer, stop button
  - After recording: transcript preview with edit option
- Message display:
  - User queries (text or voice transcript)
  - AI responses with formatting (markdown support)
  - Source references (clickable links to documents)
  - "Not relevant" feedback button
  - "Request different response type" option
- Loading states:
  - "Transcribing..." for voice
  - "Searching knowledge base..."
  - "Generating response..."
- Error states:
  - Clear error messages
  - Retry button for failed requests
- Search bar for past queries (last 3 months)

#### 2. Teacher Profile Page
- User information (name, email)
- Subjects taught (editable)
- Lesson plans section:
  - List of uploaded lesson plans
  - Upload new lesson plan button
  - Filter by tags
  - Search functionality
  - Delete option for each plan
- Statistics (optional):
  - Number of queries asked
  - Number of lesson plans uploaded
  - Storage used

#### 3. Lesson Plan Upload Interface
- Drag-and-drop area
- File picker button
- File validation feedback
- Metadata form:
  - Tags input (with autocomplete)
  - Subject dropdown (optional)
  - Grade dropdown (optional)
  - Topic text input (optional)
- Upload progress indicator
- Success/error messages

#### 4. Response Type Selection Modal
- Modal overlay with options:
  - Step-by-step instructions
  - Quick tips
  - Detailed explanations
  - Manual excerpts
  - Visual aids
  - All of the above
- Icons and text labels for each option
- "Apply" and "Cancel" buttons
- Selection persists for subsequent queries (with option to change)

#### 5. Analytics Dashboard (Demo)
- Overview cards:
  - Total queries
  - Queries per teacher
  - Average response time
- Charts:
  - Most common topics (bar chart or word cloud)
  - Response type distribution (pie chart)
- Time range filter (last 7 days, 30 days, all time)
- Table view of recent queries (optional)

### UI Components

#### Chat Message Component
- User message: Right-aligned, distinct styling
- AI response: Left-aligned, card-like design
- Source references: Subtle links or badges
- Timestamp: Small, muted text
- Action buttons: "Not relevant", "Request different type"

#### Voice Recording Component
- Record button: Large, accessible
- Recording state: Animated waveform, timer, stop button
- Transcript preview: Editable text area
- Actions: Send, Cancel, Re-record

#### File Upload Component
- Drag-and-drop zone: Clear visual feedback
- File picker: Standard file input
- Progress bar: For upload status
- File list: Shows uploaded files with metadata

---

## API & Integration Details

### Authentication (Clerk)
- Google OAuth integration
- Email/password authentication
- User session management
- Protected routes

### OpenAI Integration
- **Embeddings API**: For generating query and document embeddings
  - Model: text-embedding-3-small or text-embedding-3-large
- **Chat Completions API**: For generating responses
  - Model: GPT-4 or GPT-3.5-turbo
  - Prompt includes: query, retrieved chunks, response type specification
- **Rate Limiting**: Handle API rate limits gracefully
- **Error Handling**: Clear error messages for service unavailability

### ElevenLabs Integration
- **Speech-to-Text API**: For voice transcription
- **Recording**: Max 2 minutes duration
- **Error Handling**: Fallback to manual text input if transcription fails

### pgvector Integration
- **Extension**: Enable pgvector extension in PostgreSQL
- **Embedding Storage**: Store document chunk embeddings as vectors
- **Hybrid Search**: 
  - Semantic search using vector similarity (cosine distance)
  - Keyword search using full-text search (PostgreSQL tsvector)
  - Combine results with weighted ranking
- **Indexing**: Create indexes on embedding columns for performance

### Vercel Blob Storage
- Store uploaded lesson plans
- Store knowledge base documents
- Generate signed URLs for file access
- Handle file deletion

### SMTP Service (Future)
- Email escalation functionality
- Template-based email generation
- Error handling for delivery failures

---

## Implementation Details

### Document Processing Pipeline

#### Knowledge Base Documents
1. Admin/teacher uploads PDF or Word document
2. Extract text using appropriate library (pdf-parse, mammoth, etc.)
3. Chunk document:
   - Strategy: Fixed-size chunks with overlap OR semantic chunks
   - Store chunk metadata (page number, section, etc.)
4. Generate embeddings for each chunk using OpenAI embeddings API
5. Store chunks and embeddings in database
6. Index embeddings using pgvector

#### Teacher Lesson Plans
1. Teacher uploads file (max 5MB)
2. Validate file type and size
3. Upload to Vercel Blob Storage
4. Extract text
5. Chunk document
6. Generate embeddings
7. Store in database with metadata (tags, subject, grade, etc.)
8. Index for search

### Search & Retrieval Strategy

#### Hybrid Search Implementation
1. **Semantic Search**:
   - Generate query embedding
   - Find similar chunks using vector similarity (pgvector)
   - Return top N results by similarity score

2. **Keyword Search**:
   - Use PostgreSQL full-text search (tsvector)
   - Search in chunk_text and metadata
   - Return top N results by relevance

3. **Result Combination**:
   - Merge and deduplicate results
   - Weight and rank combined results
   - Return top 2-3 most relevant chunks

4. **Context Filtering**:
   - For teacher queries, prioritize chunks from their lesson plans (last 30 days)
   - Combine with knowledge base chunks
   - Rank by relevance and recency

### Response Generation

#### Prompt Engineering
- System prompt includes:
  - Role definition (pedagogical assistant)
  - Response type specification
  - Instructions for citing sources
  - Format guidelines

- User prompt includes:
  - Original query
  - Retrieved document chunks (with source references)
  - Context from teacher's lesson plans (if applicable)

- Response format:
  - Structured based on selected response type
  - Includes source citations
  - References teacher's notes when relevant

### Error Handling

#### API Failures
- **OpenAI API Down**: Show "AI service is not available, please try later" with retry button
- **ElevenLabs Failure**: Show error, allow manual text input
- **Database Errors**: Log error, show user-friendly message
- **File Upload Failures**: Show specific error (size limit, format, etc.)

#### Retry Mechanism
- Manual retry button for failed queries
- No automatic retry (to prevent API abuse)
- Clear error messages with actionable guidance

### Performance Optimization

#### Caching Strategy (Future)
- Cache common queries/responses
- Cache embeddings for frequently accessed documents
- Implement query result caching

#### Database Optimization
- Index on frequently queried columns
- pgvector indexes for fast similarity search
- Full-text search indexes for keyword search
- Partition large tables if needed

---

## Deployment & Environment

### Environment Variables
```
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=

# Database
DATABASE_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=

# SMTP (Future)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
```

### Deployment on Vercel
- Connect GitHub repository
- Configure environment variables
- Set up PostgreSQL database (with pgvector extension)
- Configure Vercel Blob Storage
- Deploy and test

### Database Setup
1. Create PostgreSQL database
2. Enable pgvector extension: `CREATE EXTENSION vector;`
3. Run migrations to create tables
4. Set up indexes for performance

---

## Future Enhancements (TBD)

1. **CRP/ARP Dashboard**: Dashboard for mentors to view teacher queries and escalations
2. **Email Escalation**: Detailed implementation of escalation workflow
3. **Teacher Prep Feature**: Quick subject brush-up for multi-subject teachers
4. **Memory Feature**: Context memory across conversations
5. **Local LLM Support**: On-device light LLMs for better offline experience
6. **Advanced Analytics**: More detailed insights and reporting
7. **Performance Optimization**: Caching, query optimization, etc.

---

## Hackathon Details
[https://www.hackerearth.com/challenges/hackathon/shikshalokam-2/custom-tab/theme-1/#theme-1](https://www.hackerearth.com/challenges/hackathon/shikshalokam-2/custom-tab/theme-1/#theme-1)

---

## Mock Ideas

### CRP/ARP Dashboard
![][image1]

### Teacher Chat UI
![][image2]  

(OPTIONAL - [Teacher's dashboard](https://www.youtube.com/watch?v=rnIgnS8Susg) to revise stuff & make lesson plans)

![][image3]
