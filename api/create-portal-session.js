// Route API pour créer une session du portail client Stripe
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
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' })
    }

    // Récupérer le customer Stripe
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Créer la session du portail
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/dashboard`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
