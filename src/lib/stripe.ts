import { loadStripe, Stripe } from '@stripe/stripe-js'

// Configuration Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Mode développement : utiliser une clé de test par défaut si non définie
if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not defined. Using test key.')
  // Clé de test Stripe publique (sécurisée pour le frontend)
  const testKey = 'pk_test_51234567890abcdef'
  if (testKey) {
    // En mode développement, on peut continuer sans Stripe
    console.log('Stripe non configuré - mode développement')
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
    id: 'price_1S5EWfQYDIbMKdHDvz4q1JhS', // ✅ Votre vrai price_id mensuel
    amount: 999, // 9.99€ en centimes
    currency: 'eur',
    interval: 'month' as const,
    product: {
      name: 'MindPlan Premium',
      description: 'Accès complet à toutes les fonctionnalités'
    }
  }
}

// Fonction pour créer une session de paiement
export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    // Mode production : créer une vraie session Stripe
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
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error('Erreur createCheckoutSession:', error)
    throw error
  }
}

// Fonction pour rediriger vers Stripe Checkout
export const redirectToCheckout = async (
  priceId: string,
  userId: string,
  userEmail: string
) => {
  try {
    const stripe = await getStripe()
    if (!stripe) {
      console.error('Stripe not initialized')
      throw new Error('Stripe not available')
    }

    // Mode production : redirection vers Stripe Checkout
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
    console.error('Erreur redirectToCheckout:', error)
    throw error
  }
}

// Fonction pour créer un portail client Stripe
export const createCustomerPortalSession = async (userId: string) => {
  try {
    // Redirection directe vers le portail client Stripe
    const portalUrl = 'https://billing.stripe.com/p/login/3cI5kF3PQ6mn6VT0cH7N600'
    
    // Rediriger directement vers le portail
    window.location.href = portalUrl
    
    return portalUrl
  } catch (error) {
    console.error('Erreur createCustomerPortalSession:', error)
    throw error
  }
}
