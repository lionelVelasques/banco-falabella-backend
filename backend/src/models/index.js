const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

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