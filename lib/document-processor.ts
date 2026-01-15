// Document processing utilities - Simple text extraction (NO EMBEDDINGS)
// This is much faster and uses minimal memory

// PDF processing - DYNAMIC IMPORT to prevent memory bloat at module load
async function processPDF(buffer: Buffer): Promise<string> {
  try {
    console.log('Loading pdf-parse library...')
    const pdfParse = (await import('pdf-parse')).default
    console.log('Parsing PDF...')
    const data = await pdfParse(buffer)
    console.log('PDF parsed successfully')
    return data.text
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error('Failed to process PDF file. Please ensure the file is a valid PDF.')
  }
}

// Word document processing using simple XML extraction
// DOCX files are ZIP archives containing XML
async function processWord(buffer: Buffer): Promise<string> {
  try {
    console.log('Loading JSZip library...')
    const JSZip = (await import('jszip')).default
    
    console.log('Extracting DOCX content...')
    const zip = await JSZip.loadAsync(buffer)
    const documentXml = await zip.file('word/document.xml')?.async('string')
    
    if (!documentXml) {
      throw new Error('Invalid Word document structure')
    }
    
    // Extract text from XML by removing tags
    const text = documentXml
      .replace(/<[^>]+>/g, ' ')  // Remove XML tags
      .replace(/&nbsp;/g, ' ')   // Replace &nbsp;
      .replace(/&lt;/g, '<')     // Decode entities
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim()
    
    console.log('DOCX text extracted successfully')
    return text
  } catch (error) {
    console.error('Error processing Word document:', error)
    throw new Error('Failed to process Word document. Please ensure the file is a valid Word document.')
  }
}

/**
 * Extract text from a document file (PDF or Word)
 * No chunking or embeddings - just plain text extraction
 */
export async function extractText(
  file: File,
  type: 'pdf' | 'word'
): Promise<string> {
  console.log(`Converting file to buffer...`)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let text: string
  if (type === 'pdf') {
    text = await processPDF(buffer)
  } else {
    text = await processWord(buffer)
  }

  // Clean up the text
  text = text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim()

  // Limit text size (max ~100 pages worth of text)
  const MAX_TEXT_LENGTH = 200000
  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`Document text too large (${text.length} chars), truncating to ${MAX_TEXT_LENGTH} chars`)
    text = text.substring(0, MAX_TEXT_LENGTH)
  }

  return text
}

