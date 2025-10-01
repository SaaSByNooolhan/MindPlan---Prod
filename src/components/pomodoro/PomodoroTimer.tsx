import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { usePomodoro } from '../../contexts/PomodoroContext';
;

export const PomodoroTimer: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    timeLeft,
    isActive,
    isBreak,
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
  } = usePomodoro();
  
  // Toutes les fonctionnalités sont maintenant gratuites
  const workDuration = customWorkDuration * 60; // minutes to seconds
  const breakDuration = customBreakDuration * 60; // minutes to seconds

  const progress = isBreak 
    ? ((breakDuration - timeLeft) / breakDuration) * 100
    : ((workDuration - timeLeft) / workDuration) * 100;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Timer Display */}
      <Card className="p-6 sm:p-8 text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            {isBreak ? (
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400 mr-3" />
            ) : (
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-black dark:text-white mr-3" />
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h2>
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-6">
            <svg className="w-32 h-32 sm:w-48 sm:h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ${
                  isBreak ? 'text-teal-500' : 'text-purple-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isBreak ? 'Break' : 'Focus'} • {isBreak ? customBreakDuration : customWorkDuration} min
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        {(
          <div className="mb-6">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="px-4 py-2 text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personnaliser les durées
            </Button>
            
            {showSettings && (
              <Card className="mt-4 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Durées personnalisées
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée de focus (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={customWorkDuration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setCustomWorkDuration(value);
                        // Si le temps de pause est plus grand que le focus, on l'ajuste
                        if (customBreakDuration > value) {
                          setCustomBreakDuration(value);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée de pause (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={customWorkDuration}
                      value={customBreakDuration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        // S'assurer que la pause ne dépasse pas le focus
                        if (value <= customWorkDuration) {
                          setCustomBreakDuration(value);
                        }
                      }}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum: {customWorkDuration} minutes
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Configuration actuelle:</strong><br />
                    Focus: {customWorkDuration} minutes ({formatTime(customWorkDuration * 60)})<br />
                    Pause: {customBreakDuration} minutes ({formatTime(customBreakDuration * 60)})
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Info */}
        {(
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personnalisez vos durées de travail et de pause
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <Button
            onClick={isActive ? pauseTimer : startTimer}
            className={`px-6 sm:px-8 py-3 w-full sm:w-auto ${
              isBreak 
                ? 'bg-teal-500 hover:bg-teal-600' 
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Démarrer
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            className="px-6 sm:px-8 py-3 w-full sm:w-auto"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={switchMode}
            variant="outline"
            className="px-6 sm:px-8 py-3 w-full sm:w-auto"
          >
            <Timer className="w-5 h-5 mr-2" />
            {isBreak ? 'Focus' : 'Break'}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Aujourd'hui</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {todayStats.completed}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {todayStats.total} sessions
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cette semaine</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {weeklyStats.completed}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {weeklyStats.total} sessions
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cette année</h3>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {yearlyStats.completed}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {yearlyStats.total} sessions
          </p>
        </Card>
      </div>
    </div>
  );
};
