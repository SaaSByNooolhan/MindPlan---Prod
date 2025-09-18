import React from 'react'
import { X, Play } from 'lucide-react'
import { Button } from './Button'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl?: string
  title?: string
}

export const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder - remplacez par votre vidéo
  title = "Présentation de MindPlan"
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Content */}
        <div className="p-6">
          {videoUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={videoUrl}
                title={title}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Vidéo de présentation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Votre vidéo de présentation sera bientôt disponible ici
              </p>
              <Button onClick={onClose}>
                Fermer
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-center">
            <Button onClick={onClose} variant="outline">
              Fermer la vidéo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
