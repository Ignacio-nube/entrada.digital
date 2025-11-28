import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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

        // 1. Agregar columna usuario_id a eventos
        try {
            await connection.query(`
                ALTER TABLE eventos 
                ADD COLUMN usuario_id INT,
                ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id);
            `);
            console.log('Columna usuario_id agregada a eventos.');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('La columna usuario_id ya existe.');
            } else {
                throw error;
            }
        }

        // 2. Asignar eventos existentes al primer usuario (Admin)
        await connection.query(`
            UPDATE eventos SET usuario_id = (SELECT id FROM usuarios LIMIT 1) WHERE usuario_id IS NULL;
        `);
        console.log('Eventos huérfanos asignados al primer usuario.');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error en migración:', error);
        process.exit(1);
    }
}

migrate();
