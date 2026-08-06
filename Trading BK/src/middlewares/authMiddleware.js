import { get } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Format: nexus_token_<userId>_<timestamp>
      const match = token.match(/^nexus_token_(\d+)_\d+$/);
      if (match) {
        const userId = parseInt(match[1], 10);
        const user = await get("SELECT id, username, email, gender, age, total_capital FROM users WHERE id = ?", [userId]);
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

    const customUserId = req.headers['x-user-id'];
    if (customUserId) {
      const user = await get("SELECT id, username, email, gender, age, total_capital FROM users WHERE id = ?", [parseInt(customUserId, 10)]);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Fallback utente predefinito se nessun token inviato
    let defaultUser = await get("SELECT id, username, email, gender, age, total_capital FROM users WHERE id = 1");
    if (!defaultUser) {
      defaultUser = await get("SELECT id, username, email, gender, age, total_capital FROM users LIMIT 1");
    }

    if (!defaultUser) {
      return res.status(401).json({ error: 'Utente non autenticato o database non inizializzato' });
    }

    req.user = defaultUser;
    next();
  } catch (err) {
    next(err);
  }
};

