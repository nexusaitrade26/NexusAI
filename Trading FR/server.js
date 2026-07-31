import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = 3001;

// Chiavi ed Identificativi Ufficiali EmailJS & Stripe forniti dall'utente
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_live_1TyvSo9zUK1CXzIeUTq2MhFP';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'TBoeb6xj2ih2dkQhQ';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '9BFq5QqmwyPFbm9kmlwKA';
const EMAILJS_SERVICE_ID = 'service_p0qbgu4';
const EMAILJS_TEMPLATE_ID = 'template_nexus';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

app.use(cors());
app.use(express.json());

// Endpoint di Health Check API Server
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nexus AI Real Backend API Server attivo' });
});

/**
 * 💳 ENDPOINT STRIPE REALE: Crea un PaymentIntent con la chiave segreta Stripe Live
 */
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, planName, currency = 'eur' } = req.body;

    let cents = 1999;
    if (amount) {
      const numeric = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
      if (!isNaN(numeric)) {
        cents = Math.round(numeric * 100);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cents,
      currency: currency.toLowerCase(),
      description: `Abbonamento Nexus AI PRO - ${planName || 'Piano Trading'}`,
      payment_method_types: ['card'],
      metadata: {
        planName: planName || 'Piano Pro',
        platform: 'Nexus AI Suite'
      }
    });

    console.log(`Stripe PaymentIntent creato con successo: ${paymentIntent.id}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });
  } catch (err) {
    console.error('Errore Stripe API Server:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📧 ENDPOINT EMAIL REALE: Invia email via EmailJS API Ufficiale AUTENTICATA CON PRIVATE KEY
 */
app.post('/api/auth/send-reset-email', async (req, res) => {
  try {
    const { to_email, resetCode, subject, message } = req.body;

    const emailPayload = {
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY, // Chiave Privata EmailJS Autenticata!
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      template_params: {
        to_email,
        reset_code: resetCode,
        subject: subject || '[Nexus AI] Codice di Recupero Password',
        message: message || `Il tuo codice di recupero è: ${resetCode}`
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    const responseText = await response.text();

    if (response.ok) {
      console.log(`✅ Email spedita con successo a ${to_email} via EmailJS Private Key!`);
      return res.json({ success: true, method: 'emailjs_private_api', text: responseText });
    }

    console.warn('Risposta EmailJS Server con Private Key:', responseText);
    res.status(400).json({ error: responseText, code: resetCode });
  } catch (err) {
    console.error('Errore Invio Email Server:', err.message);
    res.status(500).json({ error: err.message, code: req.body.resetCode });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Nexus AI API Backend Server in esecuzione su http://localhost:${PORT}`);
});
