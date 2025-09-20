// Route API pour créer une session de paiement Stripe
// Version ES Modules pour Vercel

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl, withTrial = true } = req.body

    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // Créer ou récupérer le customer Stripe
    let customer
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profile?.stripe_customer_id) {
        customer = await stripe.customers.retrieve(profile.stripe_customer_id)
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId
          }
        })

        // Sauvegarder l'ID customer dans Supabase
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId)
      }
    } catch (error) {
      console.error('Error with customer:', error)
      return res.status(500).json({ error: 'Error creating customer' })
    }

    // Créer la session de checkout
    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    }

    // Ajouter l'essai gratuit seulement si demandé
    if (withTrial) {
      sessionConfig.subscription_data.trial_period_days = 7
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    res.status(200).json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
