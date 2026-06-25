module.exports = (sequelize, DataTypes) => {
    const Prestamo = sequelize.define('Prestamo', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        cuenta_id: { type: DataTypes.INTEGER },
        solicitud_id: { type: DataTypes.INTEGER },
        monto_solicitado: { type: DataTypes.DECIMAL(15, 2) },
        monto_aprobado: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        tasa_interes: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
        plazo_meses: { type: DataTypes.INTEGER, allowNull: false },
        cuota_mensual: { type: DataTypes.DECIMAL(15, 2) },
        saldo_pendiente: { type: DataTypes.DECIMAL(15, 2) },
        tipo: { type: DataTypes.STRING(30) },
        estado: { type: DataTypes.STRING(30), defaultValue: 'desembolsado' },
        seguro_desgravamen: { type: DataTypes.BOOLEAN, defaultValue: false },
        fecha_primera_cuota: { type: DataTypes.DATE },
        tipo_cliente: { type: DataTypes.STRING(30) },
        fecha_aprobacion: { type: DataTypes.DATE },
        fecha_desembolso: { type: DataTypes.DATE },
        fecha_vencimiento: { type: DataTypes.DATE }
    }, {
        tableName: 'prestamos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });
    return Prestamo;
};