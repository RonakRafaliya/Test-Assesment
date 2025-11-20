-- Schema definition ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS role (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  ownerId TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_attachment (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  path TEXT NOT NULL,
  taskId TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES task(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_roles_role (
  userId TEXT NOT NULL,
  roleId TEXT NOT NULL,
  PRIMARY KEY (userId, roleId),
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_assignees_user (
  taskId TEXT NOT NULL,
  userId TEXT NOT NULL,
  PRIMARY KEY (taskId, userId),
  FOREIGN KEY (taskId) REFERENCES task(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Sample data ---------------------------------------------------------------

INSERT OR IGNORE INTO role (id, name) VALUES
  ('7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f', 'admin'),
  ('52aef89e-4ba0-4c6c-9c2c-3c9a2432f795', 'manager'),
  ('bdf7d1c7-8431-44e0-8f72-8f0bb7a64552', 'user');

INSERT OR IGNORE INTO "user" (id, email, password, firstName, lastName) VALUES
  ('5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', 'admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZ2uE3obVhtSGcVwqDAVBBusfvEvFO', 'Ada', 'Admin'),
  ('9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', 'manager@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZ2uE3obVhtSGcVwqDAVBBusfvEvFO', 'Manny', 'Manager'),
  ('1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', 'teammate@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZ2uE3obVhtSGcVwqDAVBBusfvEvFO', 'Tia', 'Teammate');

INSERT OR IGNORE INTO user_roles_role (userId, roleId) VALUES
  ('5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6', '7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f'),
  ('9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f', '52aef89e-4ba0-4c6c-9c2c-3c9a2432f795'),
  ('1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b', 'bdf7d1c7-8431-44e0-8f72-8f0bb7a64552');

INSERT OR IGNORE INTO task (id, title, description, status, ownerId) VALUES
  ('11111111-2222-3333-4444-555555555555', 'Kickoff demo', 'Walk through the project structure with the candidate.', 'in_progress', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6'),
  ('66666666-7777-8888-9999-000000000000', 'Design wireframes', 'Create mobile + desktop mockups for the task board.', 'todo', '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f'),
  ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', 'Implement carousel', 'Build the auto-flip dashboard carousel.', 'done', '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b');

INSERT OR IGNORE INTO task_assignees_user (taskId, userId) VALUES
  ('11111111-2222-3333-4444-555555555555', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6'),
  ('66666666-7777-8888-9999-000000000000', '9c6b7f32-1a2b-4c5d-8e9f-0a1b2c3d4e5f'),
  ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', '1f2e3d4c-5b6a-7988-9a0b-1c2d3e4f5a6b'),
  ('aaaaaaa1-bbbb-cccc-dddd-eeeeeeeeeeee', '5e8f6cf4-3a8d-4a9b-a588-519d2f75b9c6');

-- End of file ----------------------------------------------------------------

