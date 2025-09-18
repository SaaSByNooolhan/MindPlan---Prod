// Webhook Stripe pour gérer les événements d'abonnement
// À déployer sur Vercel, Netlify Functions, ou votre serveur backend

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
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

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId
  const subscriptionId = session.subscription

  if (!userId || !subscriptionId) {
    console.error('Missing userId or subscriptionId in session')
    return
  }

  // Récupérer les détails de l'abonnement
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0].price.id

  // Déterminer le type de plan
  const planType = priceId.includes('yearly') ? 'premium' : 'premium'

  // Créer ou mettre à jour l'abonnement dans Supabase
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

  console.log(`Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  // Mettre à jour l'abonnement dans Supabase
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription updated for user ${userId}`)
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  // Marquer l'abonnement comme annulé dans Supabase
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription cancelled for user ${userId}`)
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription

  if (!subscriptionId) {
    console.error('Missing subscriptionId in invoice')
    return
  }

  // Récupérer l'abonnement pour obtenir l'userId
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  // Mettre à jour le statut de l'abonnement
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Payment succeeded for user ${userId}`)
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription

  if (!subscriptionId) {
    console.error('Missing subscriptionId in invoice')
    return
  }

  // Récupérer l'abonnement pour obtenir l'userId
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  // Mettre à jour le statut de l'abonnement
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Payment failed for user ${userId}`)
}
