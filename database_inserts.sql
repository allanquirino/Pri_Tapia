-- SQL Script for Inserting Default Data into PriTapia NGO Database
-- Run this after creating tables in cPanel PhpMyAdmin SQL tab
-- Database: hg0e7639_PriTapia (should already be selected)
-- NOTE: If you get "duplicate entry" errors, the data is already inserted - you can skip this script

-- Insert default admin user (skip if already exists)
INSERT IGNORE INTO users (id, username, password, role, isActive, createdAt) VALUES
('user_admin_001', 'PriTapiaAdmin', 'PriTapia2025', 'admin', 1, '2025-11-13 00:00:00'),
('user_admin_002', 'Wexio', 'Wexio', 'admin', 1, '2025-11-13 00:00:00');

-- Insert default animal owners (skip if already exists)
INSERT IGNORE INTO clients (id, name, email, phone, lastVisit, totalVisits, createdAt, updatedAt) VALUES
('client_001', 'João Silva', 'joao.silva@exemplo.com', '(21) 99876-5432', '2025-11-10', 3, '2025-10-01 00:00:00', '2025-11-10 00:00:00'),
('client_002', 'Maria Santos', 'maria.santos@exemplo.com', '(31) 98765-4321', '2025-11-08', 2, '2025-10-15 00:00:00', '2025-11-08 00:00:00'),
('client_003', 'Pedro Costa', 'pedro.costa@exemplo.com', '(41) 97654-3210', '2025-11-05', 4, '2025-09-20 00:00:00', '2025-11-05 00:00:00');

-- Insert default appointments (skip if already exists)
INSERT IGNORE INTO appointments (id, clientId, clientName, service, date, time, duration, status, price, createdAt, updatedAt) VALUES
('appt_001', 'client_001', 'João Silva', 'Consulta Veterinária', '2025-11-13', '10:00:00', '60 min', 'confirmado', 50.00, '2025-11-13 08:00:00', '2025-11-13 08:00:00'),
('appt_002', 'client_002', 'Maria Santos', 'Adoção de Pet', '2025-11-13', '11:30:00', '90 min', 'confirmado', 0.00, '2025-11-13 09:00:00', '2025-11-13 09:00:00');

-- Insert default products (skip if already exists)
INSERT IGNORE INTO products (id, name, category, quantity, minQuantity, unit, price, createdAt, updatedAt) VALUES
('prod_001', 'Ração Premium para Cães', 'Alimentação', 45, 20, 'sacos', 'R$ 89,90', '2025-11-01 00:00:00', '2025-11-01 00:00:00'),
('prod_002', 'Coleira Antipulgas', 'Acessórios', 12, 15, 'unidades', 'R$ 45,00', '2025-11-01 00:00:00', '2025-11-01 00:00:00');

-- Insert default transactions (skip if already exists)
INSERT IGNORE INTO transactions (id, type, description, category, amount, date, clientId, appointmentId, createdAt, updatedAt) VALUES
('trans_001', 'receita', 'Doação - João Silva', 'Doações', 150.00, '2025-11-13', 'client_001', NULL, '2025-11-13 10:30:00', '2025-11-13 10:30:00');

-- Insert default settings (skip if already exists)
INSERT IGNORE INTO settings (id, businessName, address, phone, email, businessHours, currency, language, theme) VALUES
('settings_001', 'PriTapia ONG', 'Avenida Imaginária, 456 - Bairro Novo, Rio de Janeiro - RJ, 12345-678', '(21) 88888-8888', 'info@pritapia.org',
'{"segunda": {"open": "08:00", "close": "18:00", "closed": true}, "terca": {"open": "08:00", "close": "18:00", "closed": false}, "quarta": {"open": "08:00", "close": "18:00", "closed": false}, "quinta": {"open": "08:00", "close": "18:00", "closed": false}, "sexta": {"open": "08:00", "close": "18:00", "closed": false}, "sabado": {"open": "08:00", "close": "18:00", "closed": false}, "domingo": {"open": "08:00", "close": "18:00", "closed": true}}',
'BRL', 'pt-BR', 'auto');

-- Insert initial audit log (skip if already exists)
INSERT IGNORE INTO audit_logs (id, action, user, timestamp, details, module) VALUES
('audit_001', 'Database operation', 'System', '2025-11-13 00:00:00', 'Database initialized with default data', 'Database');