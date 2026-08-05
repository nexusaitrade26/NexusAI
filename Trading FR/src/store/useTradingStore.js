import { create } from 'zustand';
import { getActiveUserSession, getUserAppData, fetchUserAppData, saveUserAppData } from '../services/accountStorage';

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
    activeAiPositionId: null,
    aiGuardianMode: 'toast',
    widgetModes: {}, // { [posId]: 'toast' | 'widget' | 'window' | 'closed' }
    isSubNavFixed: true, // Menu sottomenu fisso in alto di default

    setActiveAiPositionId: (id) => {
      set({ activeAiPositionId: id });
    },

    setAiGuardianMode: (mode) => {
      set({ aiGuardianMode: mode });
    },

    toggleSubNavFixed: () => {
      set((state) => ({ isSubNavFixed: !state.isSubNavFixed }));
    },

    setWidgetModeForPosition: (posId, mode) => {
      set((state) => ({
        widgetModes: {
          ...(state.widgetModes || {}),
          [posId]: mode
        }
      }));
    },

    // Ricarica la memoria isolata quando cambia utente e sincronizza dal Cloud
    loadActiveUserStore: () => {
      const state = getInitialStateForActiveUser();
      set(state);
      if (get().syncActiveUserStoreFromCloud) {
        get().syncActiveUserStoreFromCloud();
      }
    },

    // Sincronizza lo stato in tempo reale dal Cloud Server H24
    syncActiveUserStoreFromCloud: async () => {
      const activeUser = getActiveUserSession();
      if (activeUser && activeUser.username) {
        const data = await fetchUserAppData(activeUser.username);
        if (data) {
          set({
            balance: data.balance ?? 10000.0,
            positions: data.positions || [],
            closedTrades: data.closedTrades || [],
            notifications: data.notifications || [],
            chatSessions: data.chatSessions || []
          });
        }
      }
    },

    // Aggiorna Stop Loss e Take Profit per una posizione specifica via consiglio AI
    updatePositionSLTP: (positionId, newSL, newTP) => {
      const positions = (get().positions || []).map((p) => {
        if (p && p.id === positionId) {
          return {
            ...p,
            stopLoss: newSL != null && !isNaN(newSL) ? parseFloat(newSL) : p.stopLoss,
            takeProfit: newTP != null && !isNaN(newTP) ? parseFloat(newTP) : p.takeProfit
          };
        }
        return p;
      });

      const nextState = {
        positions,
        notifications: [
          {
            id: Date.now(),
            type: 'success',
            message: `NEXUS AI GUARDIAN: Livelli aggiornati con successo per la posizione.`
          },
          ...(get().notifications || [])
        ]
      };

      set(nextState);
      persistForActiveUser(get());
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

      const newPositionId = Date.now() + 1;
      const newPosition = {
        id: newPositionId,
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
        activeAiPositionId: newPositionId,
        widgetModes: {
          ...(get().widgetModes || {}),
          [newPositionId]: 'closed'
        },
        notifications: [
          {
            id: Date.now(),
            type: 'POSIZIONE APERTA',
            positionId: newPositionId,
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

      let closeReason = 'Chiuso Manualmente';
      if (emotionalTag.includes('Stop Loss') || emotionalTag === 'Stop Loss') {
        closeReason = 'Chiuso con Stop Loss';
      } else if (emotionalTag.includes('Take Profit') || emotionalTag === 'Take Profit') {
        closeReason = 'Chiuso con Take Profit';
      } else if (emotionalTag.includes('AI Guardian')) {
        closeReason = 'Chiuso con AI Guardian';
      }

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
        closeReason,
        closedAt: new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedModes = { ...(get().widgetModes || {}) };
      delete updatedModes[positionId];

      const nextState = {
        positions: (get().positions || []).filter((p) => p && p.id !== positionId),
        closedTrades: [newClosedTrade, ...(get().closedTrades || [])],
        balance: (get().balance || 10000) + pnlFormatted,
        widgetModes: updatedModes,
        notifications: [
          {
            id: Date.now(),
            type: 'POSIZIONE CHIUSA',
            message: `${pos.asset} (${pos.side}) ${closeReason.toLowerCase()} a $${exit}. P&L: ${pnlFormatted >= 0 ? '+' : ''}$${pnlFormatted}`
          },
          ...(get().notifications || [])
        ]
      };

      set(nextState);
      persistForActiveUser(get());
    },

    // Chiudi tutte le posizioni aperte in un solo click con notifica dedicata "Hai chiuso tutte le operazioni."
    closeAllPositions: (getLivePriceFn) => {
      const state = get();
      const positions = state.positions || [];
      if (positions.length === 0) return;

      const newClosedTrades = positions.map((pos, idx) => {
        const entry = Number(pos.entryPrice) || 0;
        const livePrice = typeof getLivePriceFn === 'function' ? Number(getLivePriceFn(pos.asset)) : 0;
        const exit = (livePrice && !isNaN(livePrice) && livePrice > 0) ? livePrice : Number(pos.currentPrice) || entry;
        const qty = Number(pos.quantity) || 1.0;
        const isLong = pos.side === 'BUY' || pos.side === 'long' || !pos.side;

        const pnl = isLong ? (exit - entry) * qty : (entry - exit) * qty;
        const pnlFormatted = isNaN(pnl) ? 0 : parseFloat(pnl.toFixed(2));
        const result = pnlFormatted >= 0 ? 'win' : 'loss';

        return {
          id: Date.now() + idx,
          asset: pos.asset || 'BTC/USD',
          side: pos.side || 'BUY',
          quantity: qty,
          entryPrice: entry,
          exitPrice: exit,
          stopLoss: pos.stopLoss != null ? Number(pos.stopLoss) : null,
          takeProfit: pos.takeProfit != null ? Number(pos.takeProfit) : null,
          pnl: pnlFormatted,
          result,
          emotionalTag: 'Calmo',
          closeReason: 'Chiuso con Chiudi Tutto',
          closedAt: new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        };
      });

      const totalPnlSum = newClosedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

      const nextState = {
        positions: [],
        closedTrades: [...newClosedTrades, ...(state.closedTrades || [])],
        balance: (state.balance || 10000) + totalPnlSum,
        widgetModes: {},
        notifications: [
          {
            id: Date.now(),
            type: 'POSIZIONE CHIUSA',
            message: 'Hai chiuso tutte le operazioni.'
          },
          ...(state.notifications || [])
        ]
      };

      set(nextState);
      persistForActiveUser(get());
    },

    // Elimina tutto lo storico dei trade chiusi
    clearClosedTrades: () => {
      set({ closedTrades: [] });
      persistForActiveUser(get());
    },

    // Controllo ed esecuzione automatica in tempo reale di Stop Loss e Take Profit
    checkStopLossAndTakeProfit: (getLivePriceFn) => {
      if (typeof getLivePriceFn !== 'function') return;
      const state = get();
      const positions = state.positions || [];
      if (positions.length === 0) return;

      positions.forEach((pos) => {
        if (!pos || !pos.asset) return;
        const livePrice = Number(getLivePriceFn(pos.asset));
        if (!livePrice || isNaN(livePrice) || livePrice <= 0) return;

        const isLong = pos.side === 'BUY' || pos.side === 'long' || !pos.side;

        const slList = [];
        if (pos.stopLoss != null && !isNaN(pos.stopLoss) && Number(pos.stopLoss) > 0) {
          slList.push(Number(pos.stopLoss));
        }
        if (Array.isArray(pos.stopLosses)) {
          pos.stopLosses.forEach((s) => {
            const num = Number(s);
            if (!isNaN(num) && num > 0 && !slList.includes(num)) slList.push(num);
          });
        }

        const tpList = [];
        if (pos.takeProfit != null && !isNaN(pos.takeProfit) && Number(pos.takeProfit) > 0) {
          tpList.push(Number(pos.takeProfit));
        }
        if (Array.isArray(pos.takeProfits)) {
          pos.takeProfits.forEach((t) => {
            const num = Number(t);
            if (!isNaN(num) && num > 0 && !tpList.includes(num)) tpList.push(num);
          });
        }

        let triggeredReason = null;
        let exitPrice = livePrice;

        if (isLong) {
          const triggeredSL = slList.find((sl) => livePrice <= sl);
          if (triggeredSL) {
            triggeredReason = 'Stop Loss';
            exitPrice = triggeredSL;
          } else {
            const triggeredTP = tpList.find((tp) => livePrice >= tp);
            if (triggeredTP) {
              triggeredReason = 'Take Profit';
              exitPrice = triggeredTP;
            }
          }
        } else {
          const triggeredSL = slList.find((sl) => livePrice >= sl);
          if (triggeredSL) {
            triggeredReason = 'Stop Loss';
            exitPrice = triggeredSL;
          } else {
            const triggeredTP = tpList.find((tp) => livePrice <= tp);
            if (triggeredTP) {
              triggeredReason = 'Take Profit';
              exitPrice = triggeredTP;
            }
          }
        }

        if (triggeredReason) {
          get().closePosition(pos.id, exitPrice, `Automatica ${triggeredReason}`);
        }
      });
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
