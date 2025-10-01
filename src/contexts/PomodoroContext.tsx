import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface PomodoroState {
  timeLeft: number
  isActive: boolean
  isBreak: boolean
  hasStarted: boolean
  customWorkDuration: number
  customBreakDuration: number
  monthlyPomodoroTime: number
  todayStats: { completed: number; total: number }
  weeklyStats: { completed: number; total: number }
  yearlyStats: { completed: number; total: number }
}

interface PomodoroContextType extends PomodoroState {
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  switchMode: () => void
  setCustomWorkDuration: (duration: number) => void
  setCustomBreakDuration: (duration: number) => void
  formatTime: (seconds: number) => string
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

interface PomodoroProviderProps {
  children: ReactNode
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [hasStarted, setHasStarted] = useState(false) // Track if timer has been started at least once
  const [customWorkDuration, setCustomWorkDuration] = useState(25) // minutes
  const [customBreakDuration, setCustomBreakDuration] = useState(5) // minutes
  const [monthlyPomodoroTime, setMonthlyPomodoroTime] = useState(0) // minutes used this month
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 })
  const [weeklyStats, setWeeklyStats] = useState({ completed: 0, total: 0 })
  const [yearlyStats, setYearlyStats] = useState({ completed: 0, total: 0 })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Toutes les fonctionnalités sont maintenant gratuites
  const workDuration = customWorkDuration * 60 // minutes to seconds
  const breakDuration = customBreakDuration * 60 // minutes to seconds

  // Réinitialiser l'état quand l'utilisateur change
  useEffect(() => {
    if (user) {
      // Réinitialiser l'état du timer pour le nouvel utilisateur
      setTimeLeft(25 * 60)
      setIsActive(false)
      setIsBreak(false)
      setHasStarted(false)
      setCustomWorkDuration(25)
      setCustomBreakDuration(5)
      setMonthlyPomodoroTime(0)
      setTodayStats({ completed: 0, total: 0 })
      setWeeklyStats({ completed: 0, total: 0 })
      setYearlyStats({ completed: 0, total: 0 })
      
      // Arrêter le timer s'il était en cours
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      // Charger les données du nouvel utilisateur
      fetchTodayStats()
      fetchWeeklyStats()
      fetchYearlyStats()
      fetchMonthlyPomodoroTime()
    } else {
      // Si pas d'utilisateur, réinitialiser tout
      setTimeLeft(25 * 60)
      setIsActive(false)
      setIsBreak(false)
      setHasStarted(false)
      setCustomWorkDuration(25)
      setCustomBreakDuration(5)
      setMonthlyPomodoroTime(0)
      setTodayStats({ completed: 0, total: 0 })
      setWeeklyStats({ completed: 0, total: 0 })
      setYearlyStats({ completed: 0, total: 0 })
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user])

  // Mettre à jour le temps affiché quand les durées personnalisées changent
  // Seulement si le timer n'a jamais été démarré
  useEffect(() => {
    if (!isActive && !hasStarted) {
      setTimeLeft(isBreak ? breakDuration : workDuration)
    }
  }, [customWorkDuration, customBreakDuration, isBreak, isActive, hasStarted, workDuration, breakDuration])

  // Timer principal
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft])

  // Notifications de fin de timer
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      // Notification sonore
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      }

      // Notification du navigateur
      if (Notification.permission === 'granted') {
        new Notification(
          isBreak ? 'Break finished!' : 'Pomodoro completed!',
          {
            body: isBreak ? 'Time to get back to work!' : 'Time for a break!',
            icon: '/favicon.ico'
          }
        )
      }
    }
  }, [timeLeft, isActive, isBreak])

  const fetchMonthlyPomodoroTime = async () => {
    if (!user) return

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('duration')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())

    if (!error && data) {
      const totalMinutes = data.reduce((sum, session) => sum + session.duration, 0)
      setMonthlyPomodoroTime(totalMinutes)
    }
  }

  const fetchTodayStats = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)

    if (!error && data) {
      setTodayStats({
        completed: data.filter(s => s.completed).length,
        total: data.length
      })
    }
  }

  const fetchWeeklyStats = async () => {
    if (!user) return

    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 7))

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())

    if (!error && data) {
      setWeeklyStats({
        completed: data.filter(s => s.completed).length,
        total: data.length
      })
    }
  }

  const fetchYearlyStats = async () => {
    if (!user) return

    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31)

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', yearStart.toISOString())
      .lte('created_at', yearEnd.toISOString())

    if (!error && data) {
      setYearlyStats({
        completed: data.filter(s => s.completed).length,
        total: data.length
      })
    }
  }

  const handleTimerComplete = async () => {
    setIsActive(false)
    
    if (!isBreak && user) {
      // Save completed pomodoro session
      await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: user.id,
          duration: workDuration / 60,
          completed: true
        })
      
      fetchTodayStats()
      fetchWeeklyStats()
      fetchYearlyStats()
      fetchMonthlyPomodoroTime()
    }

    // Switch between work and break
    setIsBreak(!isBreak)
    setTimeLeft(isBreak ? workDuration : breakDuration)
  }

  const startTimer = () => {
    setHasStarted(true) // Mark that timer has been started
    setIsActive(true)
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setHasStarted(false) // Reset the started state
    setTimeLeft(isBreak ? breakDuration : workDuration)
  }

  const switchMode = () => {
    setIsActive(false)
    setIsBreak(!isBreak)
    setTimeLeft(isBreak ? workDuration : breakDuration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const value: PomodoroContextType = {
    timeLeft,
    isActive,
    isBreak,
    hasStarted,
    customWorkDuration,
    customBreakDuration,
    monthlyPomodoroTime,
    todayStats,
    weeklyStats,
    yearlyStats,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    setCustomWorkDuration,
    setCustomBreakDuration,
    formatTime
  }

  return (
    <PomodoroContext.Provider value={value}>
      {children}
      {/* Audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>
    </PomodoroContext.Provider>
  )
}

export const usePomodoro = () => {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }
  return context
}
