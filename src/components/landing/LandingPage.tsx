import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { VideoModal } from '../ui/VideoModal'
import { LiveDashboard } from './LiveDashboard'

// Import des icônes depuis lucide-react
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Menu, 
  X, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Zap, 
  Target, 
  Calendar, 
  Clock 
} from 'lucide-react'

interface LandingPageProps {
  onNavigateToAuth: (mode?: 'login' | 'signup') => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const handleStartFree = () => {
    onNavigateToAuth('signup')
  }


  const features = [
    {
      icon: DollarSign,
      title: 'Gestion Financière Complète',
      description: 'Suivez toutes vos dépenses et revenus avec des catégories personnalisables et des analyses détaillées.'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avancées',
      description: 'Graphiques interactifs, tendances et statistiques pour comprendre vos habitudes financières.'
    },
    {
      icon: PieChart,
      title: 'Budgets Intelligents',
      description: 'Créez des budgets par catégorie avec alertes automatiques et suivi en temps réel.'
    },
    {
      icon: BarChart3,
      title: 'Rapports Détaillés',
      description: 'Générez des rapports PDF et Excel pour analyser vos finances sur toutes les périodes.'
    },
    {
      icon: Target,
      title: 'Objectifs Financiers',
      description: 'Définissez et suivez vos objectifs d\'épargne avec des indicateurs de progression visuels.'
    },
    {
      icon: Calendar,
      title: 'Calendrier Intégré',
      description: 'Planifiez vos événements et rendez-vous avec un calendrier moderne et intuitif.'
    },
    {
      icon: Clock,
      title: 'Technique Pomodoro',
      description: 'Optimisez votre productivité avec un timer Pomodoro personnalisable et des statistiques.'
    },
    {
      icon: CheckCircle,
      title: 'Gestion des Tâches',
      description: 'Organisez vos tâches par priorité et catégorie pour une meilleure productivité.'
    }
  ]

  const stats = [
    { number: '100%', label: 'Gratuit' },
    { number: '∞', label: 'Transactions' },
    { number: 'Toutes', label: 'Fonctionnalités' },
    { number: '0€', label: 'Par mois' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">MindPlan</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Fonctionnalités</a>
              <Button 
                onClick={() => onNavigateToAuth('login')} 
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                Connexion
              </Button>
              <Button onClick={handleStartFree} className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                Commencer Gratuitement
              </Button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Fonctionnalités</a>
              <Button 
                onClick={() => onNavigateToAuth('login')} 
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600"
              >
                Connexion
              </Button>
              <Button onClick={handleStartFree} className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                Commencer Gratuitement
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              100% Gratuit - Aucun Paiement Requis
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Gérez vos finances avec{' '}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                MindPlan
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              L'application de gestion personnelle complète et 100% gratuite. 
              Suivez vos finances, organisez vos tâches, planifiez votre temps et atteignez vos objectifs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={handleStartFree} 
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 w-full sm:w-auto"
              >
                Commencer Gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Toutes les fonctionnalités incluses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Profitez de toutes les fonctionnalités premium sans aucune limitation. 
              Aucun paiement, aucun abonnement, tout est gratuit !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi MindPlan est-il 100% gratuit ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Nous croyons que la gestion financière personnelle devrait être accessible à tous, 
              sans barrières financières. C'est pourquoi MindPlan est entièrement gratuit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Accessible à Tous
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nous voulons que chaque personne puisse améliorer sa situation financière, 
                peu importe ses moyens.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Innovation Continue
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Notre passion est de créer les meilleurs outils de gestion personnelle, 
                pas de maximiser les profits.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Transparence Totale
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucune surprise, aucun paiement caché. Ce que vous voyez est ce que vous obtenez, 
                gratuitement et pour toujours.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Essayez MindPlan maintenant
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités avec notre démo interactive. 
              Aucune inscription requise pour tester !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Interface moderne et intuitive
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Dashboard personnalisé</h4>
                    <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de vos finances en un coup d'œil</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Analytics avancées</h4>
                    <p className="text-gray-600 dark:text-gray-400">Graphiques interactifs et analyses détaillées</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Gestion complète</h4>
                    <p className="text-gray-600 dark:text-gray-400">Finances, tâches, calendrier et productivité</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleStartFree}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                >
                  Commencer Gratuitement
                </Button>
              </div>
            </div>

            <div className="relative">
              <LiveDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prêt à prendre le contrôle de vos finances ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui ont déjà amélioré leur situation financière avec MindPlan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleStartFree} 
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100"
            >
              Commencer Gratuitement
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              onClick={handleStartFree} 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
            >
              Version Gratuite
            </Button>
          </div>
          
          <p className="text-blue-100 text-sm mt-6">
            ✅ Aucune carte de crédit requise • ✅ Aucun abonnement • ✅ 100% gratuit pour toujours
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Brand Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">MP</span>
                  </div>
                  <span className="ml-3 text-2xl font-bold">MindPlan</span>
                </div>
                <p className="text-gray-400 text-lg mb-6 max-w-md">
                  L'application de gestion personnelle qui vous aide à organiser vos finances, 
                  vos tâches et votre temps en toute simplicité.
                </p>
              </div>

              {/* Product Section */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Produit</h3>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <a href="#features" className="hover:text-white transition-colors cursor-pointer">
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <button onClick={handleStartFree} className="hover:text-white transition-colors cursor-pointer">
                      Gratuit
                    </button>
                  </li>
                  <li>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2025 MindPlan. Tous droits réservés.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <span className="hover:text-white transition-colors cursor-pointer">Mentions légales</span>
                <span className="hover:text-white transition-colors cursor-pointer">Politique de confidentialité</span>
                <span className="hover:text-white transition-colors cursor-pointer">CGU</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Découvrez MindPlan"
      />

    </div>
  )
}