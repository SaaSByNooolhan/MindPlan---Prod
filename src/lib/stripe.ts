import { loadStripe, Stripe } from '@stripe/stripe-js'

// Configuration Stripe
const stripePublishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY

// Mode développement : utiliser une clé de test par défaut si non définie
if (!stripePublishableKey) {
  // Clé de test Stripe publique (sécurisée pour le frontend)
  const testKey = 'pk_test_51234567890abcdef'
  if (testKey) {
    // En mode développement, on peut continuer sans Stripe
  }
}

// Initialiser Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    if (stripePublishableKey) {
      stripePromise = loadStripe(stripePublishableKey)
    } else {
      // En mode développement sans Stripe configuré
      stripePromise = Promise.resolve(null)
    }
  }
  return stripePromise
}

// Types pour les prix Stripe
export interface StripePrice {
  id: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  product: {
    name: string
    description: string
  }
}

// Configuration des prix Stripe - Mensuel uniquement
export const STRIPE_PRICES = {
  premium_monthly: {
    id: 'price_1S5EWfQYDIbMKdHDvz4q1JhS', // Votre vrai price_id mensuel
    amount: 999, // 9.99€ en centimes
    currency: 'eur',
    interval: 'month' as const,
    product: {
      name: 'MindPlan Premium',
      description: 'Accès complet à toutes les fonctionnalités'
    }
  }
}

// Fonction pour créer une session de paiement avec essai gratuit
export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    // Mode production : créer une vraie session Stripe avec essai gratuit
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl,
        cancelUrl,
        withTrial: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    throw error
  }
}

// Fonction pour créer une session de paiement sans essai gratuit (paiement direct)
export const createCheckoutSessionDirect = async (
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    // Mode production : créer une vraie session Stripe sans essai gratuit
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl,
        cancelUrl,
        withTrial: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    throw error
  }
}

// Fonction pour rediriger vers Stripe Checkout avec essai gratuit
export const redirectToCheckout = async (
  priceId: string,
  userId: string,
  userEmail: string
) => {
  try {
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe not available')
    }

    // Mode production : redirection vers Stripe Checkout avec essai gratuit
    const successUrl = `${window.location.origin}/dashboard?payment=success`
    const cancelUrl = `${window.location.origin}/dashboard?payment=cancelled`

    const sessionId = await createCheckoutSession(
      priceId,
      userId,
      userEmail,
      successUrl,
      cancelUrl
    )

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

// Fonction pour rediriger vers Stripe Checkout sans essai gratuit (paiement direct)
export const redirectToCheckoutDirect = async (
  priceId: string,
  userId: string,
  userEmail: string
) => {
  try {
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe not available')
    }

    // Mode production : redirection vers Stripe Checkout sans essai
    const successUrl = `${window.location.origin}/dashboard?payment=success`
    const cancelUrl = `${window.location.origin}/dashboard?payment=cancelled`

    const sessionId = await createCheckoutSessionDirect(
      priceId,
      userId,
      userEmail,
      successUrl,
      cancelUrl
    )

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

// Fonction pour créer un portail client Stripe
export const createCustomerPortalSession = async (userId: string) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create portal session')
    }

    const { url } = await response.json()
    return url
  } catch (error) {
    throw error
  }
}
