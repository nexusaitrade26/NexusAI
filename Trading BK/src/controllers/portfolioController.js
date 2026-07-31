import { query, get } from '../config/database.js';
import { calculateRiskScore, calculateExposureByCategory } from '../domain/riskCalculator.js';

export const getPositions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const positions = await query("SELECT * FROM positions WHERE user_id = ?", [userId]);

    let totalPositionsValue = 0;
    const mappedPositions = positions.map((p) => {
      const pnl = parseFloat(((p.current_price - p.entry_price) * p.quantity).toFixed(2));
      const pnlPercent = parseFloat((((p.current_price - p.entry_price) / p.entry_price) * 100).toFixed(2));
      const positionValue = p.quantity * p.current_price;
      totalPositionsValue += positionValue;

      return {
        id: p.id,
        asset: p.asset,
        quantity: p.quantity,
        entryPrice: p.entry_price,
        currentPrice: p.current_price,
        category: p.category,
        stopLoss: p.stop_loss,
        takeProfit: p.take_profit,
        openedBy: p.opened_by || 'manual',
        pnl,
        pnlPercent,
        positionValue: parseFloat(positionValue.toFixed(2)),
        openedAt: p.opened_at
      };
    });

    const positionsWithShare = mappedPositions.map((p) => ({
      ...p,
      portfolioSharePercent: totalPositionsValue > 0
        ? parseFloat(((p.positionValue / totalPositionsValue) * 100).toFixed(2))
        : 0
    }));

    res.json({
      positions: positionsWithShare,
      totalValue: parseFloat(totalPositionsValue.toFixed(2)),
      count: positions.length
    });
  } catch (err) {
    next(err);
  }
};

export const getRiskScore = async (req, res, next) => {
  try {
    const user = req.user;
    const positions = await query("SELECT * FROM positions WHERE user_id = ?", [user.id]);
    const riskData = calculateRiskScore(positions, user.total_capital);

    res.json(riskData);
  } catch (err) {
    next(err);
  }
};

export const getExposure = async (req, res, next) => {
  try {
    const positions = await query("SELECT * FROM positions WHERE user_id = ?", [req.user.id]);
    const exposure = calculateExposureByCategory(positions);

    res.json({ exposure });
  } catch (err) {
    next(err);
  }
};
