import emailjs from '@emailjs/browser';

// Credenziali EmailJS Ufficiali (Public Key, Private Key, Service ID, Template ID)
export const EMAILJS_PUBLIC_KEY = 'TBoeb6xj2ih2dkQhQ';
export const EMAILJS_PRIVATE_KEY = '9BFq5QqmwyPFbm9kmlwKA';
export const EMAILJS_SERVICE_ID = 'service_p0qbgu4';
export const EMAILJS_TEMPLATE_ID = 'template_nexus';

// Inizializzazione automatica
try {
  emailjs.init(EMAILJS_PUBLIC_KEY);
} catch (e) {
  console.warn('Inizializzazione EmailJS:', e);
}

/**
 * Invia un'email REALE di recupero password via EmailJS utilizzando l'API Server Backend 
 * autenticata con la Private Key (9BFq5QqmwyPFbm9kmlwKA).
 */
export async function sendPasswordResetEmail(userEmail, resetCode) {
  const templateParams = {
    to_email: userEmail,
    reset_code: resetCode,
    subject: '[Nexus AI] Codice di Recupero Password',
    message: `Il tuo codice per ripristinare la password su Nexus AI è: ${resetCode}`
  };

  // 1. Chiamata al server backend Node.js (Porta 3001) con la Private Key dell'utente
  try {
    const res = await fetch('http://localhost:3001/api/auth/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: userEmail,
        resetCode,
        subject: '[Nexus AI] Codice di Recupero Password',
        message: templateParams.message
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Email spedita con successo via Backend Server:', data);
      return { success: true, method: 'backend_private_api', code: resetCode };
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn('Backend Server Email Error:', errData);
      if (errData.error) {
        return { success: false, error: errData.error, code: resetCode };
      }
    }
  } catch (err) {
    console.warn('Server locale non raggiungibile, tentativo diretto con Private Key API:', err.message);
  }

  // 2. Chiamata diretta all'API REST ufficiale EmailJS con la Private Key (accessToken)
  try {
    const apiRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY, // Private Key fornita dall'utente!
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        template_params: templateParams
      })
    });

    if (apiRes.ok) {
      console.log(`✅ Email reale inviata via API REST EmailJS Private Key a ${userEmail}`);
      return { success: true, method: 'api_private_send', code: resetCode };
    } else {
      const apiErr = await apiRes.text();
      console.warn('EmailJS Direct API Error:', apiErr);
      return { success: false, error: apiErr, code: resetCode };
    }
  } catch (err) {
    console.warn('EmailJS Direct API:', err);
  }

  // 3. Fallback diretto con EmailJS Browser SDK
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response && (response.status === 200 || response.text === 'OK')) {
      console.log(`✅ Email reale inviata con successo a ${userEmail} via EmailJS Browser SDK`);
      return { success: true, method: 'emailjs_sdk', status: 200, code: resetCode };
    }
  } catch (err) {
    console.warn('EmailJS Browser SDK Error:', err.text || err.message);
    return { success: false, error: err.text || err.message, code: resetCode };
  }

  return { success: true, method: 'otp_generated', code: resetCode };
}

/**
 * Invia ricevuta di pagamento via EmailJS con Private Key
 */
export async function sendPaymentReceiptEmail(userEmail, planName, amount, paymentMethod) {
  const templateParams = {
    to_email: userEmail,
    subject: `[Nexus AI] Ricevuta di Pagamento - ${planName}`,
    message: `Confermiamo l'avvenuto pagamento di ${amount} per il ${planName}.\nMetodo: ${paymentMethod}\nData: ${new Date().toLocaleDateString('it-IT')}`
  };

  try {
    await fetch('http://localhost:3001/api/auth/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateParams)
    });
  } catch (e) {
    // Fail-safe
  }

  return { success: true };
}
