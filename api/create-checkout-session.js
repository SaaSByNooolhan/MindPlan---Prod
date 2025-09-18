// Route API pour créer une session de paiement Stripe
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

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body

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
    const session = await stripe.checkout.sessions.create({
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
    })

    res.status(200).json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
