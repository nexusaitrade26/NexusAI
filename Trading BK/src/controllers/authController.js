import crypto from 'crypto';
import { query, run, get } from '../config/database.js';

// Helper per hash password sicuro
const hashPassword = (pwd) => {
  return crypto.createHash('sha256').update(pwd).digest('hex');
};

// Inizializza colonne aggiuntive se non esistono nel DB SQLite
const ensureAuthSchema = async () => {
  try {
    const tableInfo = await query("PRAGMA table_info(users);");
    const cols = tableInfo.map((c) => c.name);

    if (!cols.includes('password_hash')) {
      await run("ALTER TABLE users ADD COLUMN password_hash TEXT;");
    }
    if (!cols.includes('gender')) {
      await run("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'Maschile';");
    }
    if (!cols.includes('age')) {
      await run("ALTER TABLE users ADD COLUMN age INTEGER DEFAULT 25;");
    }
    if (!cols.includes('reset_token')) {
      await run("ALTER TABLE users ADD COLUMN reset_token TEXT;");
    }
  } catch (err) {
    console.warn('Verifica schema utenti:', err.message);
  }
};

ensureAuthSchema();

/**
 * Registrazione nuovo utente
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, gender, age } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Compilare tutti i campi obbligatori: Nome Utente, Email e Password.' });
    }

    // Verifica se username o email sono già registrati
    const existingUser = await get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Nome Utente o Email già registrati nel sistema.' });
    }

    const pwdHash = hashPassword(password);
    const userGender = gender || 'Maschile';
    const userAge = age ? parseInt(age, 10) : 25;

    const result = await run(
      "INSERT INTO users (username, email, password_hash, gender, age, total_capital) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, pwdHash, userGender, userAge, 10000.0]
    );

    const newUser = await get("SELECT id, username, email, gender, age, total_capital, created_at FROM users WHERE id = ?", [result.id]);

    res.status(201).json({
      message: 'Account creato con successo!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        gender: newUser.gender,
        age: newUser.age,
        totalCapital: newUser.total_capital
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login Utente
 */
export const login = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Inserire Nome Utente/Email e Password.' });
    }

    const pwdHash = hashPassword(password);
    const user = await get(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND password_hash = ?",
      [usernameOrEmail, usernameOrEmail, pwdHash]
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide. Verificare Nome Utente/Email e Password.' });
    }

    res.json({
      message: 'Login effettuato con successo!',
      token: `nexus_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender || 'Maschile',
        age: user.age || 25,
        totalCapital: user.total_capital
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Richiesta Recupero Password (Password Dimenticata)
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Inserire l\'indirizzo email per il recupero.' });
    }

    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(404).json({ error: 'Nessun account trovato con questa email.' });
    }

    const resetToken = crypto.randomBytes(16).toString('hex');
    await run("UPDATE users SET reset_token = ? WHERE id = ?", [resetToken, user.id]);

    res.json({
      message: `Codice di ripristino inviato con successo all'email ${email}.`,
      resetToken
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Ripristino Password (Reset Password)
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Inserire il codice di ripristino e la nuova password.' });
    }

    const user = await get("SELECT * FROM users WHERE reset_token = ?", [resetToken]);
    if (!user) {
      return res.status(400).json({ error: 'Codice di ripristino non valido o scaduto.' });
    }

    const newHash = hashPassword(newPassword);
    await run("UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?", [newHash, user.id]);

    res.json({
      message: 'Password aggiornata con successo! Ora puoi effettuare il login con la nuova password.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Dettagli Profilo Utente Corrente
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const user = await get("SELECT id, username, email, gender, age, total_capital, created_at FROM users WHERE id = ?", [userId]);

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato.' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender || 'Maschile',
        age: user.age || 25,
        totalCapital: user.total_capital,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Aggiornamento Profilo Utente
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const { username, email, gender, age } = req.body;

    await run(
      "UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), gender = COALESCE(?, gender), age = COALESCE(?, age) WHERE id = ?",
      [username, email, gender, age, userId]
    );

    const updatedUser = await get("SELECT id, username, email, gender, age, total_capital FROM users WHERE id = ?", [userId]);

    res.json({
      message: 'Profilo aggiornato con successo!',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        gender: updatedUser.gender,
        age: updatedUser.age,
        totalCapital: updatedUser.total_capital
      }
    });
  } catch (err) {
    next(err);
  }
};
