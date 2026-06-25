module.exports = (sequelize, DataTypes) => {
    const HistorialAcceso = sequelize.define('HistorialAcceso', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        ip_address: { type: DataTypes.STRING(45) },
        user_agent: { type: DataTypes.TEXT },
        tipo_acceso: { type: DataTypes.STRING(20) }
    }, {
        tableName: 'historial_acceso',
        timestamps: true,
        createdAt: 'fecha_acceso',
        updatedAt: false
    });
    return HistorialAcceso;
};