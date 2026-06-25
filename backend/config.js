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

// Verificar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

// Crear la configuración del pool
let poolConfig = {};

if (process.env.DATABASE_URL) {
    console.log('🔵 Usando DATABASE_URL para conexión Pool');
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    console.log('🔵 Usando variables individuales para conexión local');
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'db_banco_falabella',
    };
    
    // En producción local con SSL
    if (isProduction) {
        poolConfig.ssl = {
            rejectUnauthorized: false
        };
    }
}

// Crear el pool de conexiones
const pool = new Pool(poolConfig);

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