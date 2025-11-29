import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdmin() {
    const nombre = 'Admin';
    const email = 'admin@entrada.digital';
    const password = 'admin123'; // Contraseña por defecto
    const rol = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const res = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, email, hashedPassword, rol]
        );

        console.log('Usuario Admin creado exitosamente:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('ID:', res.rows[0].id);

    } catch (error: any) {
        if (error.code === '23505') {
            console.error('Error: El usuario admin ya existe (email duplicado).');
        } else {
            console.error('Error al crear usuario admin:', error);
        }
    } finally {
        await pool.end();
    }
}

createAdmin();
