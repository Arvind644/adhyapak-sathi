'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResponseTypeModalProps {
  selectedType: string
  onSelect: (type: string) => void
  onClose: () => void
}

const responseTypes = [
  { id: 'step-by-step', label: 'Step-by-Step Instructions', icon: '📋' },
  { id: 'quick-tip', label: 'Quick Tip', icon: '💡' },
  { id: 'detailed', label: 'Detailed Explanation', icon: '📖' },
  { id: 'manual-excerpt', label: 'Manual Excerpt', icon: '📄' },
  { id: 'visual-aid', label: 'Visual Aids', icon: '🖼️' },
  { id: 'all', label: 'All of the Above', icon: '✨' },
]

export function ResponseTypeModal({
  selectedType,
  onSelect,
  onClose,
}: ResponseTypeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Select Response Type
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {responseTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedType === type.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  )
}

