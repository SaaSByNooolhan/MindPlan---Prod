import { useState, useEffect } from 'react'
import { supabase, Subscription } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { redirectToCheckout, createCustomerPortalSession, STRIPE_PRICES } from '../lib/stripe'

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
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error)
      }

      setSubscription(data)
    } catch (error) {
      console.error('Error in loadSubscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPremium = () => {
    if (!subscription) return false
    
    // Vérifier si c'est un abonnement Premium actif
    if (subscription.plan_type === 'premium' && subscription.status === 'active') {
      return true
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
      
      if (new Date() <= trialEnd) {
        return true // Essai encore valide
      } else {
        // Essai expiré, retourner en freemium
        handleTrialExpiration()
        return false
      }
    }
    
    return false
  }

  const handleTrialExpiration = async () => {
    if (!user || !subscription) return
    
    try {
      console.log('Trial expired, converting to freemium...')
      
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
        console.error('Error updating trial expiration:', error)
        // En cas d'erreur, recharger depuis la base
        await loadSubscription()
      } else {
        console.log('Successfully converted trial to freemium')
      }
    } catch (error) {
      console.error('Error in handleTrialExpiration:', error)
      // En cas d'erreur, recharger depuis la base
      await loadSubscription()
    }
  }

  const startFreeTrial = async () => {
    if (!user) return { error: 'User not authenticated' }

    try {
      console.log('Starting free trial for user:', user.id)
      
      // D'abord, vérifier s'il y a déjà un abonnement
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      
      if (existingSubscription) {
        console.log('Existing subscription found, updating to trial...')
        
        // Mettre à jour l'état local immédiatement
        setSubscription({
          ...existingSubscription,
          plan_type: 'premium',
          status: 'trial',
          trial_end: trialEnd
        })
        
        // Mettre à jour l'abonnement existant vers l'essai Premium en arrière-plan
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: 'premium',
            status: 'trial',
            trial_end: trialEnd
          })
          .eq('user_id', user.id)
          .eq('id', existingSubscription.id)

        if (error) {
          console.error('Error updating subscription to trial:', error)
          // En cas d'erreur, recharger depuis la base
          await loadSubscription()
          return { error: error.message }
        }
      } else {
        console.log('No existing subscription, creating new trial...')
        
        // Créer un nouvel essai gratuit de 7 jours
        const newSubscription = {
          user_id: user.id,
          plan_type: 'premium',
          status: 'trial',
          trial_end: trialEnd,
          created_at: new Date().toISOString()
        }
        
        // Mettre à jour l'état local immédiatement
        setSubscription(newSubscription as any)
        
        const { error } = await supabase
          .from('subscriptions')
          .insert(newSubscription)

        if (error) {
          console.error('Error creating free trial:', error)
          // En cas d'erreur, recharger depuis la base
          await loadSubscription()
          return { error: error.message }
        }
      }
      console.log('Free trial started successfully!')
      return { error: null }
    } catch (error) {
      console.error('Error in startFreeTrial:', error)
      return { error }
    }
  }

  const upgradeToPremium = async () => {
    if (!user) return { error: 'User not authenticated' }

    try {
      const priceId = STRIPE_PRICES.premium_monthly.id

      await redirectToCheckout(priceId, user.id, user.email || '')
      return { error: null }
    } catch (error) {
      console.error('Error in upgradeToPremium:', error)
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
      console.error('Error in manageSubscription:', error)
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

  const isTrialExpired = () => {
    return getTrialDaysLeft() <= 0
  }

  return {
    subscription,
    loading,
    isPremium,
    startFreeTrial,
    upgradeToPremium,
    manageSubscription,
    loadSubscription,
    getTrialDaysLeft,
    isTrialExpired
  }
}
