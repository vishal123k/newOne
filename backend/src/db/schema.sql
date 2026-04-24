-- USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('client', 'vendor')) NOT NULL,
  company_name TEXT,
  gstin TEXT,
  competencies TEXT,
  service_rate TEXT
);

-- CONTRACTS
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'draft',
  client_id TEXT REFERENCES users(id),
  provider_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);