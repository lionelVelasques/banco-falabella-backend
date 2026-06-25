const bcrypt = require('bcryptjs');
const { pool } = require('../../config');

const getMisTarjetas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, numero_enmascarado, linea_credito, saldo_utilizado, 
              (linea_credito - saldo_utilizado) AS saldo_disponible,
              tasa_interes, fecha_cierre, fecha_vencimiento, fecha_expiracion, estado, created_at
       FROM tarjetas_cmr WHERE usuario_id = $1`,
      [req.user.id]
    );
    res.json({ tarjetas: result.rows });
  } catch (err) {
    console.error('Error en getMisTarjetas:', err.message);
    res.status(500).json({ error: 'Error al obtener tarjetas.' });
  }
};

const solicitarTarjeta = async (req, res) => {
  const { cuenta_id, linea_credito } = req.body;

  try {
    const cuenta = await pool.query(
      `SELECT id FROM cuentas WHERE id = $1 AND usuario_id = $2 AND tipo = 'cmr'`,
      [cuenta_id, req.user.id]
    );

    if (cuenta.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta CMR no encontrada.' });
    }

    const existente = await pool.query(
      `SELECT id FROM tarjetas_cmr WHERE cuenta_id = $1 AND estado = 'activa'`,
      [cuenta_id]
    );
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Ya tienes una tarjeta CMR activa en esa cuenta.' });
    }

    const numeroTarjeta = generarNumeroTarjeta();
    const numeroEnmascarado = '**** **** **** ' + numeroTarjeta.slice(-4);
    const cvv = Math.floor(Math.random() * 900 + 100).toString();
    const cvvHash = await bcrypt.hash(cvv, 10);
    const fechaExpiracion = new Date();
    fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 4);

    const result = await pool.query(
      `INSERT INTO tarjetas_cmr 
       (cuenta_id, usuario_id, numero_tarjeta, numero_enmascarado, fecha_expiracion, cvv_hash,
        linea_credito, saldo_utilizado, tasa_interes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 3.99)
       RETURNING id, numero_enmascarado, linea_credito, 
                 (linea_credito - saldo_utilizado) AS saldo_disponible, 
                 fecha_expiracion, estado`,
      [cuenta_id, req.user.id, numeroTarjeta, numeroEnmascarado, fechaExpiracion, cvvHash, linea_credito || 2000]
    );

    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, '¡Tarjeta CMR activada!', $2, 'tarjeta')`,
      [req.user.id, `Tu tarjeta CMR ${numeroEnmascarado} ha sido activada con una línea de S/ ${linea_credito || 2000}`]
    );

    res.status(201).json({
      message: 'Tarjeta CMR creada exitosamente.',
      tarjeta: result.rows[0],
      cvv,
    });
  } catch (err) {
    console.error('Error en solicitarTarjeta:', err.message);
    res.status(500).json({ error: 'Error al crear tarjeta.' });
  }
};

const pagarTarjeta = async (req, res) => {
  const { id } = req.params;
  const { cuenta_origen_id, monto } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tarjeta = await client.query(
      'SELECT * FROM tarjetas_cmr WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (tarjeta.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarjeta no encontrada.' });
    }

    const t = tarjeta.rows[0];
    const montoNum = parseFloat(monto);

    if (montoNum > parseFloat(t.saldo_utilizado)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El monto excede el saldo utilizado.' });
    }

    const cuenta = await client.query(
      'SELECT saldo FROM cuentas WHERE id = $1 AND usuario_id = $2',
      [cuenta_origen_id, req.user.id]
    );
    if (cuenta.rows.length === 0 || parseFloat(cuenta.rows[0].saldo) < montoNum) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente en cuenta origen.' });
    }

    await client.query(
      'UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2',
      [montoNum, cuenta_origen_id]
    );

    await client.query(
      'UPDATE tarjetas_cmr SET saldo_utilizado = saldo_utilizado - $1 WHERE id = $2',
      [montoNum, id]
    );

    await client.query(
      `INSERT INTO transacciones (cuenta_origen_id, tarjeta_id, tipo, monto, moneda, descripcion, estado)
       VALUES ($1, $2, 'pago_tarjeta', $3, 'PEN', 'Pago tarjeta CMR', 'completada')`,
      [cuenta_origen_id, id, montoNum]
    );

    await client.query('COMMIT');
    res.json({ message: `Pago de S/ ${montoNum.toFixed(2)} realizado exitosamente.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en pagarTarjeta:', err.message);
    res.status(500).json({ error: 'Error al procesar el pago.' });
  } finally {
    client.release();
  }
};

const getMovimientosTarjeta = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query(
      'SELECT id FROM tarjetas_cmr WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (check.rows.length === 0) return res.status(403).json({ error: 'Acceso denegado.' });

    const result = await pool.query(
      `SELECT id, tipo, monto, descripcion, referencia, estado, created_at
       FROM transacciones WHERE tarjeta_id = $1
       ORDER BY created_at DESC LIMIT 30`,
      [id]
    );
    res.json({ movimientos: result.rows });
  } catch (err) {
    console.error('Error en getMovimientosTarjeta:', err.message);
    res.status(500).json({ error: 'Error al obtener movimientos de tarjeta.' });
  }
};

const generarNumeroTarjeta = () => {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
};

module.exports = { getMisTarjetas, solicitarTarjeta, pagarTarjeta, getMovimientosTarjeta };