const { pool } = require('../../config');

const gastosPorMes = async (req, res) => {
  try {
    const cuentas = await pool.query(
      'SELECT id FROM cuentas WHERE usuario_id = $1',
      [req.user.id]
    );
    const ids = cuentas.rows.map(c => c.id);
    if (ids.length === 0) return res.json({ datos: [] });

    const result = await pool.query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') AS mes,
         tipo,
         SUM(monto) AS total,
         COUNT(*) AS cantidad
       FROM transacciones
       WHERE cuenta_origen_id = ANY($1)
         AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY mes, tipo
       ORDER BY mes ASC`,
      [ids]
    );
    res.json({ datos: result.rows });
  } catch (err) {
    console.error('Error en gastosPorMes:', err.message);
    res.status(500).json({ error: 'Error al obtener analytics.' });
  }
};

const resumenFinanciero = async (req, res) => {
  try {
    const cuentas = await pool.query(
      'SELECT id FROM cuentas WHERE usuario_id = $1',
      [req.user.id]
    );
    const ids = cuentas.rows.map(c => c.id);
    if (ids.length === 0) return res.json({ resumen: {} });

    // Ingresos del mes
    const ingresos = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total FROM transacciones
       WHERE cuenta_destino_id = ANY($1)
         AND tipo IN ('transferencia', 'deposito', 'abono')
         AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
      [ids]
    );

    // Gastos del mes
    const gastos = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total FROM transacciones
       WHERE cuenta_origen_id = ANY($1)
         AND tipo IN ('transferencia', 'retiro', 'pago_tarjeta')
         AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
      [ids]
    );

    // Transacciones por tipo
    const porTipo = await pool.query(
      `SELECT tipo, COUNT(*) AS cantidad, SUM(monto) AS total
       FROM transacciones
       WHERE (cuenta_origen_id = ANY($1) OR cuenta_destino_id = ANY($1))
         AND created_at >= NOW() - INTERVAL '3 months'
       GROUP BY tipo`,
      [ids]
    );

    res.json({
      resumen: {
        ingresos_mes: parseFloat(ingresos.rows[0].total),
        gastos_mes: parseFloat(gastos.rows[0].total),
        balance_mes: parseFloat(ingresos.rows[0].total) - parseFloat(gastos.rows[0].total),
      },
      por_tipo: porTipo.rows,
      evolucion: []
    });
  } catch (err) {
    console.error('Error en resumenFinanciero:', err.message);
    res.status(500).json({ error: 'Error al obtener resumen financiero.' });
  }
};

module.exports = { gastosPorMes, resumenFinanciero };