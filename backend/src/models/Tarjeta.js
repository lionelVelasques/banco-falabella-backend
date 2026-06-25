module.exports = (sequelize, DataTypes) => {
    const Tarjeta = sequelize.define('Tarjeta', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        cuenta_id: { type: DataTypes.INTEGER },
        numero_tarjeta: { type: DataTypes.STRING(16), allowNull: false, unique: true },
        numero_enmascarado: { type: DataTypes.STRING(19), allowNull: false },
        cvv_hash: { type: DataTypes.STRING(255), allowNull: false },
        fecha_expiracion: { type: DataTypes.DATE, allowNull: false },
        linea_credito: { type: DataTypes.DECIMAL(15, 2), defaultValue: 2000 },
        saldo_utilizado: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
        tasa_interes: { type: DataTypes.DECIMAL(5, 2), defaultValue: 3.99 },
        fecha_cierre: { type: DataTypes.DATE },
        fecha_vencimiento: { type: DataTypes.DATE },
        estado: { type: DataTypes.STRING(20), defaultValue: 'activa' }
    }, {
        tableName: 'tarjetas_cmr',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
    return Tarjeta;
};