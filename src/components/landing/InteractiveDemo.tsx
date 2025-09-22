import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  PieChart,
  BarChart3,
  Plus,
  Save,
  X,
  ArrowRight,
  Crown,
  CreditCard,
  PiggyBank,
  Receipt
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
  const [newTransaction, setNewTransaction] = useState({ 
    title: '',
    amount: '', 
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  // Reset demo when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSection('dashboard')
      setShowSignupModal(false)
      setShowTransactionForm(false)
      setNewTransaction({ 
        title: '', 
        amount: '', 
        type: 'expense', 
        category: '', 
        date: new Date().toISOString().split('T')[0],
        description: ''
      })
    }
  }, [isOpen])

  const showSignupPrompt = (title: string, message: string) => {
    setSignupModalTitle(title)
    setSignupModalMessage(message)
    setShowSignupModal(true)
  }

  const handleCreateTransaction = () => {
    if (!newTransaction.title.trim() || !newTransaction.amount.trim()) return
    showSignupPrompt(
      'Enregistrer une transaction',
      'Parfait ! Vous avez saisi votre transaction financière. Créez votre compte MindPlan pour suivre vos finances et maîtriser votre budget.'
    )
  }

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: DollarSign },
    { id: 'transactions', name: 'Transactions', icon: Receipt },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'budgets', name: 'Budgets', icon: Target }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard Financier
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble de vos finances
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

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Solde Net
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                +1,247.50€
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              12 transactions ce mois
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              +15% vs mois dernier
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                +2,450€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ce mois
              </p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                -1,890€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ce mois
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                63%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1,890€ / 3,000€
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Épargne</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                560€
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ce mois
              </p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-full">
              <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Premium Upgrade Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Débloquez les analytics avancées
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Passez à Premium pour des analyses financières détaillées et des prévisions
              </p>
            </div>
          </div>
          <button 
            onClick={() => showSignupPrompt('Analytics Premium', 'Débloquez des graphiques avancés, des prévisions et des insights personnalisés pour optimiser vos finances.')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Voir les analytics
          </button>
        </div>
      </Card>
    </div>
  )

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes Transactions</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowTransactionForm(!showTransactionForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle transaction
        </Button>
      </div>

      {/* Transaction Form */}
      {showTransactionForm && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nouvelle transaction
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titre"
                value={newTransaction.title}
                onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                placeholder="Ex: Courses, Salaire..."
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  {newTransaction.type === 'expense' ? (
                    <>
                      <option value="Nourriture">Nourriture</option>
                      <option value="Transport">Transport</option>
                      <option value="Logement">Logement</option>
                      <option value="Loisirs">Loisirs</option>
                      <option value="Santé">Santé</option>
                      <option value="Études">Études</option>
                      <option value="Autres">Autres</option>
                    </>
                  ) : (
                    <>
                      <option value="Salaire">Salaire</option>
                      <option value="Bourse">Bourse</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investissement">Investissement</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                placeholder="Ajoutez des détails..."
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleCreateTransaction}
                className="w-full sm:w-auto"
                disabled={!newTransaction.title.trim() || !newTransaction.amount.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
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

      {/* Recent Transactions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transactions récentes</h3>
        <div className="space-y-3">
          {[
            { title: "Salaire", amount: "+2,450.00€", type: "income", category: "Salaire", date: "Aujourd'hui" },
            { title: "Courses alimentaires", amount: "-45.30€", type: "expense", category: "Nourriture", date: "Hier" },
            { title: "Transport", amount: "-12.50€", type: "expense", category: "Transport", date: "Hier" },
            { title: "Loyer", amount: "-800.00€", type: "expense", category: "Logement", date: "Il y a 2 jours" },
            { title: "Freelance", amount: "+300.00€", type: "income", category: "Freelance", date: "Il y a 3 jours" }
          ].map((transaction, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics Financières</h1>
        <p className="text-gray-600 dark:text-gray-400">Analysez vos habitudes financières</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Répartition des Dépenses</h2>
          </div>
          <div className="space-y-3">
            {[
              { category: "Logement", amount: "800€", percentage: 42, color: "bg-blue-500" },
              { category: "Nourriture", amount: "300€", percentage: 16, color: "bg-emerald-500" },
              { category: "Transport", amount: "150€", percentage: 8, color: "bg-yellow-500" },
              { category: "Loisirs", amount: "200€", percentage: 11, color: "bg-purple-500" },
              { category: "Autres", amount: "440€", percentage: 23, color: "bg-gray-500" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.amount}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tendances Mensuelles</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Revenus</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-4/5 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Dépenses</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-3/5 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">-8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Épargne</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-4/5 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">+23%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <Crown className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Analytics Avancées
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Débloquez des graphiques détaillés, des prévisions et des insights personnalisés
          </p>
          <Button 
            onClick={() => showSignupPrompt('Analytics Premium', 'Accédez à des analyses financières avancées avec des graphiques interactifs, des prévisions et des recommandations personnalisées.')}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            Débloquer Premium
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderBudgets = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Budgets</h1>
        <p className="text-gray-600 dark:text-gray-400">Contrôlez vos dépenses par catégorie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { category: "Nourriture", spent: 300, budget: 400, color: "bg-emerald-500" },
          { category: "Transport", spent: 150, budget: 200, color: "bg-blue-500" },
          { category: "Loisirs", spent: 200, budget: 150, color: "bg-red-500" },
          { category: "Santé", spent: 80, budget: 100, color: "bg-purple-500" }
        ].map((budget, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{budget.category}</h3>
              <span className={`text-sm font-medium ${
                budget.spent > budget.budget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {budget.spent > budget.budget ? 'Dépassé' : 'Dans le budget'}
              </span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>{budget.spent}€</span>
                <span>{budget.budget}€</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${budget.color}`}
                  style={{ width: `${Math.min((budget.spent / budget.budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {budget.spent > budget.budget 
                ? `Dépassement: ${budget.spent - budget.budget}€`
                : `Reste: ${budget.budget - budget.spent}€`
              }
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <Target className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Budgets Intelligents
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Créez des budgets personnalisés avec des alertes automatiques et des recommandations
          </p>
          <Button 
            onClick={() => showSignupPrompt('Budgets Premium', 'Créez des budgets intelligents avec des alertes personnalisées, des recommandations automatiques et un suivi en temps réel.')}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            Créer des budgets
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard()
      case 'transactions':
        return renderTransactions()
      case 'analytics':
        return renderAnalytics()
      case 'budgets':
        return renderBudgets()
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
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              Gestion Financière
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
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
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
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-lg py-3"
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
