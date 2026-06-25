module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        apellido: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        contraseña: { type: DataTypes.STRING(255), allowNull: false },
        telefono: { type: DataTypes.STRING(20) },
        dni: { type: DataTypes.STRING(20) },
        direccion: { type: DataTypes.TEXT },
        fecha_nacimiento: { type: DataTypes.DATE },
        tipo_usuario: { type: DataTypes.STRING(20), defaultValue: 'cliente' },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'usuarios',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });
    return Usuario;
};