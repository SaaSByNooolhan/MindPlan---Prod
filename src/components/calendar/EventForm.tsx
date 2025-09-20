import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Tag, Palette } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { supabase, Event } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'
import { format } from 'date-fns'

interface EventFormProps {
  event?: Event | null
  selectedDate?: Date | null
  onSave: () => void
  onCancel: () => void
  existingEventsCount?: number
}

const categories = [
  'Travail',
  'Personnel',
  'Santé',
  'Famille',
  'Loisirs',
  'Rendez-vous',
  'Sport',
  'Administratif',
  'Autres'
]

const colors = [
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6B7280'  // Gray
]

export const EventForm: React.FC<EventFormProps> = ({
  event,
  selectedDate,
  onSave,
  onCancel,
  existingEventsCount = 0
}) => {
  const { user } = useAuthContext()
  const { isPremium } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personnel',
    color: '#8B5CF6',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: ''
  })

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start_time)
      const endDate = new Date(event.end_time)
      
      setFormData({
        title: event.title,
        description: event.description || '',
        category: event.category,
        color: event.color,
        start_date: format(startDate, 'yyyy-MM-dd'),
        start_time: format(startDate, 'HH:mm'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        end_time: format(endDate, 'HH:mm')
      })
    } else if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const timeStr = format(selectedDate, 'HH:mm')
      
      setFormData(prev => ({
        ...prev,
        start_date: dateStr,
        start_time: timeStr,
        end_date: dateStr,
        end_time: format(new Date(selectedDate.getTime() + 60 * 60 * 1000), 'HH:mm') // +1 hour
      }))
    } else {
      const now = new Date()
      const dateStr = format(now, 'yyyy-MM-dd')
      const timeStr = format(now, 'HH:mm')
      
      setFormData(prev => ({
        ...prev,
        start_date: dateStr,
        start_time: timeStr,
        end_date: dateStr,
        end_time: format(new Date(now.getTime() + 60 * 60 * 1000), 'HH:mm')
      }))
    }
  }, [event, selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim()) return

    // Limitation Freemium : 5 événements maximum
    if (!isPremium() && !event && existingEventsCount >= 5) {
      alert('Limite Freemium atteinte ! Vous ne pouvez créer que 5 événements maximum. Passez Premium pour des événements illimités.')
      return
    }

    setLoading(true)

    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`)
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`)

      const eventData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        color: formData.color,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      }

      if (event) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)
        
        if (error) throw error
      }

      onSave()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Titre"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Titre de l'événement"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description (optionnel)"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <Input
              label="Heure de début"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de fin"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
            <Input
              label="Heure de fin"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enregistrement...' : (event ? 'Modifier' : 'Créer')}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
