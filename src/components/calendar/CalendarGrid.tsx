import React from 'react'
import { Card } from '../ui/Card'
import { Event } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CalendarGridProps {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick
}) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time)
      return isSameDay(eventDate, day)
    })
  }

  return (
    <Card className="p-6">
      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer
                hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isDayToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-900'}
              `}
              onClick={() => onDateClick(day)}
            >
              <div className={`
                text-sm font-medium mb-2
                ${isDayToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
                ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
              `}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    {format(parseISO(event.start_time), 'HH:mm')} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}