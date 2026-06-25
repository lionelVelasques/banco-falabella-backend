-- ============================================================
-- BANCO FALABELLA - CREACIÓN DE TABLAS
-- ============================================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    dni VARCHAR(20),
    fecha_nacimiento DATE,
    tipo_usuario VARCHAR(30) DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP
);

-- 2. HISTORIAL ACCESO
CREATE TABLE IF NOT EXISTS historial_acceso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    tipo_acceso VARCHAR(20),
    fecha_acceso TIMESTAMP DEFAULT NOW()
);

-- 3. CUENTAS
CREATE TABLE IF NOT EXISTS cuentas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    saldo DECIMAL(15,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. TARJETAS CMR
CREATE TABLE IF NOT EXISTS tarjetas_cmr (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    cuenta_id INTEGER REFERENCES cuentas(id),
    numero_tarjeta VARCHAR(16) UNIQUE NOT NULL,
    numero_enmascarado VARCHAR(19) NOT NULL,
    cvv_hash VARCHAR(255) NOT NULL,
    fecha_expiracion DATE NOT NULL,
    linea_credito DECIMAL(15,2) DEFAULT 2000,
    saldo_utilizado DECIMAL(15,2) DEFAULT 0,
    tasa_interes DECIMAL(5,2) DEFAULT 3.99,
    fecha_cierre DATE,
    fecha_vencimiento DATE,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. SOLICITUDES DE CRÉDITO
CREATE TABLE IF NOT EXISTS solicitudes_credito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    monto_solicitado DECIMAL(15,2) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    plazo_meses INTEGER NOT NULL,
    tea DECIMAL(5,2) DEFAULT 43.92,
    seguro_desgravamen BOOLEAN DEFAULT FALSE,
    fecha_primera_cuota DATE,
    tipo_cliente VARCHAR(30) DEFAULT 'microempresa',
    cliente_nombre VARCHAR(100),
    cliente_apellido VARCHAR(100),
    estado VARCHAR(30) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. EVALUACIÓN DE CRÉDITO
CREATE TABLE IF NOT EXISTS evaluacion_credito (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER REFERENCES solicitudes_credito(id),
    puntaje_scoring INTEGER,
    elegibilidad BOOLEAN,
    razon_rechazo TEXT,
    ingreso_mensual DECIMAL(15,2),
    deuda_mensual DECIMAL(15,2),
    rds DECIMAL(5,2),
    nivel_riesgo VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. DICTAMEN DE CRÉDITO
CREATE TABLE IF NOT EXISTS dictamen_credito (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER REFERENCES solicitudes_credito(id),
    nivel_aprobacion VARCHAR(30),
    usuario_aprobador_id INTEGER REFERENCES usuarios(id),
    monto_aprobado DECIMAL(15,2),
    tasa_interes_aprobada DECIMAL(5,2),
    plazo_aprobado INTEGER,
    observaciones TEXT,
    estado VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. PRÉSTAMOS
CREATE TABLE IF NOT EXISTS prestamos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    cuenta_id INTEGER REFERENCES cuentas(id),
    solicitud_id INTEGER REFERENCES solicitudes_credito(id),
    monto_solicitado DECIMAL(15,2),
    monto_aprobado DECIMAL(15,2) DEFAULT 0,
    tasa_interes DECIMAL(5,2) NOT NULL,
    plazo_meses INTEGER NOT NULL,
    cuota_mensual DECIMAL(15,2),
    saldo_pendiente DECIMAL(15,2),
    tipo VARCHAR(30),
    estado VARCHAR(30) DEFAULT 'desembolsado',
    seguro_desgravamen BOOLEAN DEFAULT FALSE,
    fecha_primera_cuota DATE,
    tipo_cliente VARCHAR(30),
    fecha_aprobacion TIMESTAMP,
    fecha_desembolso TIMESTAMP,
    fecha_vencimiento DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. CUOTAS DE PRÉSTAMO
CREATE TABLE IF NOT EXISTS cuotas_prestamo (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER REFERENCES prestamos(id),
    numero_cuota INTEGER NOT NULL,
    monto_cuota DECIMAL(15,2) NOT NULL,
    monto_capital DECIMAL(15,2) NOT NULL,
    monto_interes DECIMAL(15,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    estado VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. TRANSACCIONES
CREATE TABLE IF NOT EXISTS transacciones (
    id SERIAL PRIMARY KEY,
    cuenta_origen_id INTEGER REFERENCES cuentas(id),
    cuenta_destino_id INTEGER REFERENCES cuentas(id),
    tarjeta_id INTEGER REFERENCES tarjetas_cmr(id),
    tipo VARCHAR(30) NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    descripcion TEXT,
    referencia VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'completada',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. CARTERA MORA
CREATE TABLE IF NOT EXISTS cartera_mora (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER REFERENCES prestamos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    dias_atraso INTEGER DEFAULT 0,
    banda VARCHAR(20),
    saldo_vencido DECIMAL(15,2) DEFAULT 0,
    fecha_ultima_gestion TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. GESTIONES DE COBRANZA
CREATE TABLE IF NOT EXISTS gestiones_cobranza (
    id SERIAL PRIMARY KEY,
    cartera_mora_id INTEGER REFERENCES cartera_mora(id),
    usuario_gestor_id INTEGER REFERENCES usuarios(id),
    tipo_gestion VARCHAR(30),
    resultado VARCHAR(30),
    descripcion TEXT,
    fecha_programada DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 13. NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(30),
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 14. CASOS DE PRUEBA
CREATE TABLE IF NOT EXISTS casos_prueba_credito (
    id SERIAL PRIMARY KEY,
    caso_numero VARCHAR(10) UNIQUE NOT NULL,
    cliente_nombre VARCHAR(100),
    cliente_apellido VARCHAR(100),
    monto DECIMAL(15,2),
    plazo_meses INTEGER,
    tea DECIMAL(5,2),
    seguro_desgravamen BOOLEAN,
    fecha_desembolso DATE,
    fecha_primera_cuota DATE,
    cuota_esperada DECIMAL(15,4),
    created_at TIMESTAMP DEFAULT NOW()
);