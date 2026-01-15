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
  // Process chunks ONE AT A TIME to avoid memory issues
  console.log(`Starting to process ${chunks.length} chunks for document ${documentId}`)
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    
    try {
      // Generate embedding for this single chunk
      const embedding = await generateEmbedding(chunk.text)
      
      // Convert embedding to string for pgvector
      const embeddingStr = `[${embedding.join(',')}]`
      
      // Insert chunk using raw SQL (required for pgvector)
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
      
      // Log progress
      console.log(`✓ Processed chunk ${i + 1}/${chunks.length}`)
      
      // Clear the embedding from memory immediately
      embedding.length = 0
      
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error)
      throw error
    }
  }
  
  console.log(`✓ Successfully processed all ${chunks.length} chunks`)
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

