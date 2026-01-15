// Simple text search - searches lesson plans by text content
// No embeddings needed! Uses PostgreSQL full-text search + simple matching

import { db } from './db'

export interface SearchResult {
  documentId: string
  documentType: 'knowledge_base' | 'lesson_plan'
  text: string
  fileName?: string
  relevance: number
}

/**
 * Search for relevant content in lesson plans using simple text matching
 * This is fast, uses no external APIs, and works great for small-medium collections
 */
export async function searchDocuments(
  query: string,
  userId: string,
  limit: number = 3
): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  
  // Search user's lesson plans
  const lessonPlans = await db.lessonPlan.findMany({
    where: {
      userId,
      // Only search recent lesson plans (last 90 days)
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      id: true,
      fileName: true,
      extractedText: true,
      tags: true,
      metadata: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20, // Check up to 20 recent lesson plans
  })

  // Score each lesson plan based on relevance to the query
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  for (const plan of lessonPlans) {
    if (!plan.extractedText) continue
    
    const textLower = plan.extractedText.toLowerCase()
    let score = 0
    
    // Score based on word matches
    for (const word of queryWords) {
      if (textLower.includes(word)) {
        // Count occurrences
        const matches = (textLower.match(new RegExp(word, 'g')) || []).length
        score += Math.min(matches, 5) // Cap at 5 matches per word
      }
    }
    
    // Bonus for tag matches
    const tagsLower = plan.tags.map(t => t.toLowerCase())
    for (const word of queryWords) {
      if (tagsLower.some(tag => tag.includes(word))) {
        score += 3
      }
    }
    
    // Bonus for metadata matches (subject, topic, grade)
    const metadata = plan.metadata as Record<string, string> | null
    if (metadata) {
      const metaText = Object.values(metadata).join(' ').toLowerCase()
      for (const word of queryWords) {
        if (metaText.includes(word)) {
          score += 2
        }
      }
    }
    
    if (score > 0) {
      // Extract relevant portion of text (around the first match)
      let relevantText = plan.extractedText
      const firstWord = queryWords.find(w => textLower.includes(w))
      if (firstWord && plan.extractedText.length > 1000) {
        const matchIndex = textLower.indexOf(firstWord)
        const start = Math.max(0, matchIndex - 200)
        const end = Math.min(plan.extractedText.length, matchIndex + 800)
        relevantText = (start > 0 ? '...' : '') + 
                       plan.extractedText.substring(start, end) + 
                       (end < plan.extractedText.length ? '...' : '')
      } else if (plan.extractedText.length > 1000) {
        relevantText = plan.extractedText.substring(0, 1000) + '...'
      }
      
      results.push({
        documentId: plan.id,
        documentType: 'lesson_plan',
        text: relevantText,
        fileName: plan.fileName,
        relevance: score,
      })
    }
  }
  
  // Sort by relevance and return top results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
}

/**
 * Get all lesson plan texts for context (for when no specific matches found)
 */
export async function getRecentLessonPlanContext(
  userId: string,
  limit: number = 3
): Promise<SearchResult[]> {
  const lessonPlans = await db.lessonPlan.findMany({
    where: {
      userId,
      extractedText: { not: null }
    },
    select: {
      id: true,
      fileName: true,
      extractedText: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  
  return lessonPlans
    .filter(plan => plan.extractedText)
    .map(plan => ({
      documentId: plan.id,
      documentType: 'lesson_plan' as const,
      text: plan.extractedText!.substring(0, 1500) + (plan.extractedText!.length > 1500 ? '...' : ''),
      fileName: plan.fileName,
      relevance: 1,
    }))
}

