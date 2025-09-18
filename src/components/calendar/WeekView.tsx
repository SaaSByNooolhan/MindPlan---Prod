import React from 'react'
import { Card } from '../ui/Card'
import { Event } from '../../lib/supabase'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WeekViewProps {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time)
      return isSameDay(eventDate, day)
    })
  }

  const getEventPosition = (event: Event) => {
    const startTime = parseISO(event.start_time)
    const endTime = parseISO(event.end_time)
    
    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const endHour = endTime.getHours()
    const endMinute = endTime.getMinutes()
    
    const top = (startHour + startMinute / 60) * 60 // 60px per hour
    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 60
    
    return { top, height: Math.max(height, 30) } // Minimum 30px height
  }

  return (
    <Card className="p-6">
      <div className="flex">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0">
          <div className="h-12"></div> {/* Header spacer */}
          {hours.map(hour => (
            <div key={hour} className="h-[60px] flex items-start justify-end pr-2 text-xs text-gray-500 dark:text-gray-400">
              {hour === 0 ? '00:00' : `${hour.toString().padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayEvents = getEventsForDay(day)
            const isDayToday = isToday(day)

            return (
              <div key={day.toISOString()} className="border-l border-gray-200 dark:border-gray-700">
                {/* Day Header */}
                <div
                  className={`
                    h-12 p-2 text-center border-b border-gray-200 dark:border-gray-700 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                    ${isDayToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'}
                  `}
                  onClick={() => onDateClick(day)}
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div className={`
                    text-sm font-medium
                    ${isDayToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
                  `}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Hours Grid */}
                <div className="relative">
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => {
                        const clickedDate = new Date(day)
                        clickedDate.setHours(hour, 0, 0, 0)
                        onDateClick(clickedDate)
                      }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const { top, height } = getEventPosition(event)
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 rounded p-1 text-xs cursor-pointer hover:opacity-80 z-10"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: event.color + '20',
                          borderLeft: `3px solid ${event.color}`,
                          color: event.color
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}