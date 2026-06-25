const { Sequelize, DataTypes } = require('sequelize');

// ============================================================
// CONFIGURACIÓN DE SEQUELIZE CON SSL
// ============================================================

let sequelize;

if (process.env.DATABASE_URL) {
    // En producción (Render), usar DATABASE_URL con SSL
    console.log('🔵 Usando DATABASE_URL para Sequelize');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // En desarrollo local, usar variables individuales
    console.log('🔵 Usando variables individuales para Sequelize local');
    const sequelizeConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    };

    // Solo agregar SSL en producción
    if (process.env.NODE_ENV === 'production') {
        sequelizeConfig.dialectOptions = {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        };
    }

    sequelize = new Sequelize(
        process.env.DB_NAME || 'db_banco_falabella',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'postgres',
        sequelizeConfig
    );
}

// Probar la conexión
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a PostgreSQL establecida correctamente (Sequelize)');
    })
    .catch((err) => {
        console.error('❌ Error al conectar a PostgreSQL (Sequelize):', err.message);
    });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Usuario = require('./Usuario')(sequelize, DataTypes);
db.Cuenta = require('./Cuenta')(sequelize, DataTypes);
db.Transaccion = require('./Transaccion')(sequelize, DataTypes);
db.Tarjeta = require('./Tarjeta')(sequelize, DataTypes);
db.Prestamo = require('./Prestamo')(sequelize, DataTypes);
db.HistorialAcceso = require('./HistorialAcceso')(sequelize, DataTypes);

// Relaciones
db.Usuario.hasMany(db.Cuenta, { foreignKey: 'usuario_id' });
db.Cuenta.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Usuario.hasMany(db.Tarjeta, { foreignKey: 'usuario_id' });
db.Tarjeta.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Usuario.hasMany(db.Prestamo, { foreignKey: 'usuario_id' });
db.Prestamo.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Usuario.hasMany(db.HistorialAcceso, { foreignKey: 'usuario_id' });
db.HistorialAcceso.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

db.Cuenta.hasMany(db.Transaccion, { foreignKey: 'cuenta_origen_id', as: 'transaccionesOrigen' });
db.Cuenta.hasMany(db.Transaccion, { foreignKey: 'cuenta_destino_id', as: 'transaccionesDestino' });
db.Transaccion.belongsTo(db.Cuenta, { foreignKey: 'cuenta_origen_id', as: 'cuentaOrigen' });
db.Transaccion.belongsTo(db.Cuenta, { foreignKey: 'cuenta_destino_id', as: 'cuentaDestino' });

module.exports = db;