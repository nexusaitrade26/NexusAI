import { get } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // In questa fase base recuperiamo l'utente demo predefinito
    let user = await get("SELECT id, username, email, total_capital FROM users WHERE id = 1");
    if (!user) {
      user = await get("SELECT id, username, email, total_capital FROM users LIMIT 1");
    }

    if (!user) {
      return res.status(401).json({ error: 'Utente non autenticato o database non inizializzato' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
