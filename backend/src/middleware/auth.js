const jwt = require('jsonwebtoken');
const config = require('../config');
const { pool } = require('../config');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No autorizado - Token no proporcionado' });
        }
        
        const decoded = jwt.verify(token, config.jwt.secret);
        
        const result = await pool.query(
            'SELECT id, email, tipo_usuario, activo FROM usuarios WHERE id = $1',
            [decoded.id]
        );
        
        if (result.rows.length === 0 || !result.rows[0].activo) {
            return res.status(401).json({ message: 'Usuario no válido o desactivado' });
        }
        
        const user = result.rows[0];
        req.user = { 
            id: user.id, 
            email: user.email, 
            tipo_usuario: user.tipo_usuario 
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        console.error('Error en authMiddleware:', error);
        res.status(500).json({ message: 'Error de autenticación', error: error.message });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.tipo_usuario !== 'admin') {
        return res.status(403).json({ 
            message: 'Acceso denegado - Se requiere permisos de Administrador' 
        });
    }
    next();
};

const isJefeRiesgos = (req, res, next) => {
    const rolesPermitidos = ['admin', 'jefe_riesgos'];
    if (!rolesPermitidos.includes(req.user.tipo_usuario)) {
        return res.status(403).json({ 
            message: 'Acceso denegado - Se requiere permisos de Jefe de Riesgos' 
        });
    }
    next();
};

const isComite = (req, res, next) => {
    const rolesPermitidos = ['admin', 'jefe_riesgos', 'comite'];
    if (!rolesPermitidos.includes(req.user.tipo_usuario)) {
        return res.status(403).json({ 
            message: 'Acceso denegado - Se requiere permisos de Comité de Crédito' 
        });
    }
    next();
};

const isGerencia = (req, res, next) => {
    const rolesPermitidos = ['admin', 'jefe_riesgos', 'comite', 'gerencia'];
    if (!rolesPermitidos.includes(req.user.tipo_usuario)) {
        return res.status(403).json({ 
            message: 'Acceso denegado - Se requiere permisos de Gerencia' 
        });
    }
    next();
};

module.exports = { authMiddleware, isAdmin, isJefeRiesgos, isComite, isGerencia };