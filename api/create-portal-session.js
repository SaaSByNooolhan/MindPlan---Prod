// Route API pour créer une session du portail client Stripe
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
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' })
    }

    console.log('Creating portal session for userId:', userId)

    // Vérifier les variables d'environnement
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not found')
      return res.status(500).json({ error: 'Stripe configuration error' })
    }

    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing')
      return res.status(500).json({ error: 'Database configuration error' })
    }

    // Récupérer le customer Stripe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return res.status(500).json({ error: 'Database error', details: profileError.message })
    }

    if (!profile?.stripe_customer_id) {
      console.error('No stripe_customer_id found for user:', userId)
      return res.status(400).json({ 
        error: 'No Stripe customer found', 
        message: 'Vous devez d\'abord créer un abonnement pour accéder au portail client. Veuillez vous abonner d\'abord.' 
      })
    }

    console.log('Found customer ID:', profile.stripe_customer_id)

    // Créer la session du portail
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.origin}/dashboard`,
    })

    console.log('Portal session created successfully')
    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      type: error.type || 'unknown'
    })
  }
}
