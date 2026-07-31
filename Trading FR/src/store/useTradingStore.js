import { create } from 'zustand';
import { getActiveUserSession, getUserAppData, saveUserAppData } from '../services/accountStorage';

// Inizializza lo stato dallo storage isolato dell'utente attivo
const getInitialStateForActiveUser = () => {
  const activeUser = getActiveUserSession();
  if (activeUser && activeUser.username) {
    const data = getUserAppData(activeUser.username);
    return {
      balance: data?.balance ?? 10000.0,
      positions: data?.positions || [],
      closedTrades: data?.closedTrades || [],
      notifications: data?.notifications || [],
      chatSessions: data?.chatSessions || []
    };
  }
  return {
    balance: 10000.0,
    positions: [],
    closedTrades: [],
    notifications: [],
    chatSessions: []
  };
};

export const useTradingStore = create((set, get) => {
  const initial = getInitialStateForActiveUser();

  // Helper per salvare lo stato nella memoria dell'utente attivo
  const persistForActiveUser = (newState) => {
    const activeUser = getActiveUserSession();
    if (activeUser && activeUser.username) {
      saveUserAppData(activeUser.username, {
        balance: newState.balance,
        positions: newState.positions,
        closedTrades: newState.closedTrades,
        notifications: newState.notifications,
        chatSessions: newState.chatSessions
      });
    }
  };

  return {
    balance: initial.balance,
    positions: initial.positions,
    orders: [],
    closedTrades: initial.closedTrades,
    notifications: initial.notifications,
    chatSessions: initial.chatSessions,

    // Ricarica la memoria isolata quando cambia utente
    loadActiveUserStore: () => {
      const state = getInitialStateForActiveUser();
      set(state);
    },

    // Aggiungi un nuovo ordine ed apri posizione (BUY o SELL)
    openOrder: (orderData = {}, currentPrice = 100) => {
      const entryPrice = parseFloat(currentPrice) || 100;
      const side = orderData.side || 'BUY';
      const quantity = parseFloat(orderData.quantity) || 1.0;
      const asset = orderData.asset || 'BTC/USD';

      const newOrder = {
        id: Date.now(),
        asset,
        quantity,
        side,
        type: orderData.type || 'market',
        stopLoss: orderData.stopLoss ? parseFloat(orderData.stopLoss) : null,
        takeProfit: orderData.takeProfit ? parseFloat(orderData.takeProfit) : null,
        status: 'eseguito',
        createdAt: new Date().toISOString()
      };

      const newPosition = {
        id: Date.now() + 1,
        asset,
        side,
        quantity,
        entryPrice,
        currentPrice: entryPrice,
        stopLoss: orderData.stopLoss ? parseFloat(orderData.stopLoss) : null,
        takeProfit: orderData.takeProfit ? parseFloat(orderData.takeProfit) : null,
        openedBy: 'manual',
        openedAt: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        category: asset.includes('BTC') || asset.includes('ETH') ? 'Crypto' : asset.includes('EUR') ? 'Forex' : 'Tech'
      };

      const nextState = {
        orders: [newOrder, ...(get().orders || [])],
        positions: [newPosition, ...(get().positions || [])],
        notifications: [
          {
            id: Date.now(),
            type: 'COPY TRADING',
            message: `Nuova operazione ${side} aperta su ${asset} a $${entryPrice} (${quantity} Lotti)`
          },
          ...(get().notifications || [])
        ]
      };

      set(nextState);
      persistForActiveUser(get());
    },

    // Chiudi una posizione aperta (preserva Stop Loss e Take Profit anche a posizione chiusa)
    closePosition: (positionId, exitPrice, emotionalTag = 'Calmo') => {
      const state = get();
      const positions = state.positions || [];
      const pos = positions.find((p) => p && p.id === positionId);
      if (!pos) return;

      const entry = Number(pos.entryPrice) || 0;
      const exit = parseFloat(exitPrice) || Number(pos.currentPrice) || entry;
      const qty = Number(pos.quantity) || 1.0;
      const isLong = pos.side === 'BUY' || pos.side === 'long' || !pos.side;

      const pnl = isLong ? (exit - entry) * qty : (entry - exit) * qty;
      const pnlFormatted = isNaN(pnl) ? 0 : parseFloat(pnl.toFixed(2));
      const result = pnlFormatted >= 0 ? 'win' : 'loss';

      const newClosedTrade = {
        id: Date.now(),
        asset: pos.asset || 'BTC/USD',
        side: pos.side || 'BUY',
        quantity: qty,
        entryPrice: entry,
        exitPrice: exit,
        stopLoss: pos.stopLoss != null ? Number(pos.stopLoss) : null,
        takeProfit: pos.takeProfit != null ? Number(pos.takeProfit) : null,
        pnl: pnlFormatted,
        result,
        emotionalTag: emotionalTag || 'Calmo',
        closedAt: new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      };

      const nextState = {
        positions: (get().positions || []).filter((p) => p && p.id !== positionId),
        closedTrades: [newClosedTrade, ...(get().closedTrades || [])],
        balance: (get().balance || 10000) + pnlFormatted,
        notifications: [
          {
            id: Date.now(),
            type: result === 'win' ? 'success' : 'error',
            message: `Posizione ${pos.asset} (${pos.side}) chiusa. P&L: ${pnlFormatted >= 0 ? '+' : ''}$${pnlFormatted}`
          },
          ...(get().notifications || [])
        ]
      };

      set(nextState);
      persistForActiveUser(get());
    },

    clearAll: () => {
      const reset = {
        balance: 10000.0,
        positions: [],
        orders: [],
        closedTrades: [],
        notifications: []
      };
      set(reset);
      persistForActiveUser(reset);
    }
  };
});
