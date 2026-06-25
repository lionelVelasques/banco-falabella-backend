const { pool } = require('../../config');

const pagarServicio = async (req, res) => {
    const { servicio, cuenta_origen_id, monto, codigo_servicio } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cuenta = await client.query(
            'SELECT id, saldo FROM cuentas WHERE id = $1 AND usuario_id = $2 AND estado = $3',
            [cuenta_origen_id, req.user.id, 'activa']
        );
        
        if (cuenta.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Cuenta no encontrada o inactiva' });
        }
        
        if (parseFloat(cuenta.rows[0].saldo) < monto) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }
        
        await client.query(
            'UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2',
            [monto, cuenta_origen_id]
        );
        
        await client.query(
            `INSERT INTO transacciones 
             (cuenta_origen_id, tipo, monto, moneda, descripcion, referencia, estado)
             VALUES ($1, 'pago_servicio', $2, 'PEN', $3, $4, 'completada')`,
            [cuenta_origen_id, monto, `Pago de servicio ${servicio}`, `PAGO-${Date.now()}`]
        );
        
        await client.query('COMMIT');
        res.json({ message: `Pago de ${servicio} realizado exitosamente` });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error en pagarServicio:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const getHistorialPagos = async (req, res) => {
    try {
        const cuentas = await pool.query(
            'SELECT id FROM cuentas WHERE usuario_id = $1',
            [req.user.id]
        );
        const ids = cuentas.rows.map(c => c.id);
        if (ids.length === 0) return res.json({ pagos: [] });

        const result = await pool.query(
            `SELECT t.id, t.tipo, t.monto, t.moneda, t.descripcion, t.referencia, t.created_at,
                    c.numero_cuenta AS cuenta_origen
             FROM transacciones t
             LEFT JOIN cuentas c ON c.id = t.cuenta_origen_id
             WHERE t.cuenta_origen_id = ANY($1)
               AND t.tipo = 'pago_servicio'
             ORDER BY t.created_at DESC
             LIMIT 50`,
            [ids]
        );
        res.json({ pagos: result.rows });
    } catch (err) {
        console.error('Error en getHistorialPagos:', err.message);
        res.status(500).json({ error: 'Error al obtener historial de pagos.' });
    }
};

module.exports = { pagarServicio, getHistorialPagos };