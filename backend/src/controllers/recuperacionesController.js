const { pool } = require('../config');

const getMora = async (req, res) => {
    const { banda, usuario_id } = req.query;
    try {
        let query = `
            SELECT 
                cm.id AS cartera_id,
                cm.prestamo_id,
                cm.usuario_id,
                u.nombre || ' ' || u.apellido AS cliente,
                u.email,
                u.telefono,
                p.monto_aprobado,
                p.saldo_pendiente,
                p.fecha_vencimiento,
                cm.dias_atraso,
                cm.banda,
                cm.saldo_vencido,
                cm.estado AS estado_cartera,
                cm.fecha_ultima_gestion,
                cm.created_at,
                (SELECT COUNT(*) FROM gestiones_cobranza gc WHERE gc.cartera_mora_id = cm.id) AS total_gestiones
            FROM cartera_mora cm
            JOIN usuarios u ON u.id = cm.usuario_id
            JOIN prestamos p ON p.id = cm.prestamo_id
            WHERE cm.estado != 'castigada'
        `;
        const params = [];
        let paramCount = 1;

        if (banda) {
            query += ` AND cm.banda = $${paramCount}`;
            params.push(banda);
            paramCount++;
        }

        if (usuario_id) {
            query += ` AND cm.usuario_id = $${paramCount}`;
            params.push(usuario_id);
            paramCount++;
        }

        query += ` ORDER BY cm.dias_atraso DESC`;

        const result = await pool.query(query, params);
        res.json({ mora: result.rows });
    } catch (err) {
        console.error('Error en getMora:', err.message);
        res.status(500).json({ error: 'Error al obtener cartera de mora.' });
    }
};

const getKPIs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE banda = 'preventiva') AS preventiva,
                COUNT(*) FILTER (WHERE banda = 'temprana') AS temprana,
                COUNT(*) FILTER (WHERE banda = 'tardia') AS tardia,
                COUNT(*) FILTER (WHERE banda = 'judicial') AS judicial,
                COUNT(*) FILTER (WHERE banda = 'castigo') AS castigo,
                SUM(saldo_vencido) FILTER (WHERE banda = 'preventiva') AS monto_preventiva,
                SUM(saldo_vencido) FILTER (WHERE banda = 'temprana') AS monto_temprana,
                SUM(saldo_vencido) FILTER (WHERE banda = 'tardia') AS monto_tardia,
                SUM(saldo_vencido) FILTER (WHERE banda = 'judicial') AS monto_judicial,
                SUM(saldo_vencido) FILTER (WHERE banda = 'castigo') AS monto_castigo,
                SUM(saldo_vencido) AS total_mora
            FROM cartera_mora
            WHERE estado != 'castigada'
        `);
        res.json({ kpis: result.rows[0] });
    } catch (err) {
        console.error('Error en getKPIs:', err.message);
        res.status(500).json({ error: 'Error al obtener KPIs.' });
    }
};

const getGestiones = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT gc.*, u.nombre || ' ' || u.apellido AS gestor
             FROM gestiones_cobranza gc
             JOIN usuarios u ON u.id = gc.usuario_gestor_id
             WHERE gc.cartera_mora_id = $1
             ORDER BY gc.created_at DESC`,
            [id]
        );
        res.json({ gestiones: result.rows });
    } catch (err) {
        console.error('Error en getGestiones:', err.message);
        res.status(500).json({ error: 'Error al obtener gestiones.' });
    }
};

const registrarGestion = async (req, res) => {
    const { id } = req.params;
    const { tipo_gestion, resultado, descripcion, fecha_programada } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cartera = await client.query(
            'SELECT id, usuario_id FROM cartera_mora WHERE id = $1',
            [id]
        );
        if (cartera.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Registro de cartera no encontrado.' });
        }

        await client.query(
            `INSERT INTO gestiones_cobranza 
             (cartera_mora_id, usuario_gestor_id, tipo_gestion, resultado, descripcion, fecha_programada)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, req.user.id, tipo_gestion, resultado, descripcion, fecha_programada]
        );

        await client.query(
            `UPDATE cartera_mora SET fecha_ultima_gestion = NOW() WHERE id = $1`,
            [id]
        );

        if (resultado === 'contacto' || resultado === 'promesa_pago') {
            await client.query(
                `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
                 VALUES ($1, 'Gestión de cobranza', $2, 'alerta')`,
                [cartera.rows[0].usuario_id, 
                 `Se ha registrado una gestión de cobranza. Resultado: ${resultado}`]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Gestión registrada exitosamente.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error en registrarGestion:', err.message);
        res.status(500).json({ error: 'Error al registrar gestión.' });
    } finally {
        client.release();
    }
};

const derivarJudicial = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cartera = await client.query(
            `SELECT cm.*, p.fecha_vencimiento 
             FROM cartera_mora cm
             JOIN prestamos p ON p.id = cm.prestamo_id
             WHERE cm.id = $1`,
            [id]
        );

        if (cartera.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Registro de cartera no encontrado.' });
        }

        const c = cartera.rows[0];
        const diasAtraso = c.dias_atraso;

        if (diasAtraso < 91) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: `Mínimo 91 días de atraso para derivar a judicial. Actual: ${diasAtraso} días.` 
            });
        }

        await client.query(
            `UPDATE cartera_mora SET banda = 'judicial', estado = 'judicial' WHERE id = $1`,
            [id]
        );

        await client.query(
            `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
             VALUES ($1, 'Derivado a judicial', $2, 'alerta')`,
            [c.usuario_id, `Tu deuda ha sido derivada al departamento judicial por ${diasAtraso} días de atraso.`]
        );

        await client.query('COMMIT');
        res.json({ message: `Derivado a judicial (${diasAtraso} días de atraso).` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error en derivarJudicial:', err.message);
        res.status(500).json({ error: 'Error al derivar a judicial.' });
    } finally {
        client.release();
    }
};

const castigar = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cartera = await client.query(
            `SELECT cm.*, p.fecha_vencimiento, p.saldo_pendiente
             FROM cartera_mora cm
             JOIN prestamos p ON p.id = cm.prestamo_id
             WHERE cm.id = $1`,
            [id]
        );

        if (cartera.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Registro de cartera no encontrado.' });
        }

        const c = cartera.rows[0];
        const diasAtraso = c.dias_atraso;

        if (diasAtraso < 120) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: `Mínimo 120 días de atraso para castigar. Actual: ${diasAtraso} días.` 
            });
        }

        await client.query(
            `UPDATE cartera_mora SET banda = 'castigo', estado = 'castigada' WHERE id = $1`,
            [id]
        );

        await client.query(
            `UPDATE prestamos SET estado = 'pagado' WHERE id = $1`,
            [c.prestamo_id]
        );

        await client.query(
            `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
             VALUES ($1, 'Cartera castigada', $2, 'alerta')`,
            [c.usuario_id, `Tu deuda ha sido castigada (baja de cartera) por ${diasAtraso} días de atraso sin pago.`]
        );

        await client.query('COMMIT');
        res.json({ message: `Cartera castigada (${diasAtraso} días de atraso). Saldo pendiente: S/ ${c.saldo_pendiente}` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error en castigar:', err.message);
        res.status(500).json({ error: 'Error al castigar cartera.' });
    } finally {
        client.release();
    }
};

module.exports = {
    getMora,
    getKPIs,
    getGestiones,
    registrarGestion,
    derivarJudicial,
    castigar
};