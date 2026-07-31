import { useState } from 'react';
import Card from '../common/Card';
import { activateUserSubscription } from '../../services/accountStorage';
import { useTradingStore } from '../../store/useTradingStore';
import { processCardPayment, processPayPalPayment } from '../../services/paymentService';
import { sendPaymentReceiptEmail } from '../../services/emailService';

const SubscriptionModal = ({ isOpen, onClose, activeUser, isTrialExpired = true, onSubscriptionSuccess }) => {
  // Piani di Abbonamento nell'ordine esatto: 1. Mensile (€19.99), 2. Trimestrale (€49.99), 3. Annuale (€149.99)
  const plans = [
    {
      id: 'mensile',
      name: 'Piano Mensile',
      price: '€19.99',
      period: '/ mese',
      savings: null,
      badge: 'Flessibile',
      desc: 'Accesso completo alla suite di trading con rinnovo mensile.',
      stripeCheckoutUrl: 'https://checkout.stripe.com/c/pay/mensile_1999'
    },
    {
      id: 'trimestrale',
      name: 'Piano Trimestrale',
      price: '€49.99',
      period: '/ 3 mesi',
      savings: 'Risparmi il 16%',
      badge: 'Popolare',
      desc: 'Ideale per operare con continuità risparmiando sul prezzo mensile.',
      stripeCheckoutUrl: 'https://checkout.stripe.com/c/pay/trimestrale_4999'
    },
    {
      id: 'annuale',
      name: 'Piano Annuale',
      price: '€149.99',
      period: '/ anno',
      savings: 'Risparmi il 37%',
      badge: 'Miglior Valore',
      desc: 'Accesso illimitato per un intero anno al massimo del risparmio.',
      stripeCheckoutUrl: 'https://checkout.stripe.com/c/pay/annuale_14999'
    }
  ];

  const [selectedPlanId, setSelectedPlanId] = useState('trimestrale');
  const [paymentMethod, setPaymentMethod] = useState('carta'); // 'carta' | 'paypal'

  // Form Dati Carta di Credito / Debito (Stripe Engine)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  if (!isOpen) return null;

  const currentSelectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Esecuzione Pagamento Reale (Stripe & PayPal)
  const handleExecutePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      let result = null;

      if (paymentMethod === 'carta') {
        result = await processCardPayment({
          cardName,
          cardNumber,
          cardExpiry,
          cardCvc,
          amount: currentSelectedPlan.price,
          planName: currentSelectedPlan.name
        });
      } else {
        result = await processPayPalPayment({
          amount: currentSelectedPlan.price,
          planName: currentSelectedPlan.name
        });
      }

      if (result && result.success) {
        // Attiva l'abbonamento nel sistema multi-account isolato con data di scadenza reale
        const updatedUser = activateUserSubscription({
          plan: currentSelectedPlan.name,
          paymentMethod: result.paymentMethod
        });

        // Spedisce ricevuta reale via email
        if (activeUser?.email) {
          sendPaymentReceiptEmail(
            activeUser.email,
            currentSelectedPlan.name,
            currentSelectedPlan.price,
            result.paymentMethod
          );
        }

        setPaymentResult(result);
        setIsProcessing(false);

        // Invia notifica di sblocco alla campanella
        const state = useTradingStore.getState();
        useTradingStore.setState({
          notifications: [
            {
              id: Date.now(),
              type: 'NEXUS SYSTEM',
              message: `Abbonamento ${currentSelectedPlan.name} attivato con successo via ${result.paymentMethod}! Transazione ID: ${result.transactionId}`
            },
            ...(state.notifications || [])
          ]
        });

        setTimeout(() => {
          if (onSubscriptionSuccess) onSubscriptionSuccess(updatedUser);
          if (onClose && !isTrialExpired) onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Errore durante l\'elaborazione del pagamento Stripe.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8">
        <Card className="border-blue-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* HEADER LOCKOUT BANNER PAYWALL */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-5 relative">
            {!isTrialExpired && onClose && (
              <button
                onClick={onClose}
                className="absolute right-0 top-0 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold"
              >
                ✕
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {isTrialExpired ? '⚠️ Prova Gratuita di 5 Minuti Scaduta' : '⭐ Attiva Nexus AI Pro'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
              Sblocca l'Accesso Illimitato a <span className="text-blue-500">Nexus AI</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              {isTrialExpired
                ? `Ciao ${activeUser?.username || 'Utente'}, i tuoi 5 minuti di prova gratuita sono terminati. Scegli un piano di abbonamento per continuare ad operare sulla piattaforma.`
                : 'Scegli il piano ideale per sbloccare l\'assistente AI, i grafici TradingView e la Community Nexus.'}
            </p>
          </div>

          {/* MESSAGGIO DI SUCCESSIVO SBLOCCO */}
          {paymentResult ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-liquid-glow">
                ✓
              </div>
              <h3 className="text-lg font-bold text-emerald-300 font-outfit">
                Pagamento Stripe Confermato con Successo!
              </h3>
              <p className="text-xs text-slate-300">
                Transazione <strong>{paymentResult.transactionId}</strong> approvata via Stripe.<br />
                L'account <strong>{activeUser?.username}</strong> ha ora attivo il <strong>{currentSelectedPlan.name}</strong>.<br />
                Reindirizzamento all'Area di Lavoro in corso...
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* MESSAGGIO ERRORE PAGAMENTO */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* SELEZIONE DEI 3 PIANI DI ABBONAMENTO (MENSILE, TRIMESTRALE, ANNUALE) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-outfit">
                  1. Scegli il tuo Piano di Abbonamento
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/50 shadow-liquid-glow'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {plan.savings && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                            {plan.savings}
                          </span>
                        )}

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                            {plan.badge}
                          </span>
                          <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                          <p className="text-[11px] text-slate-400 leading-snug">{plan.desc}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <span className="text-xl font-black text-white font-outfit">{plan.price}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{plan.period}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELEZIONE METODO DI PAGAMENTO (CARTA DI CREDITO / DEBITO STRIPE VS PAYPAL) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit">
                  2. Seleziona il Metodo di Pagamento Sicuro
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('carta')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'carta'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-liquid-glow'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>💳 Carta (Stripe Engine)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-liquid-glow'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🅿️ PayPal Checkout</span>
                  </button>
                </div>

                {/* FORM METODO CARTA DI CREDITO / DEBITO (STRIPE ENGINE) */}
                {paymentMethod === 'carta' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Titolare della Carta</label>
                      <input
                        type="text"
                        placeholder="Nome e Cognome sulla Carta"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Numero Carta di Credito / Debito</label>
                      <input
                        type="text"
                        maxLength="19"
                        placeholder="4532 •••• •••• 8892"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Scadenza (MM/AA)</label>
                        <input
                          type="text"
                          placeholder="08/28"
                          maxLength="5"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Codice CVC / CVV</label>
                        <input
                          type="password"
                          maxLength="4"
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black font-outfit text-xs uppercase tracking-wider transition-all shadow-liquid-glow disabled:opacity-50 mt-2"
                    >
                      {isProcessing ? 'Elaborazione Pagamento Stripe Live...' : `Paga ${currentSelectedPlan.price} con Stripe & Sblocca`}
                    </button>
                  </div>
                )}

                {/* FORM METODO PAYPAL */}
                {paymentMethod === 'paypal' && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-center space-y-4">
                    <p className="text-slate-300">
                      Paga in modo sicuro con il tuo conto <strong>PayPal</strong> per il <strong>{currentSelectedPlan.name}</strong> ({currentSelectedPlan.price}).
                    </p>
                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-outfit text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>🅿️</span>
                      <span>{isProcessing ? 'Connessione a PayPal SDK...' : `Paga con PayPal (${currentSelectedPlan.price})`}</span>
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

        </Card>
      </div>
    </div>
  );
};

export default SubscriptionModal;
