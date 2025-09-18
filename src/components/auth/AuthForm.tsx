import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Crown } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useAuthContext } from '../../contexts/AuthContext'
import { useSubscription } from '../../hooks/useSubscription'

interface AuthFormProps {
  onBackToLanding?: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wantsPremium, setWantsPremium] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { startFreeTrial } = useSubscription()

  // Vérifier si l'utilisateur veut s'inscrire en Premium
  useEffect(() => {
    const wantsPremiumFlag = localStorage.getItem('wantsPremium')
    const forceSignupFlag = localStorage.getItem('forceSignup')
    
    if (wantsPremiumFlag === 'true') {
      setWantsPremium(true)
      setIsLogin(false) // Forcer l'inscription
      localStorage.removeItem('wantsPremium') // Nettoyer le flag
    }
    
    if (forceSignupFlag === 'true') {
      setIsLogin(false) // Forcer l'inscription
      localStorage.removeItem('forceSignup') // Nettoyer le flag
    }
  }, [])

  const { signIn, signUp } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      } else {
        const { error } = await signUp(formData.email, formData.password)
        if (error) throw error
        
        // Si l'utilisateur veut Premium, démarrer l'essai gratuit après l'inscription
        if (wantsPremium) {
          // Attendre que l'utilisateur soit complètement créé et connecté
          setTimeout(async () => {
            try {
              console.log('Démarrage de l\'essai Premium...')
              const result = await startFreeTrial()
              if (result?.error) {
                console.error('Erreur lors du démarrage de l\'essai Premium:', result.error)
                // Réessayer après 3 secondes supplémentaires
                setTimeout(async () => {
                  try {
                    const retryResult = await startFreeTrial()
                    if (retryResult?.error) {
                      console.error('Erreur lors du retry de l\'essai Premium:', retryResult.error)
                    } else {
                      console.log('Essai Premium démarré avec succès au retry !')
                    }
                  } catch (retryError) {
                    console.error('Erreur lors du retry de l\'essai Premium:', retryError)
                  }
                }, 3000)
              } else {
                console.log('Essai Premium démarré avec succès !')
              }
            } catch (error) {
              console.error('Erreur lors du démarrage de l\'essai Premium:', error)
            }
          }, 3000) // Augmenter à 3 secondes
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Back button */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la présentation
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
            MindPlan
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte étudiant'}
          </p>
          {!isLogin && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Mode inscription activé
            </p>
          )}
          {wantsPremium && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Inscription Premium
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Votre essai Premium gratuit de 7 jours démarrera automatiquement !
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </Card>
    </div>
  )
}