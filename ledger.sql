CREATE TABLE IF NOT EXISTS teacher_ledgers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL, -- 'earning' or 'payout'
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
