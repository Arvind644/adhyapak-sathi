// Helper functions for document chunks using Prisma
// Note: pgvector operations still require raw SQL

import { db } from './db'
import { generateEmbedding } from './openai'

export interface ChunkData {
  text: string
  index: number
  metadata?: Record<string, any>
}

export async function createDocumentChunks(
  documentId: string,
  documentType: 'knowledge_base' | 'lesson_plan',
  chunks: ChunkData[]
): Promise<void> {
  // Generate embeddings for all chunks
  const chunksWithEmbeddings = await Promise.all(
    chunks.map(async (chunk) => ({
      ...chunk,
      embedding: await generateEmbedding(chunk.text),
    }))
  )

  // Insert chunks using raw SQL (required for pgvector)
  // We batch insert for better performance
  for (const chunk of chunksWithEmbeddings) {
    const embeddingStr = `[${chunk.embedding.join(',')}]`
    
    await db.$executeRaw`
      INSERT INTO document_chunks (
        id, document_id, document_type, chunk_text, chunk_index, embedding, metadata, created_at
      ) VALUES (
        gen_random_uuid(),
        ${documentId}::uuid,
        ${documentType},
        ${chunk.text},
        ${chunk.index},
        ${embeddingStr}::vector,
        ${JSON.stringify(chunk.metadata || {})}::jsonb,
        NOW()
      )
    `
  }
}

export async function deleteDocumentChunks(
  documentId: string,
  documentType: 'knowledge_base' | 'lesson_plan'
): Promise<void> {
  // Use Prisma for deletion (no vector operations needed)
  await db.$executeRaw`
    DELETE FROM document_chunks
    WHERE document_id = ${documentId}::uuid
    AND document_type = ${documentType}
  `
}

