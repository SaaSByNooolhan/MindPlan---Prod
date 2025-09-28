import { useState, useEffect } from 'react'
import { supabase, Subscription } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { redirectToCheckout, redirectToCheckoutDirect, createCustomerPortalSession, STRIPE_PRICES } from '../lib/stripe'

export const useSubscription = () => {
  const { user } = useAuthContext()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return

    try {
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        // Si pas d'abonnement trouvé, créer un abonnement gratuit par défaut
        if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
          await createDefaultSubscription()
        }
        return
      }

      if (data && data.length > 0) {
        setSubscription(data[0])
      } else {
        // Aucun abonnement trouvé, créer un abonnement gratuit par défaut
        await createDefaultSubscription()
      }
    } catch (error) {
      // En cas d'erreur, créer un abonnement par défaut
      await createDefaultSubscription()
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour recharger l'abonnement après un paiement
  const refreshSubscription = async () => {
    setLoading(true)
    await loadSubscription()
  }

  const createDefaultSubscription = async () => {
    if (!user) return

    try {
      // Créer un abonnement gratuit par défaut (plus d'essai gratuit local)
      const subscriptionData = {
        user_id: user.id,
        plan_type: 'free',
        status: 'active'
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) {
        // Si l'erreur est due à une contrainte unique, essayer de récupérer l'abonnement existant
        if (error.code === '23505') {
          await loadSubscription()
        }
      } else {
        setSubscription(data)
      }
    } catch (error) {
      // Erreur silencieuse
    }
  }

  const isPremium = () => {
    if (!subscription) {
      return false
    }
    
    
    // Vérifier si c'est un abonnement freemium
    if (subscription.plan_type === 'free') {
      return false
    }
    
    // Vérifier si c'est un abonnement Premium actif
    if (subscription.plan_type === 'premium' && subscription.status === 'active') {
      return true
    }
    
    // Vérifier si c'est un testeur beta
    if (subscription.plan_type === 'premium' && subscription.status === 'beta') {
      // Vérifier si la période beta n'a pas expiré
      if (subscription.beta_end) {
        const betaEnd = new Date(subscription.beta_end)
        const now = new Date()
        if (now <= betaEnd) {
          return true // Période beta encore valide
        } else {
          // Période beta expirée, retourner en freemium
          handleBetaExpiration()
          return false
        }
      }
      return true // Si pas de date de fin définie, considérer comme valide
    }
    
    // Vérifier si c'est un essai gratuit
    if (subscription.plan_type === 'premium' && subscription.status === 'trial') {
      // Vérifier si l'essai n'a pas expiré
      let trialEnd: Date
      if (subscription.trial_end) {
        trialEnd = new Date(subscription.trial_end)
      } else {
        trialEnd = new Date(subscription.created_at)
        trialEnd.setDate(trialEnd.getDate() + 7) // 7 jours d'essai
      }
      
      const now = new Date()
      if (now <= trialEnd) {
        return true // Essai encore valide
      } else {
        // Essai expiré, retourner en freemium
        handleTrialExpiration()
        return false
      }
    }
    
    // Vérifier les autres statuts premium (past_due, etc.)
    if (subscription.plan_type === 'premium' && ['past_due', 'unpaid'].includes(subscription.status)) {
      // Même avec un problème de paiement, on peut laisser l'accès temporairement
      return true
    }
    
    // Par défaut, considérer comme freemium
    return false
  }

  const handleTrialExpiration = async () => {
    if (!user || !subscription) return
    
    try {
      
      // Mettre à jour l'état local immédiatement
      setSubscription(prev => prev ? {
        ...prev,
        plan_type: 'free',
        status: 'active',
        trial_end: null
      } : null)
      
      // Mettre à jour le statut vers freemium en arrière-plan
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          plan_type: 'free', 
          status: 'active',
          trial_end: null 
        })
        .eq('user_id', user.id)
        .eq('id', subscription.id)

      if (error) {
        // En cas d'erreur, recharger depuis la base
        await loadSubscription()
      }
    } catch (error) {
      // En cas d'erreur, recharger depuis la base
      await loadSubscription()
    }
  }

  const handleBetaExpiration = async () => {
    if (!user || !subscription) return
    
    try {
      
      // Mettre à jour l'état local immédiatement
      setSubscription(prev => prev ? {
        ...prev,
        plan_type: 'free',
        status: 'active',
        beta_end: null,
        is_beta_tester: false
      } : null)
      
      // Mettre à jour le statut vers freemium en arrière-plan
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          plan_type: 'free', 
          status: 'active',
          beta_end: null,
          is_beta_tester: false
        })
        .eq('user_id', user.id)
        .eq('id', subscription.id)

      if (error) {
        // En cas d'erreur, recharger depuis la base
        await loadSubscription()
      }
    } catch (error) {
      // En cas d'erreur, recharger depuis la base
      await loadSubscription()
    }
  }

  // Fonction supprimée - plus d'essai gratuit local, uniquement via Stripe

  const upgradeToPremium = async (skipTrial: boolean = false) => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const priceId = STRIPE_PRICES.premium_monthly.id

      if (skipTrial) {
        // Paiement direct sans essai gratuit
        await redirectToCheckoutDirect(priceId, user.id, user.email || '')
      } else {
        // Avec essai gratuit de 7 jours
        await redirectToCheckout(priceId, user.id, user.email || '')
      }
      return { error: null }
    } catch (error) {
      return { error: error.message || 'Erreur lors de l\'upgrade' }
    }
  }

  const manageSubscription = async () => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const portalUrl = await createCustomerPortalSession(user.id)
      window.location.href = portalUrl
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const getTrialDaysLeft = () => {
    if (!subscription || subscription.status !== 'trial') return 0
    
    // Si trial_end existe, l'utiliser directement, sinon calculer à partir de created_at
    let trialEnd: Date
    if (subscription.trial_end) {
      trialEnd = new Date(subscription.trial_end)
    } else {
      trialEnd = new Date(subscription.created_at)
      trialEnd.setDate(trialEnd.getDate() + 7) // 7 jours d'essai
    }
    
    const now = new Date()
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return Math.max(0, daysLeft)
  }

  const getBetaDaysLeft = () => {
    if (!subscription || subscription.status !== 'beta' || !subscription.beta_end) return 0
    
    const betaEnd = new Date(subscription.beta_end)
    const now = new Date()
    const daysLeft = Math.ceil((betaEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return Math.max(0, daysLeft)
  }

  const isTrialExpired = () => {
    return getTrialDaysLeft() <= 0
  }

  const isBetaExpired = () => {
    return getBetaDaysLeft() <= 0
  }

  const isBetaTester = () => {
    return subscription?.status === 'beta' && subscription?.is_beta_tester === true
  }

  return {
    subscription,
    loading,
    isPremium,
    upgradeToPremium,
    manageSubscription,
    loadSubscription,
    refreshSubscription,
    getTrialDaysLeft,
    isTrialExpired,
    getBetaDaysLeft,
    isBetaExpired,
    isBetaTester
  }
}
