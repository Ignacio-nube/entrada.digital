-- Base de datos para Entrada Digital

CREATE DATABASE IF NOT EXISTS entrada_digital;
USE entrada_digital;

-- Tabla de Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    imagen_url VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tipos de Entrada (ej. General, VIP)
CREATE TABLE IF NOT EXISTS tipos_entrada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Tabla de Clientes (Usuarios que compran)
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- No hacemos email UNIQUE estricto para permitir compras de invitados repetidas, 
    -- o se puede manejar lógica de "si existe, usar ese id".
);

-- Tabla de Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_entrada_id INT NOT NULL,
    codigo_qr VARCHAR(255) NOT NULL UNIQUE, -- UUID o hash único
    usado BOOLEAN DEFAULT FALSE,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50) DEFAULT 'tarjeta', -- simulado
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (tipo_entrada_id) REFERENCES tipos_entrada(id)
);

-- Tabla de Usuarios (Admin / Organizador)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'organizador') NOT NULL DEFAULT 'organizador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de Prueba (Seed)

-- Eventos
INSERT INTO eventos (titulo, descripcion, fecha, lugar, imagen_url) VALUES 
('Concierto de Rock Estelar', 'La mejor banda de rock en vivo.', '2025-12-15 20:00:00', 'Estadio Nacional', 'https://images.unsplash.com/photo-1459749411177-0473ef716070?auto=format&fit=crop&q=80&w=800'),
('Festival de Jazz Nocturno', 'Una noche mágica con los mejores saxofonistas.', '2025-11-30 19:00:00', 'Teatro Municipal', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800'),
('Tech Summit 2025', 'Conferencia sobre el futuro de la tecnología.', '2026-01-20 09:00:00', 'Centro de Convenciones', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800');

-- Tipos de Entrada
-- Para Concierto de Rock (ID 1)
INSERT INTO tipos_entrada (evento_id, nombre, precio, stock) VALUES 
(1, 'General', 50.00, 1000),
(1, 'VIP', 150.00, 100);

-- Para Festival de Jazz (ID 2)
INSERT INTO tipos_entrada (evento_id, nombre, precio, stock) VALUES 
(2, 'Entrada Única', 35.00, 300);

-- Para Tech Summit (ID 3)
INSERT INTO tipos_entrada (evento_id, nombre, precio, stock) VALUES 
(3, 'Estudiante', 20.00, 500),
(3, 'Profesional', 100.00, 500);
