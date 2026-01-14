'use client'

import { ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  query: string
  response: string
  responseType: string
  sources?: any[]
  timestamp: Date
  isRelevant?: boolean
}

interface ChatMessageProps {
  message: Message
  onFeedback: (messageId: string, isRelevant: boolean) => void
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  return (
    <div className="space-y-4">
      {/* User Query */}
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-lg px-4 py-2">
          <p className="text-sm">{message.query}</p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* AI Response */}
      {message.response && (
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {message.response}
              </ReactMarkdown>
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {source.documentType === 'knowledge_base'
                        ? 'Teaching Manual'
                        : 'Your Lesson Plan'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeedback(message.id, true)}
                className={message.isRelevant === true ? 'bg-green-50' : ''}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeedback(message.id, false)}
                className={message.isRelevant === false ? 'bg-red-50' : ''}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Request different response type - would need to implement
                  console.log('Request different response type')
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

