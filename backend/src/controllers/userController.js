const { pool } = require('../config');
const bcrypt = require('bcryptjs');
const { descifrar } = require('../utils/crypto');

// ============================================================
// PERFIL DE USUARIO (con DNI descifrado)
// ============================================================

exports.getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, nombre, apellido, email, telefono, fecha_nacimiento, tipo_usuario, activo, dni
             FROM usuarios WHERE id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const user = result.rows[0];
        // Descifrar DNI para mostrar
        user.dni = descifrar(user.dni);
        
        res.json(user);
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
    }
};

// ============================================================
// ACTUALIZAR PERFIL
// ============================================================

exports.actualizarPerfil = async (req, res) => {
    try {
        const { nombre, apellido, telefono } = req.body;
        
        const result = await pool.query(
            `UPDATE usuarios 
             SET nombre = COALESCE($1, nombre),
                 apellido = COALESCE($2, apellido),
                 telefono = COALESCE($3, telefono),
                 fecha_actualizacion = NOW()
             WHERE id = $4
             RETURNING id, nombre, apellido, email, telefono, tipo_usuario, dni`,
            [nombre, apellido, telefono, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const user = result.rows[0];
        user.dni = descifrar(user.dni);
        
        res.json({ 
            message: 'Perfil actualizado exitosamente',
            usuario: user
        });
    } catch (error) {
        console.error('Error en actualizarPerfil:', error);
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
};

// ============================================================
// CAMBIAR CONTRASEÑA
// ============================================================

exports.cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, nuevaPassword } = req.body;
        
        if (!passwordActual || !nuevaPassword) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }
        
        if (nuevaPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }
        
        const result = await pool.query(
            'SELECT contraseña FROM usuarios WHERE id = $1',
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const isValid = await bcrypt.compare(passwordActual, result.rows[0].contraseña);
        if (!isValid) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }
        
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        
        await pool.query(
            'UPDATE usuarios SET contraseña = $1, fecha_actualizacion = NOW() WHERE id = $2',
            [hashedPassword, req.user.id]
        );
        
        res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
        console.error('Error en cambiarPassword:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña', error: error.message });
    }
};

// ============================================================
// CUENTAS DEL USUARIO
// ============================================================

exports.getAccounts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, numero_cuenta, tipo, saldo, moneda, estado, created_at 
             FROM cuentas WHERE usuario_id = $1 AND estado != 'cerrada'`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getAccounts:', error);
        res.status(500).json({ message: 'Error al obtener cuentas', error: error.message });
    }
};

// ============================================================
// TARJETAS DEL USUARIO
// ============================================================

exports.getCards = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, numero_enmascarado, linea_credito, saldo_utilizado, saldo_disponible,
                    tasa_interes, fecha_cierre, fecha_vencimiento, fecha_expiracion, estado, created_at 
             FROM tarjetas_cmr WHERE usuario_id = $1 AND estado = 'activa'`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getCards:', error);
        res.status(500).json({ message: 'Error al obtener tarjetas', error: error.message });
    }
};

// ============================================================
// PRÉSTAMOS DEL USUARIO
// ============================================================

exports.getLoans = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, tipo, monto_aprobado, saldo_pendiente, cuota_mensual, 
                    plazo_meses, fecha_aprobacion, fecha_vencimiento, estado 
             FROM prestamos WHERE usuario_id = $1`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getLoans:', error);
        res.status(500).json({ message: 'Error al obtener préstamos', error: error.message });
    }
};

// ============================================================
// TRANSACCIONES DEL USUARIO
// ============================================================

exports.getTransactions = async (req, res) => {
    try {
        const { cuenta_id } = req.params;
        
        const cuentaCheck = await pool.query(
            'SELECT id FROM cuentas WHERE id = $1 AND usuario_id = $2',
            [cuenta_id, req.user.id]
        );
        
        if (cuentaCheck.rows.length === 0) {
            return res.status(403).json({ message: 'No tienes acceso a esta cuenta' });
        }

        const result = await pool.query(
            `SELECT t.id, t.tipo, t.monto, t.moneda, t.descripcion, t.estado, t.referencia, t.created_at,
                    co.numero_cuenta AS cuenta_origen, cd.numero_cuenta AS cuenta_destino
             FROM transacciones t
             LEFT JOIN cuentas co ON co.id = t.cuenta_origen_id
             LEFT JOIN cuentas cd ON cd.id = t.cuenta_destino_id
             WHERE t.cuenta_origen_id = $1 OR t.cuenta_destino_id = $1
             ORDER BY t.created_at DESC
             LIMIT 50`,
            [cuenta_id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getTransactions:', error);
        res.status(500).json({ message: 'Error al obtener transacciones', error: error.message });
    }
};