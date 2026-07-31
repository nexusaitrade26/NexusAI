import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import journalRoutes from './routes/studioRoutes.js';
import studioRoutes from './routes/studioRoutes.js';
import briefingRoutes from './routes/briefingRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware globali
app.use(cors());
app.use(express.json());

// Rotte pubbliche Autenticazione (senza middleware restrittivo)
app.use('/api/auth', authRoutes);

// Autenticazione base per la gestione utente
app.use(authMiddleware);

// Registrazione Rotte REST API
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/dashboard', briefingRoutes);

// Handling 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Middleware errori centralizzato
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trading BK Server running on http://0.0.0.0:${PORT}`);
});

export default app;
