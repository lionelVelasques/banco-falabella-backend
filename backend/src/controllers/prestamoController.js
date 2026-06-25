const { pool } = require('../../config');

const getMisPrestamos = async (req, res) => {
  try {
    const esAdmin = req.user.tipo_usuario === 'admin';
    
    let query;
    let params;
    
    if (esAdmin) {
      query = `
        SELECT p.*, 
               u.nombre || ' ' || u.apellido AS cliente,
               u.email AS cliente_email,
               COUNT(cp.id) FILTER (WHERE cp.estado = 'pendiente') AS cuotas_pendientes,
               COUNT(cp.id) FILTER (WHERE cp.estado = 'vencida') AS cuotas_vencidas
        FROM prestamos p
        JOIN usuarios u ON u.id = p.usuario_id
        LEFT JOIN cuotas_prestamo cp ON cp.prestamo_id = p.id
        GROUP BY p.id, u.nombre, u.apellido, u.email
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT p.*, 
               COUNT(cp.id) FILTER (WHERE cp.estado = 'pendiente') AS cuotas_pendientes,
               COUNT(cp.id) FILTER (WHERE cp.estado = 'vencida') AS cuotas_vencidas
        FROM prestamos p
        LEFT JOIN cuotas_prestamo cp ON cp.prestamo_id = p.id
        WHERE p.usuario_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ prestamos: result.rows });
  } catch (err) {
    console.error('Error en getMisPrestamos:', err.message);
    res.status(500).json({ error: 'Error al obtener préstamos.' });
  }
};

const solicitarPrestamo = async (req, res) => {
  const { cuenta_id, tipo, monto_solicitado, plazo_meses } = req.body;

  try {
    const cuenta = await pool.query(
      'SELECT id FROM cuentas WHERE id = $1 AND usuario_id = $2',
      [cuenta_id, req.user.id]
    );
    if (cuenta.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    const tasas = { personal: 18, consumo: 24, vehicular: 12, hipotecario: 9 };
    const tasa_interes = tasas[tipo] || 18;

    const i = tasa_interes / 100 / 12;
    const cuota_mensual = (monto_solicitado * i * Math.pow(1 + i, plazo_meses)) /
      (Math.pow(1 + i, plazo_meses) - 1);

    const result = await pool.query(
      `INSERT INTO prestamos 
       (usuario_id, cuenta_id, tipo, monto_solicitado, tasa_interes, plazo_meses, cuota_mensual, estado, monto_aprobado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', 0)
       RETURNING id, tipo, monto_solicitado, tasa_interes, plazo_meses, cuota_mensual, estado`,
      [req.user.id, cuenta_id, tipo, monto_solicitado, tasa_interes, plazo_meses, cuota_mensual.toFixed(2)]
    );

    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, 'Solicitud de préstamo recibida', $2, 'prestamo')`,
      [req.user.id, `Tu solicitud de préstamo por S/ ${monto_solicitado} está en evaluación.`]
    );

    res.status(201).json({
      message: 'Solicitud de préstamo enviada. Será evaluada en 24-48 horas.',
      prestamo: result.rows[0],
      cuota_estimada: parseFloat(cuota_mensual.toFixed(2)),
    });
  } catch (err) {
    console.error('Error en solicitarPrestamo:', err.message);
    res.status(500).json({ error: 'Error al solicitar préstamo.' });
  }
};

const aprobarPrestamo = async (req, res) => {
  const { id } = req.params;
  const { monto_aprobado } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const prestamo = await client.query(
      'SELECT * FROM prestamos WHERE id = $1 AND estado = $2',
      [id, 'pendiente']
    );
    if (prestamo.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Préstamo no encontrado o ya procesado.' });
    }

    const p = prestamo.rows[0];
    const monto = parseFloat(monto_aprobado || p.monto_solicitado);
    const fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + p.plazo_meses);

    await client.query(
      `UPDATE prestamos SET monto_aprobado = $1, saldo_pendiente = $1, estado = 'desembolsado',
       fecha_aprobacion = NOW(), fecha_desembolso = NOW(), fecha_vencimiento = $2
       WHERE id = $3`,
      [monto, fechaVencimiento, id]
    );

    await client.query(
      'UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2',
      [monto, p.cuenta_id]
    );

    const i = p.tasa_interes / 100 / 12;
    let saldo = monto;
    for (let n = 1; n <= p.plazo_meses; n++) {
      const interes = saldo * i;
      const capital = parseFloat(p.cuota_mensual) - interes;
      saldo -= capital;
      const fechaCuota = new Date();
      fechaCuota.setMonth(fechaCuota.getMonth() + n);
      await client.query(
        `INSERT INTO cuotas_prestamo (prestamo_id, numero_cuota, monto_cuota, monto_capital, monto_interes, fecha_vencimiento)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, n, parseFloat(p.cuota_mensual).toFixed(2), capital.toFixed(2), interes.toFixed(2), fechaCuota]
      );
    }

    await client.query(
      `INSERT INTO transacciones (cuenta_destino_id, tipo, monto, moneda, descripcion, estado)
       VALUES ($1, 'abono', $2, 'PEN', 'Desembolso de préstamo', 'completada')`,
      [p.cuenta_id, monto]
    );

    await client.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, '¡Préstamo aprobado!', $2, 'prestamo')`,
      [p.usuario_id, `Tu préstamo por S/ ${monto} ha sido aprobado y desembolsado en tu cuenta.`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Préstamo aprobado y desembolsado exitosamente.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en aprobarPrestamo:', err.message);
    res.status(500).json({ error: 'Error al aprobar préstamo.' });
  } finally {
    client.release();
  }
};

const getCuotas = async (req, res) => {
  const { id } = req.params;
  try {
    const esAdmin = req.user.tipo_usuario === 'admin';
    let checkQuery;
    let checkParams;
    
    if (esAdmin) {
      checkQuery = 'SELECT id FROM prestamos WHERE id = $1';
      checkParams = [id];
    } else {
      checkQuery = 'SELECT id FROM prestamos WHERE id = $1 AND usuario_id = $2';
      checkParams = [id, req.user.id];
    }
    
    const check = await pool.query(checkQuery, checkParams);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Acceso denegado.' });

    const result = await pool.query(
      'SELECT * FROM cuotas_prestamo WHERE prestamo_id = $1 ORDER BY numero_cuota ASC',
      [id]
    );
    res.json({ cuotas: result.rows });
  } catch (err) {
    console.error('Error en getCuotas:', err.message);
    res.status(500).json({ error: 'Error al obtener cuotas.' });
  }
};

const pagarPrestamo = async (req, res) => {
  const { id } = req.params;
  const { cuenta_origen_id, monto } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const prestamo = await client.query(
      'SELECT * FROM prestamos WHERE id = $1 AND usuario_id = $2 AND estado IN ($3, $4)',
      [id, req.user.id, 'desembolsado', 'en_mora']
    );
    if (prestamo.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Préstamo no encontrado o ya pagado.' });
    }

    const p = prestamo.rows[0];
    const montoNum = parseFloat(monto);
    const saldoPendiente = parseFloat(p.saldo_pendiente);

    if (montoNum > saldoPendiente) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El monto excede el saldo pendiente.' });
    }

    const cuenta = await client.query(
      'SELECT id, saldo FROM cuentas WHERE id = $1 AND usuario_id = $2',
      [cuenta_origen_id, req.user.id]
    );
    if (cuenta.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    if (parseFloat(cuenta.rows[0].saldo) < montoNum) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    await client.query(
      'UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2',
      [montoNum, cuenta_origen_id]
    );

    const nuevoSaldo = saldoPendiente - montoNum;
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : p.estado;

    await client.query(
      `UPDATE prestamos SET saldo_pendiente = $1, estado = $2 WHERE id = $3`,
      [nuevoSaldo, nuevoEstado, id]
    );

    await client.query(
      `INSERT INTO transacciones 
       (cuenta_origen_id, tipo, monto, moneda, descripcion, referencia, estado)
       VALUES ($1, 'pago_prestamo', $2, 'PEN', $3, $4, 'completada')`,
      [cuenta_origen_id, montoNum, `Pago de préstamo ${p.tipo}`, 
       `PREST${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`]
    );

    await client.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
       VALUES ($1, 'Pago de préstamo registrado', $2, 'prestamo')`,
      [req.user.id, `Has pagado S/ ${montoNum} de tu préstamo ${p.tipo}. Saldo pendiente: S/ ${nuevoSaldo}`]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Pago registrado exitosamente',
      saldo_restante: nuevoSaldo,
      estado: nuevoEstado,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en pagarPrestamo:', err.message);
    res.status(500).json({ error: 'Error al procesar el pago.' });
  } finally {
    client.release();
  }
};

module.exports = { getMisPrestamos, solicitarPrestamo, aprobarPrestamo, getCuotas, pagarPrestamo };