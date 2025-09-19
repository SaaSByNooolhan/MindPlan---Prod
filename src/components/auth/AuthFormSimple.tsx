import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useAuthSimple } from '../../hooks/useAuthSimple'
import { useSubscription } from '../../hooks/useSubscription'
import { redirectToCheckout } from '../../lib/stripe'

interface AuthFormSimpleProps {
  onBackToLanding?: () => void
  initialMode?: 'login' | 'signup'
}

export const AuthFormSimple: React.FC<AuthFormSimpleProps> = ({ onBackToLanding, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wantsPremium, setWantsPremium] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Vérifier les flags Premium seulement
  useEffect(() => {
    const wantsPremiumFlag = localStorage.getItem('wantsPremium')
    
    if (wantsPremiumFlag === 'true') {
      setWantsPremium(true)
      // Ne pas supprimer wantsPremium ici, on le garde pour l'inscription
    }
  }, [])

  const { signIn, signUp, signInWithGoogle } = useAuthSimple()
  const { startFreeTrial } = useSubscription()

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Si l'utilisateur veut Premium, on le marque avant la connexion Google
      if (wantsPremium) {
        localStorage.setItem('wantsPremium', 'true')
        localStorage.setItem('isNewSignup', 'true')
      }

      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue avec Google')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        // Pour les connexions, nettoyer les flags et s'assurer qu'on va au dashboard
        localStorage.removeItem('wantsPremium')
        localStorage.removeItem('isNewSignup')
        
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Connexion réussie !')
        }
      } else {
        // Pour les nouvelles inscriptions, marquer comme nouvelle inscription
        localStorage.setItem('isNewSignup', 'true')
        
        const { data, error } = await signUp(formData.email, formData.password)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Inscription réussie ! Vérifiez votre email.')
          
          // Si l'utilisateur veut Premium, rediriger vers Stripe Checkout
          if (wantsPremium) {
            console.log('Utilisateur inscrit avec intention Premium - redirection vers Stripe Checkout')
            try {
              // Attendre un peu que l'utilisateur soit créé
              setTimeout(async () => {
                try {
                  await redirectToCheckout('price_1S5EWfQYDIbMKdHDvz4q1JhS', data.user?.id || '', formData.email)
                } catch (error) {
                  console.error('Erreur lors de la redirection vers Stripe:', error)
                  alert('Inscription réussie ! Vous pouvez maintenant vous abonner depuis les Paramètres.')
                }
              }, 2000)
            } catch (error) {
              console.error('Erreur lors de la redirection vers Stripe:', error)
            }
            // Nettoyer le flag
            localStorage.removeItem('wantsPremium')
          } else {
            // Si pas d'intention Premium, nettoyer le flag
            localStorage.removeItem('wantsPremium')
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
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
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
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

          {success && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {success}
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              ou continuer avec
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLogin ? 'Se connecter avec Google' : "S'inscrire avec Google"}
        </Button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </Card>
    </div>
  )
}

