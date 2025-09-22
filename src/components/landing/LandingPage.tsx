import React, { useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  CreditCard,
  PiggyBank,
  Calculator,
  Target
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { VideoModal } from '../ui/VideoModal'
import { LiveDashboard } from './LiveDashboard'
import { InteractiveDemo } from './InteractiveDemo'
import { useSubscription } from '../../hooks/useSubscription'
import { redirectToCheckout } from '../../lib/stripe'

interface LandingPageProps {
  onNavigateToAuth: (mode?: 'login' | 'signup') => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isInteractiveDemoOpen, setIsInteractiveDemoOpen] = useState(false)
  const { upgradeToPremium } = useSubscription()
  const [isPremiumLoading, setIsPremiumLoading] = useState(false)

  const handleStartTrial = async () => {
    setIsPremiumLoading(true)
    try {
      // Marquer que l'utilisateur veut l'essai premium
      localStorage.setItem('wantsPremium', 'true')
      localStorage.setItem('isNewSignup', 'true')
      
      // Rediriger vers l'inscription
      onNavigateToAuth('signup')
    } catch (error) {
      alert('Erreur lors du démarrage de l\'essai. Veuillez réessayer.')
    } finally {
      setIsPremiumLoading(false)
    }
  }

  const handleFreeSignup = () => {
    // Nettoyer les flags et aller à l'inscription
    localStorage.removeItem('forceSignup')
    localStorage.removeItem('fromDemo')
    onNavigateToAuth('signup')
  }

  const handleShowDemo = () => {
    setIsInteractiveDemoOpen(true)
  }

  const handleDemoSignup = () => {
    setIsInteractiveDemoOpen(false)
    // Nettoyer les flags et aller à l'inscription
    localStorage.removeItem('forceSignup')
    localStorage.removeItem('fromDemo')
    onNavigateToAuth('signup')
  }

  const features = [
    {
      icon: DollarSign,
      title: 'Suivi des Dépenses',
      description: 'Enregistrez et catégorisez toutes vos dépenses pour une vue d\'ensemble claire de vos finances.'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avancées',
      description: 'Graphiques et statistiques détaillées pour comprendre vos habitudes de consommation.'
    },
    {
      icon: PieChart,
      title: 'Budget Intelligent',
      description: 'Créez et suivez vos budgets par catégorie avec des alertes automatiques.'
    },
    {
      icon: BarChart3,
      title: 'Rapports Détaillés',
      description: 'Générez des rapports mensuels et annuels pour analyser vos tendances financières.'
    },
    {
      icon: CreditCard,
      title: 'Gestion Multi-Comptes',
      description: 'Suivez plusieurs comptes bancaires, cartes de crédit et portefeuilles en un seul endroit.'
    },
    {
      icon: Target,
      title: 'Objectifs Financiers',
      description: 'Définissez et suivez vos objectifs d\'épargne avec des indicateurs de progression.'
    }
  ]

  const pricingPlans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      features: [
        'Suivi des dépenses de base',
        '10 transactions par mois',
        'Graphiques simples',
        '1 compte bancaire',
        'Objectifs financiers',
        'Export CSV'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '9.99€',
      period: '/mois',
      features: [
        'Transactions illimitées',
        'Analytics avancées',
        'Multi-comptes bancaires',
        'Budgets intelligents',
        'Rapports détaillés',
        'Objectifs financiers',
        'Export PDF/Excel',
        'Essai gratuit 7 jours'
      ],
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MindPlan</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Tarifs
              </a>
              <Button 
                variant="outline" 
                onClick={() => onNavigateToAuth('login')}
                className="mr-2"
              >
                Connexion
              </Button>
              <Button onClick={handleFreeSignup}>
                Commencer gratuitement
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="#features" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a 
                href="#pricing" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tarifs
              </a>
              <div className="px-3 py-2 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => onNavigateToAuth('login')}
                  className="w-full"
                >
                  Connexion
                </Button>
                <Button onClick={handleFreeSignup} className="w-full">
                  Commencer gratuitement
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Gérez vos finances avec{' '}
              <span className="text-blue-600 dark:text-blue-400">MindPlan</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              La plateforme de gestion financière personnelle qui vous aide à prendre le contrôle de votre argent, 
              suivre vos dépenses et atteindre vos objectifs financiers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartTrial} 
                disabled={isPremiumLoading}
                className="text-lg px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                {isPremiumLoading ? 'Chargement...' : 'Commencer votre essai gratuit'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={handleFreeSignup}>
                Version Gratuite
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={handleShowDemo}>
                Démo interactive
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Dashboard Financier Intuitif
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Une interface claire et moderne pour une gestion financière optimale
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                Vue d'ensemble en temps réel
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                Analytics avancées
              </span>
              <span className="flex items-center">
                <PieChart className="w-4 h-4 mr-2 text-emerald-500" />
                Graphiques interactifs
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleShowDemo}
              className="mb-4"
            >
              Essayer la démo interactive
            </Button>
          </div>
          
          <div className="relative">
            <LiveDashboard />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Financières Complètes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Tout ce dont vous avez besoin pour une gestion financière réussie
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Version Gratuite</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Suivi de base, 10 transactions/mois, graphiques simples, objectifs financiers, export CSV
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Version Premium</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Transactions illimitées, analytics avancées, multi-comptes, budgets intelligents
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tarifs Simples et Transparents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Commencez gratuitement, passez à Premium quand vous êtes prêt
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 p-4 rounded-lg max-w-2xl mx-auto border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Essai gratuit de 7 jours avec Stripe pour tester toutes les fonctionnalités Premium
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative border ${plan.popular ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {plan.price}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === 'Premium' ? (
                  <Button 
                    onClick={handleStartTrial}
                    disabled={isPremiumLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                  >
                    {isPremiumLoading ? 'Chargement...' : 'Commencer votre essai gratuit'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFreeSignup}
                    variant="outline"
                    className="w-full"
                  >
                    Commencer gratuitement
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Prêt à reprendre le contrôle de vos finances ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Rejoignez des milliers d'utilisateurs qui ont déjà amélioré leur situation financière avec MindPlan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleStartTrial} 
              disabled={isPremiumLoading}
              className="text-lg px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              {isPremiumLoading ? 'Chargement...' : 'Commencer votre essai gratuit'}
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleFreeSignup} className="text-lg px-8 py-4">
              Version Gratuite
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black dark:bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">MindPlan</h3>
            </div>
            <p className="text-gray-400 text-lg">
              La plateforme de gestion financière personnelle pour tous.
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8 text-gray-400">
            <p>&copy; 2025 MindPlan. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Interactive Demo Modal */}
      <InteractiveDemo
        isOpen={isInteractiveDemoOpen}
        onClose={() => setIsInteractiveDemoOpen(false)}
        onSignup={handleDemoSignup}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="Présentation de MindPlan"
        // Remplacez cette URL par votre vidéo de présentation
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
    </div>
  )
}
