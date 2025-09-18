import React from 'react'
import { Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Event } from '../../lib/supabase'
import { format, parseISO, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

interface EventListProps {
  events: Event[]
  onEventEdit: (event: Event) => void
  onEventDelete: (eventId: string) => void
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEventEdit,
  onEventDelete
}) => {
  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const eventDate = parseISO(event.start_time)
    const dateKey = format(eventDate, 'yyyy-MM-dd')
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(event)
    
    return groups
  }, {} as Record<string, Event[]>)

  const sortedDates = Object.keys(groupedEvents).sort()

  if (events.length === 0) {
    return (
      <Card className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun événement</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Commencez par créer votre premier événement !
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateKey => {
        const dayEvents = groupedEvents[dateKey]
        const eventDate = parseISO(dayEvents[0].start_time)
        const isToday = isSameDay(eventDate, new Date())

        return (
          <Card key={dateKey}>
            <div className={`
              p-4 border-b border-gray-200 dark:border-gray-700
              ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}>
              <h3 className={`
                text-lg font-semibold capitalize
                ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
              `}>
                {format(eventDate, 'EEEE dd MMMM yyyy', { locale: fr })}
                {isToday && <span className="ml-2 text-sm font-normal">(Aujourd'hui)</span>}
              </h3>
            </div>

            <div className="p-4 space-y-3">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </h4>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {event.category}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 truncate">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEventEdit(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEventDelete(event.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}