const { pool } = require('../../config');

const getMisCuentas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, numero_cuenta, tipo, moneda, saldo, estado, created_at
       FROM cuentas WHERE usuario_id = $1 AND estado != 'cerrada'
       ORDER BY created_at ASC`,
      [req.user.id]
    );
    res.json({ cuentas: result.rows });
  } catch (err) {
    console.error('Error en getMisCuentas:', err.message);
    res.status(500).json({ error: 'Error al obtener cuentas.' });
  }
};

const getMovimientos = async (req, res) => {
  const { id } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const cuenta = await pool.query(
      'SELECT id FROM cuentas WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (cuenta.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta cuenta.' });
    }

    const result = await pool.query(
      `SELECT t.id, t.tipo, t.monto, t.moneda, t.descripcion, t.referencia, t.estado, t.created_at,
              co.numero_cuenta AS cuenta_origen, cd.numero_cuenta AS cuenta_destino
       FROM transacciones t
       LEFT JOIN cuentas co ON co.id = t.cuenta_origen_id
       LEFT JOIN cuentas cd ON cd.id = t.cuenta_destino_id
       WHERE t.cuenta_origen_id = $1 OR t.cuenta_destino_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM transacciones
       WHERE cuenta_origen_id = $1 OR cuenta_destino_id = $1`,
      [id]
    );

    res.json({
      movimientos: result.rows,
      total: parseInt(total.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error('Error en getMovimientos:', err.message);
    res.status(500).json({ error: 'Error al obtener movimientos.' });
  }
};

const getDashboard = async (req, res) => {
  try {
    console.log('📊 Dashboard - Usuario ID:', req.user.id);

    const cuentas = await pool.query(
      `SELECT id, numero_cuenta, tipo, moneda, saldo
       FROM cuentas WHERE usuario_id = $1 AND estado = 'activa'`,
      [req.user.id]
    );
    console.log('📊 Cuentas encontradas:', cuentas.rows.length);

    const saldoTotal = cuentas.rows
      .filter(c => c.moneda === 'PEN')
      .reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0);

    const tarjetas = await pool.query(
      `SELECT id, numero_enmascarado, linea_credito, saldo_utilizado, 
              (linea_credito - saldo_utilizado) AS saldo_disponible, estado
       FROM tarjetas_cmr WHERE usuario_id = $1 AND estado = 'activa'`,
      [req.user.id]
    );
    console.log('📊 Tarjetas encontradas:', tarjetas.rows.length);

    const prestamos = await pool.query(
      `SELECT id, tipo, monto_aprobado, saldo_pendiente, cuota_mensual, fecha_vencimiento, estado
       FROM prestamos WHERE usuario_id = $1 AND estado IN ('desembolsado', 'en_mora')`,
      [req.user.id]
    );
    console.log('📊 Préstamos encontrados:', prestamos.rows.length);

    const cuentaIds = cuentas.rows.map(c => c.id);
    let movimientos = [];

    if (cuentaIds.length > 0) {
      const mov = await pool.query(
        `SELECT t.id, t.tipo, t.monto, t.moneda, t.descripcion, t.created_at,
                co.numero_cuenta AS origen, cd.numero_cuenta AS destino
         FROM transacciones t
         LEFT JOIN cuentas co ON co.id = t.cuenta_origen_id
         LEFT JOIN cuentas cd ON cd.id = t.cuenta_destino_id
         WHERE t.cuenta_origen_id = ANY($1) OR t.cuenta_destino_id = ANY($1)
         ORDER BY t.created_at DESC LIMIT 5`,
        [cuentaIds]
      );
      movimientos = mov.rows;
    }

    const notifs = await pool.query(
      `SELECT id, titulo, mensaje, tipo, created_at
       FROM notificaciones WHERE usuario_id = $1 AND leida = FALSE
       ORDER BY created_at DESC LIMIT 5`,
      [req.user.id]
    );

    const response = {
      saldo_total: saldoTotal,
      cuentas: cuentas.rows,
      tarjetas: tarjetas.rows,
      prestamos: prestamos.rows,
      movimientos_recientes: movimientos,
      notificaciones: notifs.rows,
    };
    
    console.log('📊 Respuesta enviada:', {
      saldo_total: response.saldo_total,
      cuentas: response.cuentas.length,
      tarjetas: response.tarjetas.length,
      prestamos: response.prestamos.length,
      movimientos: response.movimientos_recientes.length,
    });

    res.json(response);

  } catch (err) {
    console.error('❌ Error en getDashboard:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ error: 'Error al obtener dashboard.', details: err.message });
  }
};

module.exports = { getMisCuentas, getMovimientos, getDashboard };