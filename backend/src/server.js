const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const { pool } = require('../config');
const routes = require('./routes/index');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================

// 1. Helmet - Cabeceras de seguridad
app.use(helmet());

// 2. CORS - PERMITIR TODOS LOS ORÍGENES (para pruebas)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate limiting global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 peticiones por IP
    message: { message: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos.' }
});
app.use('/api', globalLimiter);

// 4. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Rutas
app.use('/api', routes);

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor Banco Falabella funcionando correctamente' });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Banco Falabella API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            cuentas: '/api/cuentas',
            transferencias: '/api/transferencias',
            tarjetas: '/api/tarjetas',
            prestamos: '/api/prestamos',
            creditos: '/api/creditos',
            analytics: '/api/analytics',
            recuperaciones: '/api/recuperaciones',
            exportar: '/api/exportar'
        }
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente (Sequelize)');
    } catch (error) {
        console.error('❌ Error al conectar a PostgreSQL (Sequelize):', error.message);
    }
    
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL establecida correctamente (Pool)');
        client.release();
    } catch (error) {
        console.error('❌ Error al conectar a PostgreSQL (Pool):', error.message);
    }
});