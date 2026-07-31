import { query, run, get } from '../config/database.js';
import { calculateJournalStats } from '../domain/journalCalculator.js';

/**
 * Lettura trade chiusi filtrati via Query Parameters lato Backend (tag, result)
 */
export const getClosedTrades = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tag, result } = req.query;

    let sql = "SELECT * FROM closed_trades WHERE user_id = ?";
    const params = [userId];

    if (tag && tag !== 'Tutti') {
      sql += " AND emotional_tag = ?";
      params.push(tag);
    }

    if (result && result !== 'Tutti i Risultati') {
      sql += " AND LOWER(result) = LOWER(?)";
      params.push(result);
    }

    sql += " ORDER BY closed_at DESC";

    const trades = await query(sql, params);

    res.json({
      trades: trades.map((t) => ({
        id: t.id,
        asset: t.asset,
        quantity: t.quantity,
        entryPrice: t.entry_price,
        exitPrice: t.exit_price,
        pnl: t.pnl,
        result: t.result,
        emotionalTag: t.emotional_tag,
        closedAt: t.closed_at
      })),
      count: trades.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Eliminazione Trade dal Diario Journal (DELETE)
 */
export const deleteClosedTrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trade = await get("SELECT * FROM closed_trades WHERE id = ? AND user_id = ?", [id, userId]);
    if (!trade) {
      return res.status(404).json({ error: 'Trade non trovato nel Diario.' });
    }

    await run("DELETE FROM closed_trades WHERE id = ?", [id]);

    res.json({
      message: `Trade #${id} per ${trade.asset} eliminato con successo dal Diario.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Aggiornamento Tag Emotivo per singolo trade (PATCH)
 */
export const updateEmotionalTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    const userId = req.user.id;

    const validTags = ['Calmo', 'Ansioso', 'FOMO', 'Vendetta', null];
    if (tag !== null && !validTags.includes(tag)) {
      return res.status(400).json({ error: "Tag emotivo non valido. Valori ammessi: 'Calmo', 'Ansioso', 'FOMO', 'Vendetta'." });
    }

    const trade = await get("SELECT * FROM closed_trades WHERE id = ? AND user_id = ?", [id, userId]);
    if (!trade) {
      return res.status(404).json({ error: 'Trade non trovato.' });
    }

    await run("UPDATE closed_trades SET emotional_tag = ? WHERE id = ?", [tag, id]);

    const updatedTrade = await get("SELECT * FROM closed_trades WHERE id = ?", [id]);

    res.json({
      message: 'Tag emotivo aggiornato con successo',
      trade: {
        id: updatedTrade.id,
        asset: updatedTrade.asset,
        pnl: updatedTrade.pnl,
        result: updatedTrade.result,
        emotionalTag: updatedTrade.emotional_tag,
        closedAt: updatedTrade.closed_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Calcolo Statistiche Aggregate Journal (Win Rate, Drawdown)
 */
export const getJournalStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trades = await query("SELECT * FROM closed_trades WHERE user_id = ?", [userId]);

    const stats = calculateJournalStats(trades);

    res.json(stats);
  } catch (err) {
    next(err);
  }
};
