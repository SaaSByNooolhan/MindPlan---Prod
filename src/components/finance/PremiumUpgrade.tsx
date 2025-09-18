import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { BarChart3, PieChart, TrendingUp, Zap, Crown, CreditCard } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { STRIPE_PRICES } from '../../lib/stripe'

export const PremiumUpgrade: React.FC = () => {
  const { upgradeToPremium } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const { error } = await upgradeToPremium()
      if (error) {
        console.error('Error upgrading to premium:', error)
        alert('Erreur lors de l\'upgrade. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error)
      alert('Erreur lors de l\'upgrade. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const premiumFeatures = [
    {
      icon: BarChart3,
      title: 'Graphiques avancés',
      description: 'Camemberts, barres, lignes et graphiques composés'
    },
    {
      icon: PieChart,
      title: 'Analyses détaillées',
      description: 'Répartition par catégorie et période personnalisée'
    },
    {
      icon: TrendingUp,
      title: 'Tendances',
      description: 'Suivi de l\'évolution de vos finances dans le temps'
    },
    {
      icon: Zap,
      title: 'Export de données',
      description: 'Exportez vos données pour analyse externe'
    }
  ]

  return (
    <Card>
      <div className="text-center p-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Débloquez les statistiques avancées
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Passez à Premium pour accéder à des analyses financières détaillées
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Prix Mensuel */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(STRIPE_PRICES.premium_monthly.amount / 100).toFixed(2)}€
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                /mois
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Annulez à tout moment • Accès immédiat
            </p>
          </div>
        </div>

        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isLoading ? 'Redirection...' : 'Passer à Premium'}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          * Paiement sécurisé • Support 24/7 inclus
        </p>
      </div>
    </Card>
  )
}
