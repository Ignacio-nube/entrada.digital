import express, { type Request, type Response, type NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL (Supabase) con manejo de reconexión
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 10000, // timeout de conexión 10s
});

// Manejar errores del pool para evitar crashes
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err.message);
    // No hacer process.exit, dejar que el pool se recupere
});

// Test DB Connection
pool.connect()
    .then(client => {
        console.log('Conectado a la base de datos PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
    });

// Interfaces
interface TipoEntrada {
    id: number;
    evento_id: number;
    nombre: string;
    precio: string;
    stock: number;
}

interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    lugar: string;
    imagen_url: string;
}

interface Cliente {
    id?: number;
    nombre: string;
    email: string;
}

interface Ticket {
    id?: number;
    cliente_id: number;
    tipo_entrada_id: number;
    codigo_qr: string;
    metodo_pago: string;
    usado?: boolean;
}

// Middleware de Autenticación
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        (req as any).user = user;
        next();
    });
};

// Middleware de Roles
const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !roles.includes(user.rol)) {
            res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
            return;
        }
        next();
    };
};

// Rutas

// 0. Login
app.post('/api/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });

        res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// 0.1 Registro (Solo Organizadores)
app.post('/api/register', async (req: Request, res: Response) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        res.status(400).json({ error: 'Todos los campos son obligatorios' });
        return;
    }

    try {
        // Verificar si el usuario ya existe
        const checkUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            res.status(400).json({ error: 'El email ya está registrado' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = 'organizador'; // Por defecto

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
            [nombre, email, hashedPassword, rol]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });

        res.json({ token, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// 1. Listar Eventos
app.get('/api/eventos', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM eventos ORDER BY fecha ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// 1.1 Crear Evento (Protegido) - Ahora con Tipos de Entrada
app.post('/api/eventos', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const { titulo, descripcion, fecha, lugar, imagen_url, tipos_entrada } = req.body;
    const usuario_id = (req as any).user.id;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insertar Evento
        const eventoResult = await client.query(
            'INSERT INTO eventos (titulo, descripcion, fecha, lugar, imagen_url, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [titulo, descripcion, fecha, lugar, imagen_url, usuario_id]
        );
        const eventoId = eventoResult.rows[0].id;

        // 2. Insertar Tipos de Entrada
        if (tipos_entrada && Array.isArray(tipos_entrada) && tipos_entrada.length > 0) {
            for (const t of tipos_entrada) {
                await client.query(
                    'INSERT INTO tipos_entrada (evento_id, nombre, precio, stock) VALUES ($1, $2, $3, $4)',
                    [eventoId, t.nombre, t.precio, t.stock]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ id: eventoId, message: 'Evento y entradas creados exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al crear evento' });
    } finally {
        client.release();
    }
});

// 1.2 Eliminar Evento (Protegido)
app.delete('/api/eventos/:id', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;
    try {
        // Si es admin, borra cualquiera. Si es organizador, solo los suyos.
        if (user.rol === 'admin') {
            await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
        } else {
            const result = await pool.query('DELETE FROM eventos WHERE id = $1 AND usuario_id = $2', [id, user.id]);
            if (result.rowCount === 0) {
                res.status(403).json({ error: 'No tienes permiso para eliminar este evento o no existe' });
                return;
            }
        }
        res.json({ message: 'Evento eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar evento' });
    }
});

// 1.3 Mis Eventos (Protegido - Para Dashboard)
app.get('/api/mis-eventos', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const user = (req as any).user;
    try {
        let query = 'SELECT * FROM eventos';
        const params = [];

        if (user.rol !== 'admin') {
            query += ' WHERE usuario_id = $1';
            params.push(user.id);
        }
        
        query += ' ORDER BY fecha ASC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener mis eventos' });
    }
});

