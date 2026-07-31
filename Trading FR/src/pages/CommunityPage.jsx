import { useState } from 'react';
import Card from '../components/common/Card';
import SectionHeader from '../components/common/SectionHeader';
import { useTradingStore } from '../store/useTradingStore';
import { useMarket } from '../context/MarketContext';
import { GENERATED_COMMUNITY_TRADERS } from '../data/communityTradersData';

const ALL_TRADINGVIEW_ASSETS = [
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar' },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar' },
  { symbol: 'NVDA', name: 'NVIDIA Corp' },
  { symbol: 'AAPL', name: 'Apple Inc' },
  { symbol: 'TSLA', name: 'Tesla Inc' },
  { symbol: 'AMZN', name: 'Amazon.com Inc' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
  { symbol: 'GOLD', name: 'Gold / Spot US Dollar' }
];

const CommunityNexusPage = () => {
  const [subTab, setSubTab] = useState('feed'); // 'feed' | 'copy_trading' | 'share'

  // Genera post iniziali prendendoli dalle 3 operazioni dei 50 trader
  const initialPostsFrom50Traders = GENERATED_COMMUNITY_TRADERS.flatMap((trader) =>
    trader.trades.map((trade, idx) => ({
      id: `post-${trader.id}-${idx}`,
      traderId: trader.id,
      author: trader.name,
      avatar: trader.avatar,
      isVerified: trader.isVerified,
      time: `${idx + 1 * 15} min fa`,
      text: trade.comment,
      trade: {
        asset: trade.asset,
        side: trade.side,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        currentPrice: trade.currentPrice,
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        isWin: true
      },
      likes: Math.floor(20 + Math.random() * 80),
      hasLiked: false,
      commentsCount: Math.floor(3 + Math.random() * 15),
      copiesCount: Math.floor(10 + Math.random() * 40)
    }))
  );

  const [posts, setPosts] = useState(initialPostsFrom50Traders);
  const [newPostText, setNewPostText] = useState('');

  // Modal Copia Posizione Singola Specifica dal Feed
  const [copySingleTradeModal, setCopySingleTradeModal] = useState(null);
  const [exactInvestedAmount, setExactInvestedAmount] = useState('50');

  // Stato Copy Trading Leaderboard (50 Trader Unici)
  const [traders, setTraders] = useState(GENERATED_COMMUNITY_TRADERS);

  // Stato Condivisione Posizioni Utente
  const userPositions = useTradingStore((state) => state.positions) || [];
  const userClosed = useTradingStore((state) => state.closedTrades) || [];
  const openOrder = useTradingStore((state) => state.openOrder);
  const { getLivePrice } = useMarket();

  const [selectedAssetOrTrade, setSelectedAssetOrTrade] = useState('BTC/USD');
  const [shareCommentary, setShareCommentary] = useState('');
  const [shareFeedback, setShareFeedback] = useState(false);

  // Gestione Like sui post
  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked,
            likes: hasLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  };

  // Pubblicazione di un nuovo post generico nel Feed
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPostObj = {
      id: `post-${Date.now()}`,
      author: 'Tu (Trader Nexus)',
      avatar: 'U',
      isVerified: true,
      time: 'Adesso',
      text: newPostText,
      trade: null,
      likes: 0,
      hasLiked: false,
      commentsCount: 0,
      copiesCount: 0
    };

    setPosts([newPostObj, ...posts]);
    setNewPostText('');
  };

  // Esecuzione reale del Copy Position con Capitale Preciso Investito ($50, $100, ecc.)
  const handleConfirmSingleCopy = (e) => {
    e.preventDefault();
    if (!copySingleTradeModal) return;

    const targetAsset = copySingleTradeModal.trade?.asset || 'BTC/USD';
    const side = copySingleTradeModal.trade?.side || 'BUY';
    const liveP = Number(getLivePrice(targetAsset)) || copySingleTradeModal.trade?.entryPrice || 100;
    
    const investedVal = parseFloat(exactInvestedAmount) || 50;
    const lotQuantity = parseFloat((investedVal / liveP).toFixed(4)) || 0.1;

    // Apri reale posizione a portafoglio
    openOrder(
      {
        asset: targetAsset,
        side,
        quantity: lotQuantity,
        type: 'market',
        stopLoss: side === 'BUY' ? liveP * 0.97 : liveP * 1.03,
        takeProfit: side === 'BUY' ? liveP * 1.05 : liveP * 0.95
      },
      liveP
    );

    // Invia notifica alla campanella notifiche
    useTradingStore.setState((state) => ({
      notifications: [
        {
          id: Date.now(),
          type: 'COPY TRADING',
          category: 'copyTrading',
          message: `Posizione di ${copySingleTradeModal.author} copiata con successo! Investito $${investedVal} su ${targetAsset} (${side}).`
        },
        ...(state.notifications || [])
      ]
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === copySingleTradeModal.id ? { ...p, copiesCount: p.copiesCount + 1 } : p))
    );

    setCopySingleTradeModal(null);
    alert(`Posizione copiata ed eseguita a portafoglio! Investito esattamente $${investedVal} su ${targetAsset} a $${liveP}.`);
  };

  // Attivazione Copy Trading Leaderboard
  const handleToggleLeaderboardCopy = (trader) => {
    const isAlreadyCopied = trader.isCopied;
    const newStatus = !isAlreadyCopied;

    setTraders((prev) =>
      prev.map((t) => (t.id === trader.id ? { ...t, isCopied: newStatus, copiers: newStatus ? t.copiers + 1 : t.copiers - 1 } : t))
    );

    if (newStatus) {
      useTradingStore.setState((state) => ({
        notifications: [
          {
            id: Date.now(),
            type: 'COPY TRADING',
            category: 'copyTrading',
            message: `Copy Trading Attivato su ${trader.name}! Le sue 3+ operazioni attive verranno modellate sul tuo conto.`
          },
          ...(state.notifications || [])
        ]
      }));
      alert(`Copy Trading attivato su ${trader.name}! Riceverai notifiche in diretta ad ogni sua operazione.`);
    }
  };

  // Condivisione di una posizione/trade reale dell'utente nel Social Feed
  const handleShareTradeReport = (e) => {
    e.preventDefault();

    let assetName = 'BTC/USD';
    let entryP = 64500;
    let sideVal = 'BUY';
    let qtyVal = 1.0;

    if (selectedAssetOrTrade.startsWith('pos-')) {
      const id = selectedAssetOrTrade.replace('pos-', '');
      const found = userPositions.find((p) => String(p.id) === String(id));
      if (found) {
        assetName = found.asset;
        entryP = found.entryPrice;
        sideVal = found.side;
        qtyVal = found.quantity;
      }
    } else if (selectedAssetOrTrade.startsWith('closed-')) {
      const id = selectedAssetOrTrade.replace('closed-', '');
      const found = userClosed.find((c) => String(c.id) === String(id));
      if (found) {
        assetName = found.asset;
        entryP = found.entryPrice;
        sideVal = found.side;
        qtyVal = found.quantity;
      }
    } else {
      assetName = selectedAssetOrTrade;
      entryP = getLivePrice(assetName) || 100;
    }

    const newPostObj = {
      id: `post-${Date.now()}`,
      author: 'Tu (Trader Nexus)',
      avatar: 'U',
      isVerified: true,
      time: 'Adesso',
      text: shareCommentary || `Ecco il mio report operativo su ${assetName} condiviso sulla Community Nexus AI!`,
      trade: {
        asset: assetName,
        side: sideVal,
        quantity: qtyVal,
        entryPrice: entryP,
        currentPrice: getLivePrice(assetName) || entryP,
        pnl: '+540.00',
        pnlPercent: '+14.2%',
        isWin: true
      },
      likes: 1,
      hasLiked: true,
      commentsCount: 0,
      copiesCount: 0
    };

    setPosts([newPostObj, ...posts]);
    setShareFeedback(true);
    setShareCommentary('');
    setTimeout(() => setShareFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <SectionHeader
        title="Community Nexus - Social & Copy Trading Hub"
        subtitle="Il social network istituzionale dei trader Nexus: 50 trader attivi con oltre 150 operazioni condivise, classifiche e Copy Trading."
      />

      {/* Banner Statistiche Community Nexus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-500/30 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
              Trader Attivi Verificati
            </span>
            <strong className="text-xl font-black font-mono text-slate-100">50 Trader (150+ Trade)</strong>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
            Live Nexus
          </span>
        </Card>

        <Card className="border-emerald-500/30 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
              Volume Posizioni Condivise
            </span>
            <strong className="text-xl font-black font-mono text-emerald-400">$8,450,000</strong>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            24h Volume
          </span>
        </Card>

        <Card className="border-purple-500/30 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-outfit">
              Tasso di Successo Copy Trading
            </span>
            <strong className="text-xl font-black font-mono text-purple-400">89.2% Win Rate</strong>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-300">
            Verified
          </span>
        </Card>
      </div>

      {/* Sub-Navigazione della Community Nexus */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('feed')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            subTab === 'feed'
              ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Feed Social & Trade ({posts.length} Operazioni)
        </button>

        <button
          onClick={() => setSubTab('copy_trading')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            subTab === 'copy_trading'
              ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Copy Trading Leaderboard (50 Trader)
        </button>

        <button
          onClick={() => setSubTab('share')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            subTab === 'share'
              ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Condividi la Tua Posizione / Report
        </button>
      </div>

      {/* ================= VISTA 1: FEED SOCIAL & TRADE SHARES ================= */}
      {subTab === 'feed' && (
        <div className="space-y-6 animate-fade-in">
          {/* Box Creazione Post Rapido */}
          <Card className="border-blue-500/30 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">
              Condividi un'analisi o una strategia con la Community Nexus
            </h4>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                rows="2"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Scrivi un aggiornamento sulle tue operazioni, idee di mercato o strategie..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-medium">Tutti i post vengono condivisi in diretta</span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-liquid-glow"
                >
                  Pubblica Post
                </button>
              </div>
            </form>
          </Card>

          {/* Elenco Post Social con Trade Embeddati */}
          <div className="space-y-4">
            {posts.slice(0, 30).map((post) => (
              <Card key={post.id} className="border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black font-outfit text-sm shadow-liquid-glow">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-bold text-slate-100">{post.author}</strong>
                        {post.isVerified && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold">
                            VERIFICATO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{post.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCopySingleTradeModal(post)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-liquid-glow"
                  >
                    Copia Posizione
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{post.text}</p>

                {post.trade && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Asset & Direzione</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <strong className="text-slate-100 font-bold">{post.trade.asset}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                          post.trade.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {post.trade.side}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Prezzo Ingresso</span>
                      <strong className="text-slate-200 mt-0.5 block">${post.trade.entryPrice}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Quantità Originale</span>
                      <strong className="text-blue-400 mt-0.5 block">{post.trade.quantity} Lotti</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">P&L Risultato</span>
                      <strong className="text-emerald-400 mt-0.5 block">
                        ${post.trade.pnl} ({post.trade.pnlPercent})
                      </strong>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 font-semibold transition-colors ${
                      post.hasLiked ? 'text-blue-400' : 'hover:text-slate-200'
                    }`}
                  >
                    <span>Mi piace ({post.likes})</span>
                  </button>

                  <span className="font-semibold text-slate-400">Commenti ({post.commentsCount})</span>

                  <span className="font-semibold text-blue-400 ml-auto">
                    {post.copiesCount} Trader hanno copiato questo trade
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================= VISTA 2: COPY TRADING LEADERBOARD (50 TRADER) ================= */}
      {subTab === 'copy_trading' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-blue-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                  Classifica 50 Top Trader & Copy Trading Automatico
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seleziona un trader per replicare automaticamente le sue 3+ operazioni nel tuo portafoglio.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
                50 Trader Verificati
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Rank & Trader</th>
                    <th className="pb-3">ROI Mensile</th>
                    <th className="pb-3">Win Rate</th>
                    <th className="pb-3">Operazioni Attive (3+)</th>
                    <th className="pb-3">Copier Attivi</th>
                    <th className="pb-3 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {traders.map((trader) => (
                    <tr key={trader.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-black font-outfit text-blue-400 flex items-center justify-center">
                            #{trader.rank}
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {trader.avatar}
                          </div>
                          <div>
                            <strong className="text-slate-100 font-bold block">{trader.name}</strong>
                            <span className="text-[10px] text-slate-400 font-medium">{trader.strategy}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 font-mono font-bold text-emerald-400 text-sm">{trader.roiMonthly}</td>
                      <td className="py-3 font-mono font-bold text-blue-400">{trader.winRate}</td>
                      <td className="py-3 font-mono text-slate-200">
                        {trader.trades.length} Trade ({trader.trades[0].asset}, {trader.trades[1].asset}, {trader.trades[2].asset})
                      </td>
                      <td className="py-3 font-mono text-slate-400">{trader.copiers} Copier</td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleLeaderboardCopy(trader)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                            trader.isCopied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-liquid-glow'
                          }`}
                        >
                          {trader.isCopied ? 'Copy Attivo ✓' : 'Attiva Copy Trading'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= VISTA 3: CONDIVIDI POSIZIONE / REPORT ================= */}
      {subTab === 'share' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-blue-500/30 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Condividi un Tuo Trade o un Asset TradingView sulla Community Nexus
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Seleziona una tua operazione reale dal tuo portafoglio oppure un qualsiasi asset di borsa TradingView per condividere l'analisi.
              </p>
            </div>

            {shareFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                ✓ Report Operativo pubblicato con successo sulla Community Nexus!
              </div>
            )}

            <form onSubmit={handleShareTradeReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Seleziona Operazione o Asset TradingView</label>
                <select
                  value={selectedAssetOrTrade}
                  onChange={(e) => setSelectedAssetOrTrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <optgroup label="Tuo Portafoglio Reale">
                    {userPositions.map((p) => (
                      <option key={`pos-${p.id}`} value={`pos-${p.id}`}>
                        [POSIZIONE APERTA] {p.asset} - {p.side} ({p.quantity} Lotti) @ ${p.entryPrice}
                      </option>
                    ))}
                    {userClosed.map((c) => (
                      <option key={`closed-${c.id}`} value={`closed-${c.id}`}>
                        [TRADE CHIUSO] {c.asset} - {c.side} ({c.quantity} Lotti) | P&L: ${c.pnl}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Tutti gli Asset TradingView">
                    {ALL_TRADINGVIEW_ASSETS.map((ast) => (
                      <option key={ast.symbol} value={ast.symbol}>
                        {ast.symbol} - {ast.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Commento o Analisi Strategica</label>
                <textarea
                  rows="3"
                  value={shareCommentary}
                  onChange={(e) => setShareCommentary(e.target.value)}
                  placeholder="Spiega la motivazione dell'ingresso, i livelli chiave o la strategia applicata..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-liquid-glow"
              >
                Pubblica Report su Community Nexus
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL COPIA POSIZIONE SINGOLA SPECIFICA CON CAPITALE ESATTO ($50, $100, ECC.) */}
      {copySingleTradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-blue-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative animate-fade-in font-sans">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block font-outfit">
                  Copia Posizione Singola
                </span>
                <h3 className="text-lg font-black text-white font-outfit mt-1">
                  Copia Trade di {copySingleTradeModal.author}
                </h3>
              </div>
              <button
                onClick={() => setCopySingleTradeModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 font-bold flex items-center justify-center text-xs transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSingleCopy} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Operazione da Replicare:</span>
                <strong className="text-slate-100 font-mono font-bold block">
                  {copySingleTradeModal.trade
                    ? `${copySingleTradeModal.trade.side} ${copySingleTradeModal.trade.asset} @ $${copySingleTradeModal.trade.entryPrice}`
                    : 'BUY BTC/USD @ $64,500'}
                </strong>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Capitale da Investire in questa Posizione ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={exactInvestedAmount}
                  onChange={(e) => setExactInvestedAmount(e.target.value)}
                  placeholder="es. 50"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Inserisci l'importo esatto che desideri allocare per questa specifica operazione (es. $50).
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCopySingleTradeModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-liquid-glow"
                >
                  Conferma & Apri Posizione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityNexusPage;
