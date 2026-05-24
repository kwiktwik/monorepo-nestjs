-- Client diagnostic events table
CREATE TABLE IF NOT EXISTS client_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  app_id TEXT NOT NULL,
  user_id TEXT,
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  payload TEXT,
  client_timestamp TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Query by event type + time range (monitoring dashboards)
CREATE INDEX IF NOT EXISTS idx_events_type_time ON client_events(event_type, created_at);

-- Query by user + time range (debugging specific user)
CREATE INDEX IF NOT EXISTS idx_events_user_time ON client_events(user_id, created_at);

-- Query by app + time range (multi-app filtering)
CREATE INDEX IF NOT EXISTS idx_events_app_time ON client_events(app_id, created_at);