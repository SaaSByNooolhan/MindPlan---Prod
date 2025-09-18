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
    // Mode développement : simuler la création de session
    console.log('Mode développement : Simulation de la création de session Stripe')
    console.log('Price ID:', priceId)
    console.log('User ID:', userId)
    console.log('User Email:', userEmail)
    return 'cs_test_simulation'
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
      // Mode développement : simuler l'upgrade
      console.log('Mode développement : Simulation de l\'upgrade Premium')
      alert('Mode développement : Upgrade Premium simulé !\n\nEn production, vous seriez redirigé vers Stripe.')
      return
    }

    // Mode développement : simuler l'upgrade sans Stripe
    console.log('Mode développement : Simulation de l\'upgrade Premium')
    console.log('Price ID:', priceId)
    console.log('User ID:', userId)
    console.log('User Email:', userEmail)
    
    alert('Mode développement : Upgrade Premium simulé !\n\nEn production, vous seriez redirigé vers Stripe Checkout.')
    return

    // Code pour la production (commenté pour le développement)
    /*
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
    */
  } catch (error) {
    console.error('Erreur redirectToCheckout:', error)
    throw error
  }
}

// Fonction pour créer un portail client Stripe
export const createCustomerPortalSession = async (userId: string) => {
  try {
    // Mode développement : simuler l'accès au portail
    console.log('Mode développement : Simulation du portail client')
    alert('Mode développement : Portail client simulé !\n\nEn production, vous seriez redirigé vers le portail Stripe.')
    return `${window.location.origin}/dashboard`
  } catch (error) {
    console.error('Erreur createCustomerPortalSession:', error)
    throw error
  }
}
