-- DDL Schema Database per Nexus AI

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  total_capital REAL NOT NULL DEFAULT 10000.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  asset TEXT NOT NULL,
  quantity REAL NOT NULL,
  entry_price REAL NOT NULL,
  current_price REAL NOT NULL,
  category TEXT NOT NULL,
  stop_loss REAL,
  take_profit REAL,
  opened_by TEXT NOT NULL DEFAULT 'manual' CHECK(opened_by IN ('manual', 'ai')),
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  asset TEXT NOT NULL,
  quantity REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('market', 'limit')),
  stop_loss REAL,
  take_profit REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'executed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS closed_trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  asset TEXT NOT NULL,
  quantity REAL NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL NOT NULL,
  pnl REAL NOT NULL,
  result TEXT NOT NULL CHECK(result IN ('win', 'loss')),
  emotional_tag TEXT CHECK(emotional_tag IN ('Calmo', 'Ansioso', 'FOMO', 'Vendetta', NULL)),
  closed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS studio_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS studio_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (level_id) REFERENCES studio_levels(id)
);

CREATE TABLE IF NOT EXISTS studio_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  duration TEXT NOT NULL,
  intro_text TEXT NOT NULL,
  manual_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES studio_categories(id)
);

CREATE TABLE IF NOT EXISTS studio_interactive_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('chart_walkthrough', 'chart_quiz', 'chart_drawable')),
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  config_json TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES studio_lessons(id)
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES studio_lessons(id)
);
