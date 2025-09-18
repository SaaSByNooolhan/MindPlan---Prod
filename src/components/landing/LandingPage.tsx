import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  Timer, 
  Menu,
  X,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { VideoModal } from '../ui/VideoModal'
import { LiveDashboard } from './LiveDashboard'
import { InteractiveDemo } from './InteractiveDemo'
import { useSubscription } from '../../hooks/useSubscription'

interface LandingPageProps {
  onNavigateToAuth: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isInteractiveDemoOpen, setIsInteractiveDemoOpen] = useState(false)
  const { startFreeTrial } = useSubscription()

  const handleUpgrade = async () => {
    try {
      console.log('Bouton Premium cliqué depuis la landing page')
      const result = await startFreeTrial()
      
      if (result?.error === 'User not authenticated') {
        // Rediriger vers l'inscription avec un paramètre Premium
        alert('Inscription Premium ! Créez votre compte et démarrez votre essai gratuit de 7 jours.')
        onNavigateToAuth()
        return
      }
      
      if (result?.error) {
        alert('Erreur lors du démarrage de l\'essai. Veuillez réessayer.')
        return
      }
    } catch (error) {
      console.error('Error starting free trial:', error)
      alert('Erreur lors du démarrage de l\'essai. Veuillez vous connecter d\'abord.')
      onNavigateToAuth()
    }
  }

  const handlePremiumSignup = () => {
    // Marquer que l'utilisateur veut s'inscrire en Premium
    localStorage.setItem('wantsPremium', 'true')
    localStorage.setItem('forceSignup', 'true') // Forcer l'inscription
    alert('Inscription Premium ! Créez votre compte et démarrez votre essai gratuit de 7 jours.')
    onNavigateToAuth()
  }

  const handleFreeSignup = () => {
    // Forcer l'inscription pour le plan Freemium
    localStorage.setItem('forceSignup', 'true')
    onNavigateToAuth()
  }

  const handleShowDemo = () => {
    setIsInteractiveDemoOpen(true)
  }

  const handleDemoSignup = () => {
    setIsInteractiveDemoOpen(false)
    // Forcer l'inscription depuis la démo
    localStorage.setItem('forceSignup', 'true')
    localStorage.setItem('fromDemo', 'true')
    onNavigateToAuth()
  }

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard Intuitif',
      description: 'Vue d\'ensemble complète de vos activités académiques et personnelles en un coup d\'œil.'
    },
    {
      icon: CheckSquare,
      title: 'Gestion des Tâches',
      description: 'Organisez vos devoirs, projets et révisions avec un système de priorités intelligent.'
    },
    {
      icon: Calendar,
      title: 'Agenda Intelligent',
      description: 'Planifiez vos cours, examens et événements avec des rappels automatiques.'
    },
    {
      icon: DollarSign,
      title: 'Suivi Financier',
      description: 'Gérez votre budget étudiant et suivez vos dépenses pour une meilleure maîtrise financière.'
    },
    {
      icon: Timer,
      title: 'Pomodoro Timer',
      description: 'Optimisez votre concentration avec des sessions de travail structurées et des pauses régulières. Personnalisez vos durées en Premium !'
    }
  ]

  const pricingPlans = [
    {
      name: 'Freemium',
      price: '0€',
      period: '/mois',
      features: [
        'Dashboard intuitif',
        '5 tâches maximum',
        '5 événements agenda',
        'Stats financières de base',
        '5 transactions maximum',
        '1h Pomodoro par mois'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '9.99€',
      period: '/mois',
      features: [
        'Toutes les fonctionnalités',
        'Tâches illimitées',
        'Événements illimités',
        'Analytics financières avancées',
        'Transactions illimitées',
        'Pomodoro illimité',
        'Personnalisation des durées Pomodoro',
        'Essai gratuit 7 jours',
        'Support prioritaire'
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
              <h1 className="text-2xl font-bold text-black dark:text-white">MindPlan</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                Tarifs
              </a>
              <Button 
                variant="outline" 
                onClick={onNavigateToAuth}
                className="mr-2"
              >
                Connexion
              </Button>
              <Button onClick={handleFreeSignup}>
                Essayer gratuitement
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
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
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a 
                href="#pricing" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tarifs
              </a>
              <div className="px-3 py-2 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={onNavigateToAuth}
                  className="w-full"
                >
                  Connexion
                </Button>
                <Button onClick={handleFreeSignup} className="w-full">
                  Essayer gratuitement
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-6">
              Organisez votre vie étudiante avec{' '}
              <span className="text-purple-600 dark:text-purple-400">MindPlan</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              La plateforme tout-en-un pour gérer vos tâches, finances, planning et optimiser votre productivité académique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleFreeSignup} className="text-lg px-8 py-4">
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
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
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
              Dashboard Intuitif et Moderne
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Une interface épurée et moderne pour une productivité maximale
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
                Vue d'ensemble en temps réel
              </span>
              <span className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
                Design responsive et accessible
              </span>
              <span className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
                Mode sombre/clair
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
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
              Fonctionnalités Complètes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Un écosystème complet pour optimiser votre vie étudiante
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Version Gratuite</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Dashboard, 5 tâches, 5 événements, stats de base, 5 transactions, 1h Pomodoro/mois
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Version Premium</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Accès illimité à toutes les fonctionnalités avancées
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
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

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-600 dark:bg-purple-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-purple-200">Étudiants actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-purple-200">Satisfaction client</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-purple-200">Support disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
              Tarifs Simples et Transparents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Commencez gratuitement, passez à Premium quand vous êtes prêt
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                🎉 Essai Premium gratuit de 7 jours - Aucune carte de crédit requise
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {plan.price}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={plan.name === 'Premium' ? handlePremiumSignup : handleFreeSignup}
                  className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  variant={plan.popular ? 'primary' : 'outline'}
                >
                  {plan.name === 'Freemium' ? 'Commencer gratuitement' : 'Essai Premium 7 jours'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
            Prêt à transformer votre vie étudiante ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Rejoignez des milliers d'étudiants qui ont déjà amélioré leur productivité avec MindPlan
          </p>
          <Button size="lg" onClick={handleFreeSignup} className="text-lg px-8 py-4">
            Commencer maintenant
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black dark:bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">MindPlan</h3>
            <p className="text-gray-400 text-lg">
              La plateforme tout-en-un pour les étudiants modernes.
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
