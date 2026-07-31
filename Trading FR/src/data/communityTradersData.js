// Dataset di 50 Trader reali della Community Nexus (ciascuno con almeno 3 operazioni distinte)

const TRADER_NAMES = [
  'Marco Rossi', 'Elena Bianchi', 'Alessandro Moretti', 'Giulia Romano', 'Matteo Ricci',
  'Sofia Conti', 'Davide De Luca', 'Chiara Esposito', 'Andrea Ferrari', 'Francesca Bruno',
  'Lorenzo Marino', 'Valentina Greco', 'Gabriele Lombardi', 'Alice Barbieri', 'Riccardo Fontaine',
  'Eleonora Villa', 'Filippo Serra', 'Beatrice Monti', 'Stefano Rinaldi', 'Camilla Costa',
  'Lucas Miller', 'Sophie Laurent', 'Viktor Novak', 'Carlos Silva', 'Emma Watson',
  'Oliver Schmidt', 'Isabella Rossi', 'Liam Vance', 'Mia Chen', 'Noah Dupont',
  'Giacomo Palmieri', 'Martina Santoro', 'Christian Gatti', 'Federica Messineo', 'Emanuele Carbone',
  'Sara D\'Amico', 'Simone Silvestri', 'Serena Bellini', 'Daniele Riva', 'Giorgia Donati',
  'Tommaso Marini', 'Greta Marchetti', 'Claudio Parodi', 'Lucrezia Ferri', 'Manuel Neri',
  'Ilaria Benedetti', 'Massimo Giuliano', 'Veronica Pellegrini', 'Fabio Barberis', 'Elena Parisi'
];

const STRATEGIES = [
  'Smart Money Concepts (SMC) & Order Blocks',
  'Breakout Confermato & Fair Value Gap (FVG)',
  'Scalping Volatilità & Momentum Intraday',
  'Trend Following & Medie Mobili EMA 50/200',
  'Price Action Istituzionale & Liquidity Grab'
];

const ASSETS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'NVDA', 'AAPL', 'TSLA', 'AMZN', 'EUR/USD', 'GOLD'];

export const GENERATED_COMMUNITY_TRADERS = TRADER_NAMES.map((name, index) => {
  const nameParts = name.split(' ');
  const initials = `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`;
  const rank = index + 1;
  const roiVal = (150 - index * 2.2 + Math.random() * 5).toFixed(1);
  const winRateVal = (86 - index * 0.4 + Math.random() * 3).toFixed(1);
  const copiersCount = Math.max(12, Math.round(1500 - index * 28 + Math.random() * 50));
  const strategy = STRATEGIES[index % STRATEGIES.length];
  const isVerified = index < 15;

  // Ciascuno dei 50 trader possiede ALMENO 3 OPERAZIONI DISTINTE
  const asset1 = ASSETS[index % ASSETS.length];
  const asset2 = ASSETS[(index + 3) % ASSETS.length];
  const asset3 = ASSETS[(index + 6) % ASSETS.length];

  const trades = [
    {
      id: `t-${index}-1`,
      asset: asset1,
      side: index % 2 === 0 ? 'BUY' : 'SELL',
      quantity: parseFloat((1.0 + (index % 5) * 0.5).toFixed(1)),
      entryPrice: asset1.includes('BTC') ? 64200 : asset1.includes('ETH') ? 3450 : asset1.includes('NVDA') ? 192.5 : 120,
      currentPrice: asset1.includes('BTC') ? 65800 : asset1.includes('ETH') ? 3590 : asset1.includes('NVDA') ? 198.2 : 124,
      pnl: `+${(450 + index * 30).toFixed(2)}`,
      pnlPercent: `+${(12 + (index % 8)).toFixed(1)}%`,
      comment: `Operazione 1: Ingresso pulito su ${asset1} a seguito dell'analisi SMC sul grafico a 15 minuti.`
    },
    {
      id: `t-${index}-2`,
      asset: asset2,
      side: index % 3 === 0 ? 'BUY' : 'SELL',
      quantity: parseFloat((0.8 + (index % 4) * 0.4).toFixed(1)),
      entryPrice: asset2.includes('BTC') ? 63800 : asset2.includes('ETH') ? 3390 : asset2.includes('GOLD') ? 2380 : 150,
      currentPrice: asset2.includes('BTC') ? 65100 : asset2.includes('ETH') ? 3510 : asset2.includes('GOLD') ? 2410 : 155,
      pnl: `+${(320 + index * 25).toFixed(2)}`,
      pnlPercent: `+${(9 + (index % 6)).toFixed(1)}%`,
      comment: `Operazione 2: Breakout confermato su ${asset2} con riassorbimento della liquidità istituzionale.`
    },
    {
      id: `t-${index}-3`,
      asset: asset3,
      side: 'BUY',
      quantity: parseFloat((1.2 + (index % 3) * 0.3).toFixed(1)),
      entryPrice: asset3.includes('BTC') ? 62900 : asset3.includes('ETH') ? 3280 : asset3.includes('AAPL') ? 335 : 200,
      currentPrice: asset3.includes('BTC') ? 64800 : asset3.includes('ETH') ? 3420 : asset3.includes('AAPL') ? 342 : 208,
      pnl: `+${(580 + index * 40).toFixed(2)}`,
      pnlPercent: `+${(15 + (index % 7)).toFixed(1)}%`,
      comment: `Operazione 3: Rintracciamento completato sulla media EMA 50 su ${asset3}. Target raggiunto.`
    }
  ];

  return {
    id: `trader-${rank}`,
    name,
    username: name.toLowerCase().replace(' ', '_'),
    avatar: initials,
    rank,
    isVerified,
    roiMonthly: `+${roiVal}%`,
    winRate: `${winRateVal}%`,
    totalTrades: 45 + index * 3,
    copiers: copiersCount,
    strategy,
    activeTrade: `${trades[0].side} ${trades[0].asset} @ $${trades[0].entryPrice}`,
    trades,
    isCopied: false
  };
});