// 1.4 Editar Evento (Protegido)
app.put('/api/eventos/:id', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { titulo, descripcion, fecha, lugar, imagen_url, tipos_entrada } = req.body;
    const user = (req as any).user;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar permisos
        if (user.rol !== 'admin') {
            const check = await client.query('SELECT * FROM eventos WHERE id = $1 AND usuario_id = $2', [id, user.id]);
            if (check.rows.length === 0) {
                await client.query('ROLLBACK');
                res.status(403).json({ error: 'No tienes permiso para editar este evento' });
                return;
            }
        }

        // Actualizar Evento
        await client.query(
            'UPDATE eventos SET titulo = $1, descripcion = $2, fecha = $3, lugar = $4, imagen_url = $5 WHERE id = $6',
            [titulo, descripcion, fecha, lugar, imagen_url, id]
        );

        // Actualizar o Crear Tipos de Entrada
        if (tipos_entrada && Array.isArray(tipos_entrada)) {
            for (const tipo of tipos_entrada) {
                if (tipo.id) {
                    // Actualizar existente
                    await client.query(
                        'UPDATE tipos_entrada SET nombre = $1, precio = $2, stock = $3 WHERE id = $4 AND evento_id = $5',
                        [tipo.nombre, tipo.precio, tipo.stock, tipo.id, id]
                    );
                } else {
                    // Crear nuevo
                    await client.query(
                        'INSERT INTO tipos_entrada (evento_id, nombre, precio, stock) VALUES ($1, $2, $3, $4)',
                        [id, tipo.nombre, tipo.precio, tipo.stock]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Evento actualizado correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar evento' });
    } finally {
        client.release();
    }
});

// 1.5 Obtener Tickets de un Evento (Protegido)
app.get('/api/eventos/:id/tickets', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;

    try {
        // Verificar permisos
        if (user.rol !== 'admin') {
            const check = await pool.query('SELECT * FROM eventos WHERE id = $1 AND usuario_id = $2', [id, user.id]);
            if (check.rows.length === 0) {
                res.status(403).json({ error: 'No tienes permiso para ver los tickets de este evento' });
                return;
            }
        }

        const query = `
            SELECT 
                t.id, t.codigo_qr, t.usado, t.metodo_pago,
                te.nombre as tipo_entrada, te.precio,
                c.nombre as cliente_nombre, c.email as cliente_email
            FROM tickets t
            JOIN tipos_entrada te ON t.tipo_entrada_id = te.id
            JOIN clientes c ON t.cliente_id = c.id
            WHERE te.evento_id = $1
        `;
        
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tickets' });
    }
});

// 2. Detalle de Evento y Tipos de Entrada
app.get('/api/eventos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const eventos = await pool.query('SELECT * FROM eventos WHERE id = $1', [id]);
        if (eventos.rows.length === 0) {
            res.status(404).json({ error: 'Evento no encontrado' });
            return;
        }

        const tipos = await pool.query('SELECT * FROM tipos_entrada WHERE evento_id = $1', [id]);
        
        res.json({ ...eventos.rows[0], tipos_entrada: tipos.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el evento' });
    }
});

// 3. Comprar Ticket
app.post('/api/comprar', async (req: Request, res: Response) => {
    const { nombre, email, tipo_entrada_id, cantidad, metodo_pago } = req.body;
    
    if (!nombre || !email || !tipo_entrada_id || !cantidad) {
        res.status(400).json({ error: 'Faltan datos requeridos' });
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Verificar Stock
        const tipos = await client.query('SELECT * FROM tipos_entrada WHERE id = $1 FOR UPDATE', [tipo_entrada_id]);
        if (tipos.rows.length === 0) throw new Error('Tipo de entrada no válido');
        const tipo = tipos.rows[0];

        if (tipo.stock < cantidad) {
            throw new Error('No hay suficiente stock');
        }

        // 2. Crear o Buscar Cliente
        const clienteResult = await client.query(
            'INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING id',
            [nombre, email]
        );
        const clienteId = clienteResult.rows[0].id;

        // 3. Crear Tickets y Actualizar Stock
        const ticketsGenerados = [];
        for (let i = 0; i < cantidad; i++) {
            const codigoQr = uuidv4();
            await client.query(
                'INSERT INTO tickets (cliente_id, tipo_entrada_id, codigo_qr, metodo_pago) VALUES ($1, $2, $3, $4)',
                [clienteId, tipo_entrada_id, codigoQr, metodo_pago]
            );
            ticketsGenerados.push({ codigo_qr: codigoQr });
        }

        await client.query('UPDATE tipos_entrada SET stock = stock - $1 WHERE id = $2', [cantidad, tipo_entrada_id]);

        await client.query('COMMIT');

        res.json({
            mensaje: 'Compra exitosa',
            cliente: { nombre, email },
            tickets: ticketsGenerados
        });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: error.message || 'Error en la compra' });
    } finally {
        client.release();
    }
});

