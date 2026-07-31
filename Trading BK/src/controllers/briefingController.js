import { query } from '../config/database.js';
import { generateDashboardBriefing } from '../domain/briefingEngine.js';

export const getBriefing = async (req, res, next) => {
  try {
    const user = req.user;
    const positions = await query("SELECT * FROM positions WHERE user_id = ?", [user.id]);
    const recentOrders = await query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [user.id]);
    const closedTrades = await query("SELECT * FROM closed_trades WHERE user_id = ? ORDER BY closed_at DESC", [user.id]);

    const briefing = generateDashboardBriefing(user, positions, recentOrders, closedTrades);

    res.json(briefing);
  } catch (err) {
    next(err);
  }
};

export const getPerformanceCurve = async (req, res, next) => {
  try {
    const user = req.user;
    const closedTrades = await query("SELECT pnl, closed_at FROM closed_trades WHERE user_id = ? ORDER BY closed_at ASC", [user.id]);
    
    let runningCapital = user.total_capital;
    const curvePoints = [
      { date: 'Inizio', capital: runningCapital }
    ];

    closedTrades.forEach((t, idx) => {
      runningCapital += t.pnl;
      curvePoints.push({
        date: new Date(t.closed_at).toLocaleDateString(),
        capital: parseFloat(runningCapital.toFixed(2)),
        pnlChange: t.pnl
      });
    });

    res.json({
      initialCapital: user.total_capital,
      currentCapital: parseFloat(runningCapital.toFixed(2)),
      points: curvePoints
    });
  } catch (err) {
    next(err);
  }
};
