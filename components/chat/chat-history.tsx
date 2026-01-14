'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryHistory {
  id: string
  originalText: string
  responseType: string | null
  createdAt: string
}

interface ChatHistoryProps {
  onSelectQuery: (query: string) => void
}

export function ChatHistory({ onSelectQuery }: ChatHistoryProps) {
  const [queries, setQueries] = useState<QueryHistory[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [search])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const url = search
        ? `/api/queries/history?search=${encodeURIComponent(search)}`
        : '/api/queries/history'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setQueries(data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Query History</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past queries..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : queries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No queries found
          </div>
        ) : (
          <div className="space-y-2">
            {queries.map((query) => (
              <button
                key={query.id}
                onClick={() => onSelectQuery(query.originalText)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <p className="text-sm text-gray-900 line-clamp-2">
                  {query.originalText}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(query.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

