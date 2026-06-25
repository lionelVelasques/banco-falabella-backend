-- ============================================================
-- USUARIOS DE PRUEBA
-- ============================================================

-- Contraseña: '123456' (hasheada con bcrypt)
INSERT INTO usuarios (nombre, apellido, email, contraseña, telefono, dni, fecha_nacimiento, tipo_usuario) VALUES
('Carlos', 'González', 'cliente@bancofalabella.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv', '999111222', '12345678', '1990-01-15', 'cliente'),
('Ana', 'Martínez', 'cliente2@bancofalabella.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv', '999333444', '87654321', '1985-06-20', 'cliente'),
('Admin', 'Falabella', 'admin@bancofalabella.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv', '999555666', '11111111', '1980-03-10', 'admin'),
('Jefe', 'Riesgos', 'jefe.riesgos@bancofalabella.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv', '999777888', '22222222', '1975-08-25', 'jefe_riesgos'),
('Comite', 'Credito', 'comite@bancofalabella.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv', '999999000', '33333333', '1978-11-05', 'comite'),
('Gerencia', 'General', 'gerencia@bancofalabella.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVw4Dkz8FvFvFvFvFvFvFvFv', '999000111', '44444444', '1970-04-15', 'gerencia');