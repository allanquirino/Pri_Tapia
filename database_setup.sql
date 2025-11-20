-- SQL Script for PriTapia NGO Database Setup
-- Run this in cPanel PhpMyAdmin SQL tab
-- IMPORTANT: Create the database 'hg0e7639_PriTapia' first in cPanel MySQL Databases section
-- Then select the database and run this script

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    email VARCHAR(255),
    fullName VARCHAR(255),
    isActive TINYINT(1) NOT NULL DEFAULT 1,
    activationToken VARCHAR(64),
    activationSentAt DATETIME,
    createdAt DATETIME NOT NULL,
    lastLogin DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    dateOfBirth DATE NULL,
    lastVisit DATE NOT NULL,
    totalVisits INT DEFAULT 0,
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    clientId VARCHAR(50) NOT NULL,
    clientName VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration VARCHAR(20) NOT NULL,
    status ENUM('confirmado', 'pendente', 'cancelado', 'concluido') NOT NULL DEFAULT 'pendente',
    price DECIMAL(10,2) NULL,
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minQuantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    price VARCHAR(20) NOT NULL,
    supplier VARCHAR(255),
    description TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('receita', 'despesa') NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    paymentMethod VARCHAR(50),
    clientId VARCHAR(50) NULL,
    appointmentId VARCHAR(50) NULL,
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    user VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL,
    details TEXT NOT NULL,
    module VARCHAR(100) NOT NULL,
    ipAddress VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY,
    businessName VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    businessHours JSON NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    theme ENUM('light', 'dark', 'auto') NOT NULL DEFAULT 'auto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers to maintain updatedAt timestamps
DELIMITER $$
CREATE TRIGGER trg_clients_before_update
BEFORE UPDATE ON clients
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER trg_appointments_before_update
BEFORE UPDATE ON appointments
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER trg_products_before_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER trg_transactions_before_update
BEFORE UPDATE ON transactions
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$


-- Audit triggers for inserts
CREATE TRIGGER trg_appointments_after_insert
AFTER INSERT ON appointments
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (id, action, user, timestamp, details, module)
  VALUES (CONCAT(DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), FLOOR(RAND()*9000)+1000), 'Appointment Created', 'System', NOW(), CONCAT('Service: ', NEW.service, ' for ', NEW.clientName), 'Appointment Management');
END$$

CREATE TRIGGER trg_transactions_after_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (id, action, user, timestamp, details, module)
  VALUES (CONCAT(DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), FLOOR(RAND()*9000)+1000), 'Transaction Created', 'System', NOW(), CONCAT(NEW.type, ' - ', NEW.description), 'Financial Management');
END$$

DELIMITER ;

-- System logs table for operations, tests and performance metrics
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(20),
    durationMs INT,
    createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Google Calendar integration tables
