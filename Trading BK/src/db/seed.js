import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { run, get } from '../config/database.js';
import { seedStudioData } from './seedStudio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('Inizializzazione dello schema database e seeding dati...');
  
  // Reset per una piattaforma pulita da usare al 100%
  await run("DROP TABLE IF EXISTS positions");
  await run("DROP TABLE IF EXISTS orders");
  await run("DROP TABLE IF EXISTS closed_trades");
  await run("DROP TABLE IF EXISTS studio_interactive_blocks");
  await run("DROP TABLE IF EXISTS user_lesson_progress");
  await run("DROP TABLE IF EXISTS studio_lessons");
  await run("DROP TABLE IF EXISTS studio_categories");
  await run("DROP TABLE IF EXISTS studio_levels");

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // Esegui gli statement dello schema
  const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    await run(statement);
  }

  // Verifica se l'utente demo esiste già
  let demoUser = await get("SELECT * FROM users WHERE username = 'demo_user'");
  if (!demoUser) {
    const userRes = await run(
      "INSERT INTO users (username, email, total_capital) VALUES (?, ?, ?)",
      ['demo_user', 'demo@nexusai.local', 10000.0]
    );
    demoUser = { id: userRes.id, username: 'demo_user', total_capital: 10000.0 };
    console.log('Utente demo iniziale pronto (senza posizioni preesistenti).');
  }

  // Seed delle 30 lezioni Studio
  await seedStudioData();

  console.log('Database pulito e pronto all\'uso con 30 lezioni caricate!');
}

seed().catch((err) => {
  console.error('Errore durante il seeding:', err);
  process.exit(1);
});
