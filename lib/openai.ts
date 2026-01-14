import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Embedding model - using text-embedding-3-small for cost efficiency
export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

// Chat model
export const CHAT_MODEL = 'gpt-4o-mini' // Using mini for cost efficiency, can upgrade to gpt-4 if needed

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  })
  return response.data[0].embedding
}

export async function generateResponse(
  query: string,
  contextChunks: Array<{ text: string; source: string; metadata?: any }>,
  responseType: string
): Promise<string> {
  const contextText = contextChunks
    .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.source}]\n${chunk.text}`)
    .join('\n\n---\n\n')

  const systemPrompt = `You are a helpful pedagogical assistant for teachers in India. Your role is to provide clear, practical, and contextually relevant guidance based on official teaching manuals and pedagogy practices.

Guidelines:
- Provide actionable, classroom-ready advice
- Reference specific sources when possible
- Use simple, clear language
- Be culturally sensitive and context-aware
- If information is not in the provided context, say so clearly

Response Format: ${getResponseTypeInstructions(responseType)}`

  const userPrompt = `Teacher's Question: ${query}

Relevant Context from Teaching Materials:
${contextText}

Please provide a helpful response based on the context above. If the context doesn't fully answer the question, acknowledge this and provide the best guidance you can based on general pedagogical principles.`

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
}

function getResponseTypeInstructions(responseType: string): string {
  switch (responseType) {
    case 'step-by-step':
      return 'Provide a clear, numbered step-by-step guide that the teacher can follow in their classroom.'
    case 'quick-tip':
      return 'Provide a concise, actionable tip (2-3 sentences maximum).'
    case 'detailed':
      return 'Provide a comprehensive, detailed explanation with examples and context.'
    case 'manual-excerpt':
      return 'Quote or paraphrase relevant sections from the teaching manuals, clearly indicating the source.'
    case 'visual-aid':
      return 'Describe visual aids, diagrams, or teaching materials that would be helpful, and explain how to use them.'
    case 'all':
      return 'Provide a comprehensive response that includes step-by-step instructions, quick tips, detailed explanations, relevant manual excerpts, and suggestions for visual aids.'
    default:
      return 'Provide a helpful, well-structured response.'
  }
}

