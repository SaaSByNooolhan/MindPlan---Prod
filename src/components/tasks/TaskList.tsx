import React, { useState, useEffect } from 'react'
import { Plus, Check, X, Calendar, Flag, CheckSquare } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { supabase, Task } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TaskListProps {
  initialParams?: any
}

export const TaskList: React.FC<TaskListProps> = ({ initialParams }) => {
  const { user } = useAuthContext()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    due_date: '',
    estimated_time: ''
  })

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  useEffect(() => {
    if (initialParams?.openAddForm) {
      setShowAddForm(true)
    }
  }, [initialParams])

  const loadTasks = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {

    } else {
      setTasks(data || [])
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTask.title.trim()) return

    // Plus de limitations - toutes les fonctionnalités sont gratuites

    setIsCreating(true)
    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        due_date: newTask.due_date || null,
        completed: false
      })

    if (error) {

      alert(`Erreur lors de la création de la tâche: ${error.message}`)
    } else {
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        due_date: '',
        estimated_time: ''
      })
      setShowAddForm(false)
      loadTasks()
    }
    setIsCreating(false)
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId)

    if (error) {

    } else {
      loadTasks()
    }
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {

    } else {
      loadTasks()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 Haute'
      case 'medium': return '🟠 Moyenne'
      case 'low': return '🟢 Basse'
      default: return 'Moyenne'
    }
  }


  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Mes Tâches</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {pendingTasks.length} en cours, {completedTasks.length} terminées
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nouvelle tâche</h3>
          <form onSubmit={addTask} className="space-y-4">
            <Input
              label="Titre"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Titre de la tâche"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description (optionnel)"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <Input
                label="Catégorie"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                placeholder="Études, Personnel..."
              />

              <Input
                label="Échéance"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={isCreating}
              >
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto"
                disabled={isCreating}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">En cours</h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className="mt-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <CheckSquare className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          {task.category && (
                            <span className="flex items-center">
                              <Flag className="w-3 h-3 mr-1" />
                              {task.category}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Terminées</h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card key={task.id} className="opacity-75 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className="mt-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Check className="w-5 h-5 text-green-500" />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate line-through">
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 line-through">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          {task.category && (
                            <span className="flex items-center">
                              <Flag className="w-3 h-3 mr-1" />
                              {task.category}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune tâche</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer votre première tâche
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une tâche
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
