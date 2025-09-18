import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  Timer,
  TrendingUp,
  Clock,
  Wallet,
  AlertTriangle,
  Crown,
  X,
  ArrowRight,
  Plus,
  Save,
  Trash2,
  Edit,
  Star,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface InteractiveDemoProps {
  isOpen: boolean
  onClose: () => void
  onSignup: () => void
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ isOpen, onClose, onSignup }) => {
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [signupModalTitle, setSignupModalTitle] = useState('')
  const [signupModalMessage, setSignupModalMessage] = useState('')
  
  // Form states
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    due_date: '',
    estimated_time: ''
  })
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    description: '', 
    category: 'Personnel',
    color: '#8B5CF6',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: ''
  })
  const [newTransaction, setNewTransaction] = useState({ 
    title: '',
    amount: '', 
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrence_interval: 1
  })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  // Reset demo when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSection('dashboard')
      setShowSignupModal(false)
      setShowTaskForm(false)
      setShowEventForm(false)
      setShowTransactionForm(false)
      setNewTask({ title: '', description: '', priority: 'medium', category: '', due_date: '', estimated_time: '' })
      setNewEvent({ title: '', description: '', category: 'Personnel', color: '#8B5CF6', start_date: '', start_time: '', end_date: '', end_time: '' })
      setNewTransaction({ title: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0], is_recurring: false, recurrence_type: 'monthly', recurrence_interval: 1 })
    }
  }, [isOpen])

  const showSignupPrompt = (title: string, message: string) => {
    setSignupModalTitle(title)
    setSignupModalMessage(message)
    setShowSignupModal(true)
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return
    showSignupPrompt(
      'Créer une tâche',
      'Vous venez de remplir le formulaire de création de tâche ! Créez votre compte pour sauvegarder vos tâches et organiser votre vie étudiante.'
    )
  }

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) return
    showSignupPrompt(
      'Ajouter un événement',
      'Parfait ! Vous avez rempli les détails de votre événement. Créez votre compte pour gérer votre agenda et ne plus rien oublier.'
    )
  }

  const handleCreateTransaction = () => {
    if (!newTransaction.title.trim() || !newTransaction.amount.trim()) return
    showSignupPrompt(
      'Enregistrer une transaction',
      'Excellent ! Vous avez saisi votre transaction. Créez votre compte pour suivre vos finances et maîtriser votre budget étudiant.'
    )
  }

  // Supprimé l'interactivité Pomodoro comme demandé

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', name: 'Tâches', icon: CheckSquare },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'calendar', name: 'Agenda', icon: Calendar },
    { id: 'pomodoro', name: 'Pomodoro', icon: Timer }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bonjour ! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Voici un résumé de votre semaine
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            14:32
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Lundi 20 janvier 2025
          </div>
        </div>
      </div>

      {/* Current Balance Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Solde Actuel
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                1,247.50€
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              12 transactions
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Basé sur toutes vos transactions
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tâches</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                8/12
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                67% complétées
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <CheckSquare className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget semaine</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                156€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                62% utilisé
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pomodoros</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                6
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aujourd'hui
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <Clock className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Événements</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                4
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cette semaine
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Premium Upgrade Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Débloquez les statistiques avancées
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Passez à Premium pour des analyses financières détaillées
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-colors">
            Voir les statistiques
          </button>
        </div>
      </Card>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes Tâches</h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowTaskForm(!showTaskForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nouvelle tâche
          </h3>
          <div className="space-y-4">
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
                onClick={handleCreateTask}
                className="w-full sm:w-auto"
                disabled={!newTask.title.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Créer
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowTaskForm(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {[
          { title: "Réviser les cours de mathématiques", priority: "high", completed: false },
          { title: "Préparer la présentation projet", priority: "medium", completed: true },
          { title: "Faire les exercices de physique", priority: "low", completed: false },
          { title: "Rendre le devoir d'anglais", priority: "high", completed: false },
          { title: "Organiser les notes de cours", priority: "low", completed: true }
        ].map((task, index) => (
          <Card key={index} className={`p-4 ${task.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority === 'high' ? 'Priorité haute' : 
                     task.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderFinance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Suivi Financier</h1>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowTransactionForm(!showTransactionForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle transaction
        </Button>
      </div>

      {/* Transaction Form */}
      {showTransactionForm && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nouvelle transaction
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titre"
                value={newTransaction.title}
                onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                placeholder="Titre de la transaction"
                required
              />
              
              <Input
                label="Montant"
                type="number"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Récurrent
                </label>
                <select
                  value={newTransaction.is_recurring ? 'true' : 'false'}
                  onChange={(e) => setNewTransaction({ ...newTransaction, is_recurring: e.target.value === 'true' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  {newTransaction.type === 'expense' ? (
                    <>
                      <option value="Nourriture">Nourriture</option>
                      <option value="Transport">Transport</option>
                      <option value="Logement">Logement</option>
                      <option value="Loyer">Loyer</option>
                      <option value="Électricité">Électricité</option>
                      <option value="Internet">Internet</option>
                      <option value="Études">Études</option>
                      <option value="Loisirs">Loisirs</option>
                      <option value="Santé">Santé</option>
                      <option value="Vêtements">Vêtements</option>
                      <option value="Autres">Autres</option>
                    </>
                  ) : (
                    <>
                      <option value="Bourse">Bourse</option>
                      <option value="Travail">Travail</option>
                      <option value="Salaire">Salaire</option>
                      <option value="Parents">Parents</option>
                      <option value="Autres">Autres</option>
                    </>
                  )}
                </select>
              </div>

              <Input
                label="Date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleCreateTransaction}
                className="w-full sm:w-auto"
                disabled={!newTransaction.title.trim() || !newTransaction.amount.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowTransactionForm(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="text-center">
            <Wallet className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Solde Total</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">1,247.50€</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dépenses</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">-324.50€</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenus</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">+1,572.00€</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transactions récentes</h3>
        <div className="space-y-3">
          {[
            { description: "Bourse d'études", amount: "+500.00€", type: "income", date: "Aujourd'hui" },
            { description: "Courses alimentaires", amount: "-45.30€", type: "expense", date: "Hier" },
            { description: "Transport", amount: "-12.50€", type: "expense", date: "Hier" },
            { description: "Loyer", amount: "-400.00€", type: "expense", date: "Il y a 2 jours" }
          ].map((transaction, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.date}</p>
              </div>
              <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Agenda</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowEventForm(!showEventForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Event Form */}
      {showEventForm && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nouvel événement
          </h3>
          <div className="space-y-4">
            <Input
              label="Titre"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Titre de l'événement"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
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
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Travail">Travail</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Santé">Santé</option>
                  <option value="Famille">Famille</option>
                  <option value="Loisirs">Loisirs</option>
                  <option value="Rendez-vous">Rendez-vous</option>
                  <option value="Sport">Sport</option>
                  <option value="Administratif">Administratif</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {['#8B5CF6', '#14B8A6', '#F97316', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#6B7280'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newEvent.color === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-600'
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
                value={newEvent.start_date}
                onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                required
              />
              <Input
                label="Heure de début"
                type="time"
                value={newEvent.start_time}
                onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de fin"
                type="date"
                value={newEvent.end_date}
                onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                required
              />
              <Input
                label="Heure de fin"
                type="time"
                value={newEvent.end_time}
                onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleCreateEvent}
                className="w-full sm:w-auto"
                disabled={!newEvent.title.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Créer
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowEventForm(false)}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }, (_, i) => {
          const day = i - 6 + 1
          const isCurrentMonth = day > 0 && day <= 31
          const hasEvent = [15, 18, 22, 25].includes(day)
          
          return (
            <div 
              key={i} 
              className={`aspect-square p-2 text-center text-sm rounded-lg ${
                isCurrentMonth 
                  ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' 
                  : 'text-gray-400 dark:text-gray-600'
              } ${hasEvent ? 'bg-purple-100 dark:bg-purple-900/20' : ''}`}
            >
              {isCurrentMonth && day}
              {hasEvent && (
                <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mt-1"></div>
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Événements à venir</h3>
        <div className="space-y-3">
          {[
            { title: "Examen de mathématiques", date: "22 Jan", time: "09:00", type: "exam" },
            { title: "Rendu projet informatique", date: "25 Jan", time: "23:59", type: "deadline" },
            { title: "Réunion groupe projet", date: "18 Jan", time: "14:00", type: "meeting" }
          ].map((event, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                event.type === 'exam' ? 'bg-red-500' :
                event.type === 'deadline' ? 'bg-orange-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{event.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.date} à {event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderPomodoro = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Pomodoro Timer</h1>
        <p className="text-gray-600 dark:text-gray-400">Optimisez votre concentration</p>
      </div>

      <Card className="max-w-md mx-auto">
        <div className="text-center p-8">
          <div className="w-48 h-48 mx-auto mb-6 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * 0.3}`}
                className="text-purple-600 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">25:00</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Travail</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Démarrer
            </Button>
            <Button variant="outline" disabled>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="outline" disabled>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">6</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pomodoros aujourd'hui</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">2h 30min</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Temps de travail</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">4</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pauses prises</div>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard()
      case 'tasks':
        return renderTasks()
      case 'finance':
        return renderFinance()
      case 'calendar':
        return renderCalendar()
      case 'pomodoro':
        return renderPomodoro()
      default:
        return renderDashboard()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Démo Interactive MindPlan
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              ✨ Explorez librement
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      currentSection === section.id
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                )
              })}
            </div>

          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {signupModalTitle} ✨
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {signupModalMessage}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={onSignup}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-3"
              >
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                onClick={() => setShowSignupModal(false)}
                variant="outline"
                className="w-full"
              >
                Continuer à explorer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
