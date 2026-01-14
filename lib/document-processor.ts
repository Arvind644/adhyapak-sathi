// Document processing utilities
// Note: pdf-parse and mammoth require Node.js 20.16+ or 22.3+
// These will be imported conditionally or with fallbacks

export interface ProcessedDocument {
  text: string
  chunks: Array<{
    text: string
    index: number
    metadata?: Record<string, any>
  }>
}

const CHUNK_SIZE = 1000 // characters
const CHUNK_OVERLAP = 200 // characters

export function chunkText(text: string, metadata?: Record<string, any>): Array<{
  text: string
  index: number
  metadata?: Record<string, any>
}> {
  const chunks: Array<{ text: string; index: number; metadata?: Record<string, any> }> = []
  let index = 0
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    let chunkText = text.slice(start, end)

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunkText.lastIndexOf('.')
      const lastNewline = chunkText.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > CHUNK_SIZE * 0.5) {
        chunkText = text.slice(start, start + breakPoint + 1)
        start = start + breakPoint + 1
      } else {
        start = end
      }
    } else {
      start = end
    }

    chunks.push({
      text: chunkText.trim(),
      index,
      metadata,
    })

    index++
    start -= CHUNK_OVERLAP // Overlap for context
  }

  return chunks
}

// PDF processing (requires pdf-parse)
export async function processPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to handle version issues
    const pdfParse = await import('pdf-parse').catch(() => null)
    if (!pdfParse) {
      throw new Error('pdf-parse is not available. Please upgrade Node.js to 20.16+ or install pdf-parse manually.')
    }
    const data = await pdfParse.default(buffer)
    return data.text
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error('Failed to process PDF file')
  }
}

// Word document processing (requires mammoth)
export async function processWord(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth').catch(() => null)
    if (!mammoth) {
      throw new Error('mammoth is not available. Please install mammoth manually.')
    }
    const result = await mammoth.default.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Error processing Word document:', error)
    throw new Error('Failed to process Word document')
  }
}

export async function processDocument(
  file: File,
  type: 'pdf' | 'word'
): Promise<ProcessedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let text: string
  if (type === 'pdf') {
    text = await processPDF(buffer)
  } else {
    text = await processWord(buffer)
  }

  const chunks = chunkText(text, {
    fileName: file.name,
    fileType: type,
    fileSize: file.size,
  })

  return {
    text,
    chunks,
  }
}

