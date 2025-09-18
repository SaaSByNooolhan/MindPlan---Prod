// Webhook Stripe pour gérer les événements d'abonnement
// Version corrigée pour Vercel (ES Modules)

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Vérifier que les variables d'environnement sont présentes
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    // Construire l'événement Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    console.log(`Processing webhook event: ${event.type}`)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true, event: event.type })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    const userId = session.metadata?.userId
    const subscriptionId = session.subscription

    if (!userId || !subscriptionId) {
      console.error('Missing userId or subscriptionId in session:', { userId, subscriptionId })
      return
    }

    // Récupérer les détails de l'abonnement
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0]?.price?.id

    if (!priceId) {
      console.error('No price ID found in subscription')
      return
    }

    // Déterminer le type de plan
    const planType = 'premium' // Votre plan unique

    // Créer ou mettre à jour l'abonnement dans Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })

    if (error) {
      console.error('Error upserting subscription:', error)
      throw error
    }

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('Missing userId in subscription metadata')
      return
    }

    // Mettre à jour l'abonnement dans Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
      throw error
    }

    console.log(`Subscription updated for user ${userId}`)
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('Missing userId in subscription metadata')
      return
    }

    // Marquer l'abonnement comme annulé dans Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error cancelling subscription:', error)
      throw error
    }

    console.log(`Subscription cancelled for user ${userId}`)
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription

    if (!subscriptionId) {
      console.error('Missing subscriptionId in invoice')
      return
    }

    // Récupérer l'abonnement pour obtenir l'userId
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('Missing userId in subscription metadata')
      return
    }

    // Mettre à jour le statut de l'abonnement
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating payment status:', error)
      throw error
    }

    console.log(`Payment succeeded for user ${userId}`)
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error)
    throw error
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription

    if (!subscriptionId) {
      console.error('Missing subscriptionId in invoice')
      return
    }

    // Récupérer l'abonnement pour obtenir l'userId
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('Missing userId in subscription metadata')
      return
    }

    // Mettre à jour le statut de l'abonnement
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating payment failure status:', error)
      throw error
    }

    console.log(`Payment failed for user ${userId}`)
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error)
    throw error
  }
}
