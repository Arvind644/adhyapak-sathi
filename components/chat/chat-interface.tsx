'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2, AlertCircle, History, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponseTypeModal } from './response-type-modal'
import { ChatMessage } from './chat-message'
import { ChatHistory } from './chat-history'

interface Message {
  id: string
  query: string
  response: string
  responseType: string
  sources?: any[]
  timestamp: Date
  isRelevant?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseType, setResponseType] = useState<string>('all')
  const [showResponseTypeModal, setShowResponseTypeModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAndSend(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAndSend = async (audioBlob: Blob) => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const data = await response.json()
      setInput(data.transcript)
      setIsVoiceMode(false)
    } catch (error) {
      console.error('Error transcribing:', error)
      setError('Failed to transcribe audio. Please try typing instead.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const queryText = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      query: queryText,
      response: '',
      responseType,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          responseType,
          voiceTranscript: isVoiceMode ? queryText : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Update message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id
            ? {
                ...msg,
                response: data.response,
                sources: data.sources,
              }
            : msg
        )
      )
    } catch (error) {
      console.error('Error sending query:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'AI service is not available, please try later'
      )
      // Remove the user message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (messageId: string, isRelevant: boolean) => {
    const message = messages.find((m) => m.id === messageId)
    if (!message) return

    try {
      await fetch('/api/query/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: messageId,
          isRelevant,
        }),
      })

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRelevant } : msg
        )
      )
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          Chat Assistant
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowHistory(!showHistory)}
            title="Query History"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowResponseTypeModal(true)}
            title="Response Type"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-gray-200 z-10 overflow-y-auto">
          <ChatHistory onSelectQuery={(query) => {
            setInput(query)
            setShowHistory(false)
          }} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg">Ask your classroom question here</p>
            <p className="text-sm mt-2">
              You can type or use voice input
            </p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onFeedback={handleFeedback}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating response...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null)
                if (messages.length > 0) {
                  const lastMessage = messages[messages.length - 1]
                  if (!lastMessage.response) {
                    handleSend()
                  }
                }
              }}
            >
              Retry
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={
                isVoiceMode
                  ? 'Voice mode active...'
                  : 'Type your question here...'
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {isRecording && (
              <div className="absolute bottom-2 right-2 flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm">Recording...</span>
              </div>
            )}
          </div>
          <Button
            variant={isVoiceMode ? 'default' : 'outline'}
            size="icon"
            onClick={() => {
              if (isVoiceMode) {
                if (isRecording) {
                  stopRecording()
                } else {
                  setIsVoiceMode(false)
                }
              } else {
                setIsVoiceMode(true)
                startRecording()
              }
            }}
            disabled={isLoading}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        {responseType && (
          <div className="mt-2 text-sm text-gray-500">
            Response type: <span className="font-medium">{responseType}</span>
          </div>
        )}
      </div>

      {/* Response Type Modal */}
      {showResponseTypeModal && (
        <ResponseTypeModal
          selectedType={responseType}
          onSelect={(type) => {
            setResponseType(type)
            setShowResponseTypeModal(false)
          }}
          onClose={() => setShowResponseTypeModal(false)}
        />
      )}
    </div>
  )
}

