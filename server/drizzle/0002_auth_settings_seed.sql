INSERT OR IGNORE INTO settings (key, value, created_at, updated_at) VALUES ('auth.disable_registration', 'false', strftime('%s', 'now'), strftime('%s', 'now'));
