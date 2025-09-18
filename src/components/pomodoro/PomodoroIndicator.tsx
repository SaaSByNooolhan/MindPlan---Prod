import React from 'react'
import { Play, Pause, Coffee, Brain, Timer } from 'lucide-react'
import { usePomodoro } from '../../contexts/PomodoroContext'

interface PomodoroIndicatorProps {
  onNavigateToPomodoro: () => void
}

export const PomodoroIndicator: React.FC<PomodoroIndicatorProps> = ({ onNavigateToPomodoro }) => {
  const { 
    timeLeft, 
    isActive, 
    isBreak, 
    hasStarted,
    customWorkDuration, 
    customBreakDuration, 
    formatTime, 
    startTimer, 
    pauseTimer,
    isPremium 
  } = usePomodoro()

  // Calculer les durées (Premium ou par défaut)
  const workDuration = (isPremium() ? customWorkDuration : 25) * 60
  const breakDuration = (isPremium() ? customBreakDuration : 5) * 60
  
  // Ne pas afficher si le timer n'a jamais été démarré
  if (!hasStarted) return null

  const progress = isBreak 
    ? ((breakDuration - timeLeft) / breakDuration) * 100
    : ((workDuration - timeLeft) / workDuration) * 100

  return (
    <div 
      onClick={onNavigateToPomodoro}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
        isActive 
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
          : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* Icône du mode */}
      <div className="relative">
        {isBreak ? (
          <Coffee className={`w-5 h-5 ${isActive ? 'text-teal-500' : 'text-teal-400'}`} />
        ) : (
          <Brain className={`w-5 h-5 ${isActive ? 'text-purple-500' : 'text-purple-400'}`} />
        )}
        {/* Indicateur de progression circulaire */}
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <svg className="w-3 h-3 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-600"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${
                isBreak ? 'text-teal-500' : 'text-purple-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Temps restant */}
      <div className="flex flex-col">
        <div className="text-sm font-mono font-bold text-gray-900 dark:text-white">
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isBreak ? 'Break' : 'Focus'} {!isActive && '• Pause'}
        </div>
      </div>

      {/* Bouton play/pause */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (isActive) {
            pauseTimer()
          } else {
            startTimer()
          }
        }}
        className={`p-1 rounded-full transition-colors duration-200 ${
          isBreak 
            ? 'text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20' 
            : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
        }`}
      >
        {isActive ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
