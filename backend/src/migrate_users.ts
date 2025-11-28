import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'entrada_digital',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function migrate() {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado a la DB.');

        // Crear tabla usuarios
        await connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol ENUM('admin', 'organizador') NOT NULL DEFAULT 'organizador',
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tabla usuarios verificada/creada.');

        // Hash passwords
        const adminPass = await bcrypt.hash('admin123', 10);
        const orgPass = await bcrypt.hash('org123', 10);

        // Insertar usuarios si no existen
        // Usamos INSERT IGNORE para evitar errores si ya existen (por el email UNIQUE)
        await connection.query(`
            INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES 
            ('Administrador', 'admin@entrada.digital', ?, 'admin'),
            ('Organizador', 'org@entrada.digital', ?, 'organizador');
        `, [adminPass, orgPass]);

        console.log('Usuarios semilla insertados.');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error en migración:', error);
        process.exit(1);
    }
}

migrate();
