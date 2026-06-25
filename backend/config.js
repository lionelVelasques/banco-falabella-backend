const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Configuración básica
const config = {
    port: process.env.PORT || 5000,
    jwt: {
        secret: process.env.JWT_SECRET || 'banco_falabella_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
};

// ============================================================
// CONFIGURACIÓN DE LA BASE DE DATOS CON SSL
// ============================================================

let pool;

if (process.env.DATABASE_URL) {
    console.log('🔵 Usando DATABASE_URL para conexión Pool');
    // En producción (Render), usar la URL completa con SSL
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Necesario para Neon
        }
    });
} else {
    console.log('🔵 Usando variables individuales para conexión local');
    // En desarrollo local, usar variables separadas
    pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'db_banco_falabella',
        ssl: false // Local no necesita SSL
    });
}

// Probar la conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL (Pool):', err.message);
    } else {
        console.log('✅ Conexión a PostgreSQL establecida correctamente (Pool)');
        release();
    }
});

module.exports = {
    ...config,
    pool
};