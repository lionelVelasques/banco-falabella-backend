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

// Usar DATABASE_URL si está disponible (producción)
if (process.env.DATABASE_URL) {
    console.log('🔵 Usando DATABASE_URL para conexión Pool');
    
    // Parsear la URL para asegurar SSL
    const databaseUrl = process.env.DATABASE_URL;
    
    // Asegurar que la URL tenga sslmode=require
    let finalUrl = databaseUrl;
    if (!databaseUrl.includes('sslmode=require') && !databaseUrl.includes('sslmode=')) {
        finalUrl = databaseUrl + (databaseUrl.includes('?') ? '&' : '?') + 'sslmode=require';
    }
    
    var pool = new Pool({
        connectionString: finalUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    // Desarrollo local
    console.log('🔵 Usando variables individuales para conexión local');
    var pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'db_banco_falabella',
        ssl: false
    });
}

// Evento de error para debugging
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = {
    ...config,
    pool
};