CREATE TABLE IF NOT EXISTS google_tokens (
  userId VARCHAR(50) PRIMARY KEY,
  accessToken TEXT NOT NULL,
  refreshToken TEXT,
  expiresAt DATETIME NOT NULL,
  scope VARCHAR(50),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calendar_channels (
  userId VARCHAR(50) NOT NULL,
  channelId VARCHAR(100) PRIMARY KEY,
  resourceId VARCHAR(200) NOT NULL,
  resourceUri TEXT,
  expiration DATETIME,
  syncToken TEXT,
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security: 2FA for admins
ALTER TABLE users
  ADD COLUMN twoFactorEnabled TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN twoFactorSecret VARCHAR(64) NULL;

-- Pets core tables
CREATE TABLE IF NOT EXISTS pets (
  id VARCHAR(50) PRIMARY KEY,
  ownerId VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  species ENUM('cachorro','gato','outro') NOT NULL,
  breed VARCHAR(100),
  birthDate DATE,
  sex ENUM('macho','femea','indefinido') NOT NULL,
  weightKg DECIMAL(5,2),
  color VARCHAR(50),
  medicalHistory TEXT,
  allergies TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pet_photos (
  id VARCHAR(50) PRIMARY KEY,
  petId VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  mimeType VARCHAR(50) NOT NULL,
  sizeBytes INT NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Articles for pet care
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  category ENUM('saude','alimentacao','bem_estar','racas') NOT NULL,
  tags JSON,
  reviewedBy VARCHAR(255),
  isReviewed TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_articles_category ON articles (category);
CREATE INDEX idx_articles_created ON articles (createdAt);

-- Clinics with specialties and ratings
CREATE TABLE IF NOT EXISTS clinics (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  phone VARCHAR(20),
  website VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinic_specialties (
  clinicId VARCHAR(50) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  PRIMARY KEY (clinicId, specialty),
  FOREIGN KEY (clinicId) REFERENCES clinics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinic_ratings (
  id VARCHAR(50) PRIMARY KEY,
  clinicId VARCHAR(50) NOT NULL,
  userId VARCHAR(50) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (clinicId) REFERENCES clinics(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forum: categories, topics, posts, votes, reputation
CREATE TABLE IF NOT EXISTS forum_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_topics (
  id VARCHAR(50) PRIMARY KEY,
  categoryId VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  authorId VARCHAR(50) NOT NULL,
  isLocked TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES forum_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_posts (
  id VARCHAR(50) PRIMARY KEY,
  topicId VARCHAR(50) NOT NULL,
  authorId VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  isHidden TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (topicId) REFERENCES forum_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_post_votes (
  postId VARCHAR(50) NOT NULL,
  userId VARCHAR(50) NOT NULL,
  value TINYINT NOT NULL,
  createdAt DATETIME NOT NULL,
  PRIMARY KEY (postId, userId),
  FOREIGN KEY (postId) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_reputation (
  userId VARCHAR(50) PRIMARY KEY,
  points INT NOT NULL DEFAULT 0,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendar: events and reminders
CREATE TABLE IF NOT EXISTS calendar_events (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  petId VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  eventDate DATE NOT NULL,
  eventTime TIME,
  type ENUM('vacina','consulta','banho','outro') NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reminders (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  remindAt DATETIME NOT NULL,
  priority ENUM('baixa','media','alta') NOT NULL DEFAULT 'media',
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vaccination schedule per pet
CREATE TABLE IF NOT EXISTS vaccination_schedule (
  id VARCHAR(50) PRIMARY KEY,
  petId VARCHAR(50) NOT NULL,
  vaccine VARCHAR(100) NOT NULL,
  scheduledDate DATE NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backups registry
CREATE TABLE IF NOT EXISTS backups (
  id VARCHAR(50) PRIMARY KEY,
  filePath TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL,
  details TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts with prioritization
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
  scheduledAt DATETIME NULL,
  createdAt DATETIME NOT NULL,
  createdBy VARCHAR(50) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_alerts_priority ON alerts (priority);

-- Procedures for critical operations
DELIMITER $$
CREATE PROCEDURE sp_mark_vaccination_done(IN p_id VARCHAR(50))
BEGIN
  UPDATE vaccination_schedule SET done = 1, updatedAt = NOW() WHERE id = p_id;
END$$

CREATE PROCEDURE sp_backup_registry(IN p_path TEXT, IN p_status VARCHAR(20), IN p_details TEXT)
BEGIN
  INSERT INTO backups (id, filePath, createdAt, status, details)
  VALUES (CONCAT(DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), FLOOR(RAND()*9000)+1000), p_path, NOW(), p_status, p_details);
END$$
DELIMITER ;

-- Indexes and performance
CREATE INDEX idx_pets_owner ON pets (ownerId);
CREATE INDEX idx_calendar_events_user ON calendar_events (userId, eventDate);
CREATE INDEX idx_reminders_user ON reminders (userId, remindAt);

CREATE TABLE IF NOT EXISTS calendar_event_links (
  userId VARCHAR(50) NOT NULL,
  crmAppointmentId VARCHAR(50) NOT NULL,
  googleEventId VARCHAR(200) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (userId, crmAppointmentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored Procedures for common operations
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_add_user$$
CREATE PROCEDURE sp_add_user(IN p_id VARCHAR(50), IN p_username VARCHAR(100), IN p_password VARCHAR(255), IN p_role VARCHAR(10))
BEGIN
  INSERT INTO users (id, username, password, role, createdAt)
  VALUES (p_id, p_username, p_password, IF(p_role IN ('admin','user'), p_role, 'user'), NOW());
END$$

DROP PROCEDURE IF EXISTS sp_add_client$$
CREATE PROCEDURE sp_add_client(
  IN p_id VARCHAR(50), IN p_name VARCHAR(255), IN p_email VARCHAR(255), IN p_phone VARCHAR(20),
  IN p_address TEXT, IN p_dateOfBirth DATE, IN p_lastVisit DATE, IN p_totalVisits INT, IN p_notes TEXT
)
BEGIN
  INSERT INTO clients (id, name, email, phone, address, dateOfBirth, lastVisit, totalVisits, notes, createdAt, updatedAt)
  VALUES (p_id, p_name, p_email, p_phone, p_address, p_dateOfBirth, p_lastVisit, COALESCE(p_totalVisits,0), p_notes, NOW(), NOW());
END$$

DROP PROCEDURE IF EXISTS sp_add_appointment$$
CREATE PROCEDURE sp_add_appointment(
  IN p_id VARCHAR(50), IN p_clientId VARCHAR(50), IN p_clientName VARCHAR(255), IN p_service VARCHAR(255),
  IN p_date DATE, IN p_time TIME, IN p_duration VARCHAR(20), IN p_status VARCHAR(20), IN p_price DECIMAL(10,2), IN p_notes TEXT
)
BEGIN
  INSERT INTO appointments (id, clientId, clientName, service, date, time, duration, status, price, notes, createdAt, updatedAt)
  VALUES (p_id, p_clientId, p_clientName, p_service, p_date, p_time, p_duration, IF(p_status IN ('confirmado','pendente','cancelado','concluido'), p_status, 'pendente'), p_price, p_notes, NOW(), NOW());
END$$

DROP PROCEDURE IF EXISTS sp_add_product$$
CREATE PROCEDURE sp_add_product(
  IN p_id VARCHAR(50), IN p_name VARCHAR(255), IN p_category VARCHAR(100), IN p_quantity INT, IN p_minQuantity INT,
  IN p_unit VARCHAR(50), IN p_price VARCHAR(20), IN p_supplier VARCHAR(255), IN p_description TEXT
)
BEGIN
  INSERT INTO products (id, name, category, quantity, minQuantity, unit, price, supplier, description, createdAt, updatedAt)
  VALUES (p_id, p_name, p_category, COALESCE(p_quantity,0), COALESCE(p_minQuantity,0), p_unit, p_price, p_supplier, p_description, NOW(), NOW());
END$$

DROP PROCEDURE IF EXISTS sp_add_transaction$$
CREATE PROCEDURE sp_add_transaction(
  IN p_id VARCHAR(50), IN p_type VARCHAR(10), IN p_description VARCHAR(255), IN p_category VARCHAR(100),
  IN p_amount DECIMAL(10,2), IN p_date DATE, IN p_paymentMethod VARCHAR(50), IN p_clientId VARCHAR(50), IN p_appointmentId VARCHAR(50), IN p_notes TEXT
)
BEGIN
  INSERT INTO transactions (id, type, description, category, amount, date, paymentMethod, clientId, appointmentId, notes, createdAt, updatedAt)
  VALUES (p_id, IF(p_type IN ('receita','despesa'), p_type, 'receita'), p_description, p_category, p_amount, p_date, p_paymentMethod, p_clientId, p_appointmentId, p_notes, NOW(), NOW());
END$$

DROP PROCEDURE IF EXISTS sp_get_statistics$$
CREATE PROCEDURE sp_get_statistics()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM clients) AS totalClients,
    (SELECT COUNT(*) FROM appointments WHERE date = CURDATE()) AS todayAppointments,
    (SELECT COUNT(*) FROM products) AS totalProducts,
    (SELECT COUNT(*) FROM products WHERE quantity <= minQuantity) AS lowStockProducts,
    (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type = 'receita' AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS monthlyRevenue,
    (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type = 'receita') AS totalRevenue;
END$$
DELIMITER ;

-- Indexes
CREATE INDEX idx_clients_name ON clients (name);
CREATE INDEX idx_appointments_date ON appointments (date);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_products_name ON products (name);
CREATE INDEX idx_transactions_date ON transactions (date);
CREATE INDEX idx_transactions_type ON transactions (type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);

-- News table
CREATE TABLE IF NOT EXISTS novidades (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    authorId VARCHAR(50) NULL,
    createdAt DATETIME NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Castration registrations table
CREATE TABLE IF NOT EXISTS castration_registrations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    animal_type ENUM('gato', 'cachorro') NOT NULL,
    sex ENUM('macho', 'femea') NOT NULL,
    age VARCHAR(50),
    castration_status ENUM('castrado', 'nao_castrado') NOT NULL,
    vaccines_up_to_date TINYINT(1) NOT NULL DEFAULT 0,
    called TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers for castration_registrations
DELIMITER $$
CREATE TRIGGER trg_castration_registrations_before_update
BEFORE UPDATE ON castration_registrations
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER trg_castration_registrations_after_insert
AFTER INSERT ON castration_registrations
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (id, action, user, timestamp, details, module)
  VALUES (CONCAT(DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), FLOOR(RAND()*9000)+1000), 'Castration Registration Created', 'System', NOW(), CONCAT('Animal: ', NEW.animal_type, ' - Owner: ', NEW.name), 'Castration Management');
END$$
DELIMITER ;

-- PhpMyAdmin Import Instructions:
-- 1) No PhpMyAdmin, selecione o banco 'hg0e7639_PriTapia'.
-- 2) Abra a aba SQL e cole todo este script.
-- 3) Execute. Se algum objeto já existir, será ignorado.
-- 4) Em seguida importe os dados iniciais via 'database_inserts.sql'.
