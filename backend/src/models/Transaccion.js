module.exports = (sequelize, DataTypes) => {
    const Transaccion = sequelize.define('Transaccion', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        cuenta_origen_id: { type: DataTypes.INTEGER },
        cuenta_destino_id: { type: DataTypes.INTEGER },
        tarjeta_id: { type: DataTypes.INTEGER },
        tipo: { type: DataTypes.STRING(30), allowNull: false },
        monto: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        moneda: { type: DataTypes.STRING(3), defaultValue: 'PEN' },
        descripcion: { type: DataTypes.TEXT },
        referencia: { type: DataTypes.STRING(50) },
        estado: { type: DataTypes.STRING(20), defaultValue: 'completada' }
    }, {
        tableName: 'transacciones',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
    return Transaccion;
};