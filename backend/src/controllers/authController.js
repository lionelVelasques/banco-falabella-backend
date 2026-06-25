const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config'); // ← Ruta correcta
const config = require('../config');
const { cifrar, descifrar } = require('../utils/crypto');

// ============================================================
// REGISTRO DE USUARIO (con DNI cifrado)
// ============================================================

exports.register = async (req, res) => {
    try {
        console.log('📝 Datos recibidos en registro:', req.body);
        
        const { nombre, apellido, email, contraseña, telefono, fecha_nacimiento, tipo_usuario, dni } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !apellido || !email || !contraseña) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: nombre, apellido, email y contraseña son obligatorios' 
            });
        }
        
        if (contraseña.length < 6) {
            return res.status(400).json({ 
                message: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }
        
        // Validar email
        const existingUser = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Validar DNI (si se proporciona)
        if (dni) {
            const existingDni = await pool.query(
                'SELECT id FROM usuarios WHERE dni = $1',
                [dni]
            );
            if (existingDni.rows.length > 0) {
                return res.status(400).json({ message: 'El DNI ya está registrado' });
            }
        }

        // Hash de la contraseña
        console.log('🔐 Hasheando contraseña...');
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        console.log('✅ Contraseña hasheada correctamente');

        // Cifrar DNI antes de guardar
        const dniCifrado = cifrar(dni);

        // Crear usuario (con DNI cifrado)
        const result = await pool.query(
            `INSERT INTO usuarios 
             (nombre, apellido, email, contraseña, telefono, fecha_nacimiento, tipo_usuario, dni)
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'cliente'), $8)
             RETURNING id, nombre, apellido, email, telefono, tipo_usuario, dni`,
            [nombre, apellido, email, hashedPassword, telefono || null, fecha_nacimiento || null, tipo_usuario || 'cliente', dniCifrado]
        );

        const user = result.rows[0];

        // Descifrar DNI para mostrar (solo en respuesta)
        user.dni = descifrar(user.dni);

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, tipo: user.tipo_usuario },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                tipo_usuario: user.tipo_usuario,
                dni: user.dni
            }
        });
    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({ 
            message: 'Error al registrar usuario', 
            error: error.message 
        });
    }
};

// ============================================================
// LOGIN DE USUARIO
// ============================================================

exports.login = async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        // Buscar usuario
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({ message: 'Usuario desactivado' });
        }

        // Registrar acceso
        await pool.query(
            `INSERT INTO historial_acceso (usuario_id, ip_address, user_agent, tipo_acceso)
             VALUES ($1, $2, $3, 'login')`,
            [user.id, req.ip, req.get('user-agent')]
        );

        // Descifrar DNI para mostrar
        const dniDescifrado = descifrar(user.dni);

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, tipo: user.tipo_usuario },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                tipo_usuario: user.tipo_usuario,
                dni: dniDescifrado
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// ============================================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================================

exports.solicitarRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;
        
        const result = await pool.query(
            'SELECT id, email FROM usuarios WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No existe una cuenta con este email' });
        }
        
        const token = jwt.sign(
            { id: result.rows[0].id, email: result.rows[0].email },
            config.jwt.secret,
            { expiresIn: '1h' }
        );
        
        res.json({
            message: 'Se ha enviado un enlace de recuperación a tu correo',
            token
        });
    } catch (error) {
        console.error('Error en solicitarRecuperacion:', error);
        res.status(500).json({ message: 'Error al solicitar recuperación', error: error.message });
    }
};

// ============================================================
// RESTABLECER CONTRASEÑA (con token de recuperación)
// ============================================================

exports.recuperarPassword = async (req, res) => {
    try {
        const { token, nuevaPassword } = req.body;
        
        if (!token || !nuevaPassword) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }
        
        if (nuevaPassword.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'El enlace de recuperación ha expirado' });
            }
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        
        await pool.query(
            'UPDATE usuarios SET contraseña = $1, fecha_actualizacion = NOW() WHERE id = $2',
            [hashedPassword, decoded.id]
        );
        
        res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error en recuperarPassword:', error);
        res.status(500).json({ message: 'Error al restablecer contraseña', error: error.message });
    }
};

// ============================================================
// ACTUALIZAR PERFIL (con DNI cifrado)
// ============================================================

exports.actualizarPerfil = async (req, res) => {
    try {
        const { nombre, apellido, telefono, dni } = req.body;
        
        // Cifrar DNI si se proporciona
        const dniCifrado = dni ? cifrar(dni) : null;
        
        const result = await pool.query(
            `UPDATE usuarios 
             SET nombre = COALESCE($1, nombre),
                 apellido = COALESCE($2, apellido),
                 telefono = COALESCE($3, telefono),
                 dni = COALESCE($4, dni),
                 fecha_actualizacion = NOW()
             WHERE id = $5
             RETURNING id, nombre, apellido, email, telefono, tipo_usuario, dni`,
            [nombre, apellido, telefono, dniCifrado, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Descifrar DNI para mostrar
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