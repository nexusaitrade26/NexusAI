import { useState, useEffect, useRef, useCallback } from 'react';
import { useTradingStore } from '../../store/useTradingStore';

const ToastItem = ({ notif, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Timer di 5 secondi ininterrotto (non resettato dai tick di prezzo)
  useEffect(() => {
    setIsExiting(false);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 4500);

    const closeTimer = setTimeout(() => {
      if (onDismissRef.current) {
        onDismissRef.current(notif.id);
      }
    }, 5000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [notif.id]);

  const isPosOpened = notif.type === 'POSIZIONE APERTA';
  const isPosClosed = notif.type === 'POSIZIONE CHIUSA';
  const isAiOpp = notif.type === 'AI OPPORTUNITÀ';

  return (
    <div
      className={`w-[88vw] sm:w-[340px] bg-[#0b0f19]/95 border border-slate-800/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md font-sans space-y-1.5 transition-all duration-300 ease-out transform-gpu ${
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
    >
      <div className="flex justify-between items-center">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider block font-outfit ${
            isPosOpened
              ? 'text-emerald-400'
              : isPosClosed
              ? 'text-rose-400'
              : isAiOpp
              ? 'text-blue-400'
              : 'text-purple-400'
          }`}
        >
          {notif.type || 'NOTIFICA SISTEMA'}
        </span>
        <button
          onClick={() => onDismiss(notif.id)}
          className="text-slate-400 hover:text-white text-xs font-mono font-bold px-1"
        >
          X
        </button>
      </div>

      <p className="text-slate-200 text-xs leading-relaxed font-medium">
        {notif.message}
      </p>

      {/* Pulsante Widget nel Banner Toast per Posizioni Aperte */}
      {isPosOpened && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              const positions = useTradingStore.getState().positions || [];
              const targetPos = positions.find((p) => p && p.id === notif.positionId) || positions[0];
              if (targetPos) {
                useTradingStore.getState().setActiveAiPositionId(targetPos.id);
                useTradingStore.getState().setWidgetModeForPosition(targetPos.id, 'widget');
                onDismiss(notif.id);
              }
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] font-bold transition-all font-outfit shadow-sm cursor-pointer"
          >
            Widget
          </button>
        </div>
      )}
    </div>
  );
};

const GlobalNotificationStack = () => {
  const notifications = useTradingStore((state) => state.notifications) || [];
  const [activeToasts, setActiveToasts] = useState([]);
  const [lastProcessedId, setLastProcessedId] = useState(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const newest = notifications[0];
      if (newest && newest.id !== lastProcessedId && newest.type !== 'AI_GUARDIAN_SILENT') {
        setLastProcessedId(newest.id);
        setActiveToasts((prev) => {
          const exists = prev.some((t) => t.id === newest.id);
          if (exists) return prev;
          return [...prev, newest].slice(-3);
        });
      }
    }
  }, [notifications, lastProcessedId]);

  const handleDismiss = useCallback((notifId) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== notifId));
  }, []);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-40 flex flex-col gap-2.5 pointer-events-auto transition-all duration-300 ease-out">
      {activeToasts.map((notif) => (
        <ToastItem key={notif.id} notif={notif} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default GlobalNotificationStack;