// 4. Validar QR (Para saber si fue usado)
app.post('/api/validar-qr', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const { codigo_qr } = req.body;
    try {
        const query = `
            SELECT t.*, te.nombre as tipo_entrada, te.precio, e.titulo as evento, e.id as evento_id,
                   c.nombre as cliente_nombre, c.email as cliente_email
            FROM tickets t
            JOIN tipos_entrada te ON t.tipo_entrada_id = te.id
            JOIN eventos e ON te.evento_id = e.id
            JOIN clientes c ON t.cliente_id = c.id
            WHERE t.codigo_qr = $1
        `;
        const result = await pool.query(query, [codigo_qr]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Ticket no encontrado o inválido' });
            return;
        }

        const ticket = result.rows[0];

        // Validar que el usuario tenga permiso sobre este evento (si es organizador)
        const user = (req as any).user;
        if (user.rol !== 'admin') {
             const eventCheck = await pool.query('SELECT * FROM eventos WHERE id = $1 AND usuario_id = $2', [ticket.evento_id, user.id]);
             if (eventCheck.rows.length === 0) {
                 res.status(403).json({ message: 'No tienes permiso para validar tickets de este evento' });
                 return;
             }
        }

        if (ticket.usado) {
            res.status(400).json({ message: 'Este ticket YA FUE USADO anteriormente', ticket });
            return;
        }

        // Marcar como usado
        await pool.query('UPDATE tickets SET usado = TRUE WHERE id = $1', [ticket.id]);
        res.json({ message: 'Ticket válido. Acceso permitido.', ticket });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al validar ticket' });
    }
});

// 5. Dashboard Stats (Protegido)
app.get('/api/admin/stats', authenticateToken, authorizeRole(['admin', 'organizador']), async (req: Request, res: Response) => {
    const user = (req as any).user;
    try {
        let ticketsQuery = '';
        let eventosQuery = '';
        const params: any[] = [];

        if (user.rol === 'admin') {
            // Admin ve todo
            ticketsQuery = `
                SELECT 
                    COUNT(*) as total_tickets, 
                    SUM(CASE WHEN tk.usado = TRUE THEN 1 ELSE 0 END) as tickets_usados,
                    COALESCE(SUM(t.precio), 0) as total_ingresos
                FROM tickets tk
                JOIN tipos_entrada t ON tk.tipo_entrada_id = t.id
            `;
            eventosQuery = 'SELECT COUNT(*) as total_eventos FROM eventos';
        } else {
            // Organizador solo ve sus eventos
            ticketsQuery = `
                SELECT 
                    COUNT(*) as total_tickets, 
                    SUM(CASE WHEN tk.usado = TRUE THEN 1 ELSE 0 END) as tickets_usados,
                    COALESCE(SUM(t.precio), 0) as total_ingresos
                FROM tickets tk
                JOIN tipos_entrada t ON tk.tipo_entrada_id = t.id
                JOIN eventos e ON t.evento_id = e.id
                WHERE e.usuario_id = $1
            `;
            eventosQuery = 'SELECT COUNT(*) as total_eventos FROM eventos WHERE usuario_id = $1';
            params.push(user.id);
        }

        const tickets = await pool.query(ticketsQuery, params);
        const eventos = await pool.query(eventosQuery, params);

        res.json({
            tickets: tickets.rows[0],
            eventos: eventos.rows[0].total_eventos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

const PORT = process.env.PORT || 3000;

// Solo escuchar si no estamos en un entorno serverless (Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;
