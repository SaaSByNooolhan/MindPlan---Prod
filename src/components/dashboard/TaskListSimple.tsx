import React from 'react'
import { Card } from '../ui/Card'
import { Task } from '../../lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckSquare, Clock, Flag } from 'lucide-react'

interface TaskListSimpleProps {
  tasks: Task[]
  onNavigate: (section: string, params?: any) => void
}

export const TaskListSimple: React.FC<TaskListSimpleProps> = ({ tasks, onNavigate }) => {
  // Get today's date and next week's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7) // 7 days from today
  
  // Get relevant tasks: today's tasks, overdue tasks, tasks without due date, and next week's tasks
  const relevantTasks = tasks.filter(task => {
    if (!task.due_date) {
      // Include tasks without due date
      return true
    }
    
    const taskDate = new Date(task.due_date)
    taskDate.setHours(0, 0, 0, 0)
    
    // Include today's tasks, overdue tasks, and next week's tasks
    return taskDate <= nextWeek
  })

  // Get remaining tasks (not completed) and sort them by priority
  const remainingTasks = relevantTasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      // First sort by date (overdue first, then today, then future)
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      
      const dateA = new Date(a.due_date)
      const dateB = new Date(b.due_date)
      
      // Overdue tasks first
      if (dateA < today && dateB >= today) return -1
      if (dateA >= today && dateB < today) return 1
      
      // Then by date
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      
      // Finally by priority (high, medium, low)
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  // Helper function to get task status
  const getTaskStatus = (task: Task) => {
    if (!task.due_date) {
      return { status: 'no-date', label: 'Sans échéance', color: 'text-gray-500 dark:text-gray-400' }
    }
    
    const taskDate = new Date(task.due_date)
    taskDate.setHours(0, 0, 0, 0)
    
    if (taskDate.getTime() === today.getTime()) {
      return { status: 'today', label: 'Aujourd\'hui', color: 'text-blue-600 dark:text-blue-400' }
    } else if (taskDate < today) {
      return { status: 'overdue', label: 'En retard', color: 'text-red-600 dark:text-red-400' }
    } else if (taskDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return { status: 'tomorrow', label: 'Demain', color: 'text-orange-600 dark:text-orange-400' }
    } else {
      const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      return { 
        status: 'upcoming', 
        label: `Dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`, 
        color: 'text-green-600 dark:text-green-400' 
      }
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tâches de la semaine
          </h3>
          <button
            onClick={() => onNavigate('tasks', { openAddForm: true })}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            + Ajouter
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {relevantTasks.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">7 jours</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {remainingTasks.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Restantes</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {remainingTasks.filter(task => {
                if (!task.due_date) return false
                const taskDate = new Date(task.due_date)
                taskDate.setHours(0, 0, 0, 0)
                return taskDate.getTime() === today.getTime()
              }).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Aujourd'hui</div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {remainingTasks.length > 0 ? (
            remainingTasks.slice(0, 8).map((task) => {
              const taskStatus = getTaskStatus(task)
              return (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <CheckSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {task.title}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {task.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.category}
                        </span>
                      )}
                      <span className={`text-xs ${taskStatus.color}`}>
                        {taskStatus.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {task.due_date && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(task.due_date), 'dd/MM', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Aucune tâche restante</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {relevantTasks.length > 0 ? 'Toutes les tâches sont terminées !' : 'Ajoutez une tâche pour commencer'}
              </p>
            </div>
          )}
        </div>

        {/* View All Button */}
        {remainingTasks.length > 8 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onNavigate('tasks')}
              className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              Voir toutes les tâches ({remainingTasks.length - 8} de plus)
            </button>
          </div>
        )}

        {remainingTasks.length > 0 && remainingTasks.length <= 8 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onNavigate('tasks')}
              className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              Voir toutes les tâches
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
