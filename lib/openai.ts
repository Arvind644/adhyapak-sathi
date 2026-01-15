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

interface LessonPlanSummary {
  totalCount: number
  plans: Array<{
    name: string
    tags: string[]
    subject?: string
    grade?: string
    topic?: string
    uploadedAt: string
  }>
}

export async function generateResponse(
  query: string,
  contextChunks: Array<{ text: string; source: string; metadata?: any }>,
  responseType: string,
  lessonPlanSummary?: LessonPlanSummary
): Promise<string> {
  // Prepare context if available
  const hasContext = contextChunks.length > 0
  const contextText = hasContext 
    ? contextChunks.map((chunk, idx) => `[Source ${idx + 1}: ${chunk.source}]\n${chunk.text}`).join('\n\n---\n\n')
    : ''

  // Prepare lesson plan summary
  const hasSummary = lessonPlanSummary && lessonPlanSummary.totalCount > 0
  const summaryText = hasSummary
    ? `
TEACHER'S LESSON PLANS (${lessonPlanSummary.totalCount} total):
${lessonPlanSummary.plans.map((p, i) => 
  `${i + 1}. "${p.name}"${p.subject ? ` - Subject: ${p.subject}` : ''}${p.grade ? `, Grade: ${p.grade}` : ''}${p.topic ? `, Topic: ${p.topic}` : ''} (uploaded: ${p.uploadedAt})`
).join('\n')}`
    : 'TEACHER\'S LESSON PLANS: None uploaded yet.'

  const systemPrompt = `You are a friendly and helpful pedagogical assistant for teachers in India called "Adhyapak Saathi" (Teacher's Companion).

YOUR BEHAVIOR:
1. For casual conversation (greetings like "hi", "hello", "how are you", small talk, thank you, etc.):
   - Respond naturally and briefly like a friendly colleague
   - DO NOT mention lesson plan data unless asked
   - Keep it short and warm (1-2 sentences)

2. For questions about the teacher's data (like "how many lesson plans", "what have I uploaded", "list my files"):
   - Use the TEACHER'S LESSON PLANS summary provided below to answer accurately
   - Give specific counts and names

3. For teaching-related questions (about lessons, pedagogy, classroom activities, students, etc.):
   - Use the provided context from the teacher's lesson plans if relevant
   - Provide actionable, classroom-ready advice
   - Be specific and practical
   - Reference the lesson plan sources when using them

4. For questions unrelated to teaching or the provided context:
   - Answer helpfully based on your general knowledge
   - DO NOT force lesson plan content into unrelated questions

IMPORTANT: YOU decide when the lesson plan context is relevant. Don't use it just because it's provided.

${summaryText}

${hasContext ? `Response Format (use ONLY for teaching questions): ${getResponseTypeInstructions(responseType)}` : ''}`

  const userPrompt = hasContext 
    ? `Teacher says: ${query}

Relevant Content from Lesson Plans:
${contextText}

Respond appropriately.`
    : `Teacher says: ${query}

Respond appropriately.`

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

