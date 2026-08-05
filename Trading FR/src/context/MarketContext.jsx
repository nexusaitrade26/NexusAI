import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTradingStore } from '../store/useTradingStore';

const INITIAL_PRICES = {
  'BTC/USD': 64250.00,
  'ETH/USD': 3450.00,
  'NVDA': 125.50,
  'AAPL': 224.30,
  'TSLA': 208.40,
  'EUR/USD': 1.0860,
  'GOLD': 2415.00,
  'OIL': 76.80,
};

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [basePrices, setBasePrices] = useState(INITIAL_PRICES);
  const [priceChanges] = useState({
    'BTC/USD': '+2.45%',
    'ETH/USD': '+1.82%',
    'NVDA': '+4.12%',
    'AAPL': '+0.85%',
    'TSLA': '-1.20%',
    'EUR/USD': '+0.15%',
    'GOLD': '+0.60%',
    'OIL': '-0.40%'
  });

  const getLivePrice = useCallback((assetSymbol) => {
    if (!assetSymbol) return prices[selectedAsset] || 64250.00;
    const clean = assetSymbol.toUpperCase().trim();
    if (prices[clean]) return prices[clean];
    if (clean.includes('BTC')) return prices['BTC/USD'] || 64250.00;
    if (clean.includes('ETH')) return prices['ETH/USD'] || 3450.00;
    if (clean.includes('NVDA')) return prices['NVDA'] || 125.50;
    if (clean.includes('AAPL')) return prices['AAPL'] || 224.30;
    if (clean.includes('TSLA')) return prices['TSLA'] || 208.40;
    if (clean.includes('EUR')) return prices['EUR/USD'] || 1.0860;
    if (clean.includes('GOLD')) return prices['GOLD'] || 2415.00;
    if (clean.includes('OIL')) return prices['OIL'] || 76.80;
    return prices[selectedAsset] || 100.00;
  }, [prices, selectedAsset]);

  // Esecuzione automatica in tempo reale di Stop Loss / Take Profit ad ogni variazione di prezzo
  useEffect(() => {
    try {
      useTradingStore.getState().checkStopLossAndTakeProfit(getLivePrice);
    } catch (_) {}
  }, [prices, getLivePrice]);

  // 1. Recupero Prezzi REALI da Binance API per Crypto (BTC/USD e ETH/USD) in tempo reale ogni 2 secondi
  useEffect(() => {
    let isMounted = true;

    const fetchCryptoPrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
        ]);

        if (btcRes.ok && ethRes.ok) {
          const btcData = await btcRes.json();
          const ethData = await ethRes.json();

          if (isMounted && btcData.price && ethData.price) {
            const btcVal = parseFloat(parseFloat(btcData.price).toFixed(2));
            const ethVal = parseFloat(parseFloat(ethData.price).toFixed(2));

            setBasePrices((prev) => ({ ...prev, 'BTC/USD': btcVal, 'ETH/USD': ethVal }));
            setPrices((prev) => ({ ...prev, 'BTC/USD': btcVal, 'ETH/USD': ethVal }));
          }
        }
      } catch (err) {
        // fallback crypto
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Recupero Prezzi REALI per Forex (EUR/USD) ogni 5 secondi
  useEffect(() => {
    let isMounted = true;

    const fetchFxPrices = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.rates?.USD) {
            const eurVal = parseFloat(parseFloat(data.rates.USD).toFixed(4));
            setBasePrices((prev) => ({ ...prev, 'EUR/USD': eurVal }));
            setPrices((prev) => ({ ...prev, 'EUR/USD': eurVal }));
          }
        }
      } catch (err) {
        // fallback FX
      }
    };

    fetchFxPrices();
    const interval = setInterval(fetchFxPrices, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 3. Recupero Prezzi REALI di Mercato da Yahoo Finance o API di riserva per Stock & Commodities
  useEffect(() => {
    let isMounted = true;

    const fetchStockPrices = async () => {
      const symbols = [
        { key: 'NVDA', ticker: 'NVDA' },
        { key: 'AAPL', ticker: 'AAPL' },
        { key: 'TSLA', ticker: 'TSLA' },
        { key: 'GOLD', ticker: 'GC=F' },
        { key: 'OIL', ticker: 'CL=F' }
      ];

      for (const item of symbols) {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${item.ticker}?interval=1m`);
          if (res.ok) {
            const data = await res.json();
            const liveVal = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
            if (isMounted && liveVal) {
              const val = parseFloat(parseFloat(liveVal).toFixed(2));
              setBasePrices((prev) => ({ ...prev, [item.key]: val }));
              setPrices((prev) => ({ ...prev, [item.key]: val }));
            }
          }
        } catch (err) {
          // fallback stock
        }
      }
    };

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Micro-tick guidato ancorato al prezzo reale per micro-movimento senza deriva permanente
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const assetToTick = selectedAsset;
        const base = basePrices[assetToTick] || prev[assetToTick] || 100;
        let jitter = (Math.random() - 0.5) * (base * 0.0002);
        const nextPrice = Math.max(0.0001, base + jitter);

        return {
          ...prev,
          [assetToTick]: assetToTick.includes('EUR')
            ? parseFloat(nextPrice.toFixed(4))
            : parseFloat(nextPrice.toFixed(2))
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedAsset, basePrices]);

  return (
    <MarketContext.Provider
      value={{
        selectedAsset,
        setSelectedAsset,
        prices,
        priceChanges,
        getLivePrice,
        currentLivePrice: getLivePrice(selectedAsset)
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket deve essere utilizzato all\'interno di MarketProvider');
  }
  return context;
};
