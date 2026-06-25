module.exports = (sequelize, DataTypes) => {
    const Cuenta = sequelize.define('Cuenta', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        numero_cuenta: { type: DataTypes.STRING(20), allowNull: false, unique: true },
        tipo: { type: DataTypes.STRING(20), allowNull: false },
        saldo: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00 },
        moneda: { type: DataTypes.STRING(3), defaultValue: 'PEN' },
        estado: { type: DataTypes.STRING(20), defaultValue: 'activa' }
    }, {
        tableName: 'cuentas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
    return Cuenta;
};