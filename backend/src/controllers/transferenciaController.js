const { pool } = require('../../config');

const realizarTransferencia = async (req, res) => {
  const { cuenta_origen_id, numero_cuenta_destino, monto, descripcion } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const origen = await client.query(
      `SELECT id, saldo, moneda, estado FROM cuentas
       WHERE id = $1 AND usuario_id = $2`,
      [cuenta_origen_id, req.user.id]
    );

    if (origen.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Cuenta origen no válida.' });
    }

    const cuentaOrigen = origen.rows[0];

    if (cuentaOrigen.estado !== 'activa') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La cuenta origen está bloqueada o cerrada.' });
    }

    if (parseFloat(cuentaOrigen.saldo) < parseFloat(monto)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    const destino = await client.query(
      `SELECT id, estado FROM cuentas WHERE numero_cuenta = $1`,
      [numero_cuenta_destino]
    );

    if (destino.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta destino no encontrada.' });
    }

    const cuentaDestino = destino.rows[0];

    if (cuentaDestino.estado !== 'activa') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La cuenta destino no está activa.' });
    }

    if (cuentaOrigen.id === cuentaDestino.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No puedes transferir a la misma cuenta.' });
    }

    const montoNum = parseFloat(monto);

    await client.query(
      `UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2`,
      [montoNum, cuentaOrigen.id]
    );

    await client.query(
      `UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2`,
      [montoNum, cuentaDestino.id]
    );

    const transaccion = await client.query(
      `INSERT INTO transacciones 
       (cuenta_origen_id, cuenta_destino_id, tipo, monto, moneda, descripcion, estado)
       VALUES ($1, $2, 'transferencia', $3, $4, $5, 'completada')
       RETURNING id, monto, created_at`,
      [cuentaOrigen.id, cuentaDestino.id, montoNum, cuentaOrigen.moneda, descripcion || 'Transferencia']
    );

    await client.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, 'Transferencia realizada', $2, 'transaccion')`,
      [req.user.id, `Se transfirió S/ ${montoNum.toFixed(2)} a la cuenta ${numero_cuenta_destino}`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Transferencia realizada exitosamente.',
      transaccion: transaccion.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en transferencia:', err.message);
    res.status(500).json({ error: 'Error al procesar la transferencia.' });
  } finally {
    client.release();
  }
};

const getHistorial = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  try {
    const cuentas = await pool.query(
      'SELECT id FROM cuentas WHERE usuario_id = $1',
      [req.user.id]
    );
    const ids = cuentas.rows.map(c => c.id);
    if (ids.length === 0) return res.json({ transferencias: [] });

    const result = await pool.query(
      `SELECT t.id, t.tipo, t.monto, t.moneda, t.descripcion, t.referencia, t.estado, t.created_at,
              co.numero_cuenta AS cuenta_origen, cd.numero_cuenta AS cuenta_destino
       FROM transacciones t
       LEFT JOIN cuentas co ON co.id = t.cuenta_origen_id
       LEFT JOIN cuentas cd ON cd.id = t.cuenta_destino_id
       WHERE (t.cuenta_origen_id = ANY($1) OR t.cuenta_destino_id = ANY($1))
         AND t.tipo = 'transferencia'
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [ids, limit, offset]
    );

    res.json({ transferencias: result.rows });
  } catch (err) {
    console.error('Error en getHistorial:', err.message);
    res.status(500).json({ error: 'Error al obtener historial.' });
  }
};

module.exports = { realizarTransferencia, getHistorial };