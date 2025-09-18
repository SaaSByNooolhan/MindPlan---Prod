import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid3X3 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { EventForm } from './EventForm'
import { EventList } from './EventList'
import { CalendarGrid } from './CalendarGrid'
import { WeekView } from './WeekView'
import { supabase, Event } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'

type ViewType = 'month' | 'week' | 'list'

export const Calendar: React.FC = () => {
  const { user } = useAuthContext()
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('month')
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user, currentDate, viewType])

  const loadEvents = async () => {
    if (!user) return

    let startDate: Date
    let endDate: Date

    if (viewType === 'month') {
      startDate = startOfMonth(currentDate)
      endDate = endOfMonth(currentDate)
    } else if (viewType === 'week') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
    } else {
      // For list view, load current month
      startDate = startOfMonth(currentDate)
      endDate = endOfMonth(currentDate)
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error loading events:', error)
    } else {
      setEvents(data || [])
    }
  }

  const handlePrevious = () => {
    if (viewType === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (viewType === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (viewType === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventSaved = () => {
    setShowEventForm(false)
    setSelectedEvent(null)
    setSelectedDate(null)
    loadEvents()
  }

  const handleEventEdit = (event: Event) => {
    setSelectedEvent(event)
    setShowEventForm(true)
  }

  const handleEventDelete = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
    } else {
      loadEvents()
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEventForm(true)
  }

  const getViewTitle = () => {
    if (viewType === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: fr })
    } else if (viewType === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(weekStart, 'dd MMM', { locale: fr })} - ${format(weekEnd, 'dd MMM yyyy', { locale: fr })}`
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: fr })
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Agenda</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos événements et rendez-vous
          </p>
        </div>
        <Button onClick={() => setShowEventForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Navigation and View Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Date Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Aujourd'hui
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {getViewTitle()}
            </h2>
          </div>

          {/* View Type Controls */}
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <Button
              variant={viewType === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewType('month')}
              className="flex-1 sm:flex-none"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Mois</span>
            </Button>
            <Button
              variant={viewType === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewType('week')}
              className="flex-1 sm:flex-none"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Semaine</span>
            </Button>
            <Button
              variant={viewType === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewType('list')}
              className="flex-1 sm:flex-none"
            >
              <List className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar Views */}
      {viewType === 'month' && (
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventEdit}
        />
      )}

      {viewType === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventEdit}
        />
      )}

      {viewType === 'list' && (
        <EventList
          events={events}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
        />
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={selectedEvent}
          selectedDate={selectedDate}
          onSave={handleEventSaved}
          onCancel={() => {
            setShowEventForm(false)
            setSelectedEvent(null)
            setSelectedDate(null)
          }}
          existingEventsCount={events.length}
        />
      )}
    </div>
  )
}