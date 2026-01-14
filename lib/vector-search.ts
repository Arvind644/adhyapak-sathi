// Vector search utilities using pgvector
// This implements hybrid search (semantic + keyword)

import { db } from './db'
import { generateEmbedding } from './openai'
import { EMBEDDING_DIMENSIONS } from './openai'

export interface SearchResult {
  chunkId: string
  documentId: string
  documentType: 'knowledge_base' | 'lesson_plan'
  chunkText: string
  similarity: number
  metadata?: any
}

export async function hybridSearch(
  query: string,
  userId: string,
  limit: number = 3
): Promise<SearchResult[]> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query)

  // Semantic search using pgvector
  // Note: This uses raw SQL since Prisma doesn't fully support pgvector yet
  // Format embedding array as PostgreSQL array string: [1,2,3]
  const embeddingStr = `[${queryEmbedding.join(',')}]`
  const semanticResults = await db.$queryRaw<Array<{
    id: string
    document_id: string
    document_type: string
    chunk_text: string
    similarity: number
    metadata: any
  }>>`
    SELECT 
      dc.id,
      dc.document_id,
      dc.document_type,
      dc.chunk_text,
      1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity,
      dc.metadata
    FROM document_chunks dc
    WHERE dc.document_type = 'knowledge_base'
       OR (dc.document_type = 'lesson_plan' 
           AND dc.document_id IN (
             SELECT id FROM lesson_plans 
             WHERE user_id = ${userId}::uuid
             AND created_at >= NOW() - INTERVAL '30 days'
           ))
    ORDER BY dc.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit * 2}
  `

  // Keyword search using PostgreSQL full-text search
  const keywordResults = await db.$queryRaw<Array<{
    id: string
    document_id: string
    document_type: string
    chunk_text: string
    rank: number
    metadata: any
  }>>`
    SELECT 
      dc.id,
      dc.document_id,
      dc.document_type,
      dc.chunk_text,
      ts_rank(to_tsvector('english', dc.chunk_text), plainto_tsquery('english', ${query})) as rank,
      dc.metadata
    FROM document_chunks dc
    WHERE dc.document_type = 'knowledge_base'
       OR (dc.document_type = 'lesson_plan' 
           AND dc.document_id IN (
             SELECT id FROM lesson_plans 
             WHERE user_id = ${userId} 
             AND created_at >= NOW() - INTERVAL '30 days'
           ))
    AND to_tsvector('english', dc.chunk_text) @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${limit * 2}
  `

  // Combine and deduplicate results
  const combinedResults = new Map<string, SearchResult>()

  // Add semantic results (weight: 0.7)
  semanticResults.forEach((result) => {
    if (!combinedResults.has(result.id)) {
      combinedResults.set(result.id, {
        chunkId: result.id,
        documentId: result.document_id,
        documentType: result.document_type as 'knowledge_base' | 'lesson_plan',
        chunkText: result.chunk_text,
        similarity: result.similarity * 0.7,
        metadata: result.metadata,
      })
    } else {
      const existing = combinedResults.get(result.id)!
      existing.similarity = Math.max(existing.similarity, result.similarity * 0.7)
    }
  })

  // Add keyword results (weight: 0.3)
  keywordResults.forEach((result) => {
    const normalizedRank = result.rank / 10 // Normalize rank to 0-1 range
    if (!combinedResults.has(result.id)) {
      combinedResults.set(result.id, {
        chunkId: result.id,
        documentId: result.document_id,
        documentType: result.document_type as 'knowledge_base' | 'lesson_plan',
        chunkText: result.chunk_text,
        similarity: normalizedRank * 0.3,
        metadata: result.metadata,
      })
    } else {
      const existing = combinedResults.get(result.id)!
      existing.similarity += normalizedRank * 0.3
    }
  })

  // Sort by combined similarity and return top N
  return Array.from(combinedResults.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

