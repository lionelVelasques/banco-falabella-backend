const { pool } = require('../config');

const calcularCuotaMensual = (monto, tea, plazoMeses) => {
    const tasaMensual = Math.pow(1 + tea / 100, 1 / 12) - 1;
    const cuota = (monto * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                  (Math.pow(1 + tasaMensual, plazoMeses) - 1);
    return cuota;
};

const solicitarCredito = async (req, res) => {
    console.log('🔵 Solicitud recibida:', req.body);
    
    const { 
        monto_solicitado, 
        tipo, 
        plazo_meses, 
        ingreso_mensual, 
        deuda_mensual,
        tea,
        seguro_desgravamen,
        fecha_primera_cuota,
        tipo_cliente,
        cliente_nombre,
        cliente_apellido
    } = req.body;
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ============================================================
        // CORREGIDO: Ya no usa 'estado', usa 'activo'
        // ============================================================
        const usuario = await client.query(
            'SELECT id, fecha_nacimiento, email, activo FROM usuarios WHERE id = $1',
            [req.user.id]
        );
        
        if (usuario.rows.length === 0 || !usuario.rows[0].activo) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Usuario no encontrado o inactivo.' });
        }

        // Validar edad
        const fechaNac = new Date(usuario.rows[0].fecha_nacimiento);
        const edad = new Date().getFullYear() - fechaNac.getFullYear();
        if (edad < 18) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Edad mínima para solicitar crédito: 18 años.' });
        }

        // Validar monto mínimo
        if (parseFloat(monto_solicitado) < 500) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'El monto mínimo es S/ 500.' });
        }

        // TEA y seguro
        const teaFinal = tea || 43.92;
        const seguroFinal = seguro_desgravamen || false;

        // Calcular cuota
        const cuotaMensual = calcularCuotaMensual(
            parseFloat(monto_solicitado),
            teaFinal,
            parseInt(plazo_meses)
        );

        console.log(`🔵 Cuota calculada: S/ ${cuotaMensual.toFixed(2)}`);

        // Crear solicitud
        const solicitud = await client.query(
            `INSERT INTO solicitudes_credito 
             (usuario_id, monto_solicitado, tipo, plazo_meses, estado,
              tea, seguro_desgravamen, fecha_primera_cuota, tipo_cliente,
              cliente_nombre, cliente_apellido)
             VALUES ($1, $2, $3, $4, 'pendiente', $5, $6, $7, $8, $9, $10)
             RETURNING id, monto_solicitado, tipo, plazo_meses, estado, created_at`,
            [req.user.id, monto_solicitado, tipo, plazo_meses, 
             teaFinal, seguroFinal, fecha_primera_cuota, tipo_cliente || 'microempresa',
             cliente_nombre || usuario.rows[0].nombre, 
             cliente_apellido || usuario.rows[0].apellido]
        );

        const solicitudId = solicitud.rows[0].id;

        // Scoring
        let scoring = 60;
        let razones = [];

        if (edad >= 25 && edad <= 50) {
            scoring += 15;
        } else if (edad > 50 && edad <= 65) {
            scoring += 10;
        } else if (edad > 65) {
            scoring -= 5;
            razones.push('Edad avanzada');
        }

        const rds = (parseFloat(deuda_mensual || 0) / parseFloat(ingreso_mensual || 1)) * 100;
        if (rds < 20) {
            scoring += 15;
        } else if (rds < 35) {
            scoring += 5;
        } else if (rds < 50) {
            scoring -= 10;
            razones.push('RDS elevado (>35%)');
        } else {
            scoring -= 25;
            razones.push('RDS muy elevado (>50%)');
        }

        const montoAnual = parseFloat(monto_solicitado);
        const ingresoAnual = parseFloat(ingreso_mensual || 0) * 12;
        if (ingresoAnual > 0) {
            if (montoAnual < ingresoAnual * 0.5) {
                scoring += 10;
            } else if (montoAnual < ingresoAnual) {
                scoring += 0;
            } else {
                scoring -= 15;
                razones.push('Monto supera ingreso anual');
            }
        }

        scoring = Math.max(0, Math.min(100, scoring));
        const elegibilidad = scoring >= 55;
        const nivelRiesgo = scoring >= 80 ? 'bajo' : scoring >= 55 ? 'medio' : 'alto';
        const razonRechazo = elegibilidad ? null : razones.join('; ') || 'No cumple criterios mínimos';

        // Guardar evaluación
        await client.query(
            `INSERT INTO evaluacion_credito 
             (solicitud_id, puntaje_scoring, elegibilidad, razon_rechazo, 
              ingreso_mensual, deuda_mensual, rds, nivel_riesgo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [solicitudId, scoring, elegibilidad, razonRechazo, 
             ingreso_mensual || 0, deuda_mensual || 0, rds.toFixed(2), nivelRiesgo]
        );

        // Actualizar estado
        if (elegibilidad) {
            await client.query(
                `UPDATE solicitudes_credito SET estado = 'en_evaluacion' WHERE id = $1`,
                [solicitudId]
            );
        } else {
            await client.query(
                `UPDATE solicitudes_credito SET estado = 'rechazado' WHERE id = $1`,
                [solicitudId]
            );
        }

        // Notificar
        await client.query(
            `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
             VALUES ($1, 'Solicitud de crédito recibida', $2, 'prestamo')`,
            [req.user.id, 
             elegibilidad ? 
             `Tu solicitud de S/ ${monto_solicitado} está en evaluación. Cuota estimada: S/ ${cuotaMensual.toFixed(2)}` :
             `Tu solicitud de S/ ${monto_solicitado} ha sido rechazada. Motivo: ${razonRechazo || 'No cumple criterios'}`]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: elegibilidad ? 'Solicitud en evaluación' : 'Solicitud rechazada',
            solicitud: solicitud.rows[0],
            evaluacion: {
                scoring,
                elegibilidad,
                rds: rds.toFixed(2),
                nivel_riesgo: nivelRiesgo,
                razon_rechazo: razonRechazo,
                cuota_mensual: cuotaMensual.toFixed(2),
                tea: teaFinal,
                seguro_desgravamen: seguroFinal
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error en solicitarCredito:', err.message);
        console.error('❌ Stack:', err.stack);
        res.status(500).json({ 
            error: 'Error al procesar la solicitud de crédito.',
            details: err.message 
        });
    } finally {
        client.release();
    }
};

const getMisSolicitudes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, e.puntaje_scoring, e.elegibilidad, e.rds, e.nivel_riesgo,
                    d.nivel_aprobacion, d.monto_aprobado, d.tasa_interes_aprobada, d.estado AS estado_dictamen
             FROM solicitudes_credito s
             LEFT JOIN evaluacion_credito e ON e.solicitud_id = s.id
             LEFT JOIN dictamen_credito d ON d.solicitud_id = s.id
             WHERE s.usuario_id = $1
             ORDER BY s.created_at DESC`,
            [req.user.id]
        );
        res.json({ solicitudes: result.rows });
    } catch (err) {
        console.error('❌ Error en getMisSolicitudes:', err.message);
        res.status(500).json({ error: 'Error al obtener solicitudes.' });
    }
};

const getPendientes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                s.id AS solicitud_id,
                s.usuario_id,
                COALESCE(s.cliente_nombre, u.nombre) || ' ' || COALESCE(s.cliente_apellido, u.apellido) AS cliente,
                u.email,
                u.telefono,
                s.monto_solicitado,
                s.tipo,
                s.plazo_meses,
                s.estado,
                s.tea,
                s.seguro_desgravamen,
                s.tipo_cliente,
                s.fecha_primera_cuota,
                e.puntaje_scoring,
                e.elegibilidad,
                e.rds,
                e.nivel_riesgo,
                e.razon_rechazo,
                s.created_at
             FROM solicitudes_credito s
             JOIN usuarios u ON u.id = s.usuario_id
             LEFT JOIN evaluacion_credito e ON e.solicitud_id = s.id
             WHERE s.estado = 'en_evaluacion'
             ORDER BY s.created_at ASC`
        );
        res.json({ pendientes: result.rows });
    } catch (err) {
        console.error('❌ Error en getPendientes:', err.message);
        res.status(500).json({ error: 'Error al obtener solicitudes pendientes.' });
    }
};

const getPendientesComite = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                s.id AS solicitud_id,
                s.usuario_id,
                COALESCE(s.cliente_nombre, u.nombre) || ' ' || COALESCE(s.cliente_apellido, u.apellido) AS cliente,
                u.email,
                u.telefono,
                s.monto_solicitado,
                s.tipo,
                s.plazo_meses,
                s.tea,
                s.seguro_desgravamen,
                s.tipo_cliente,
                e.puntaje_scoring,
                e.rds,
                e.nivel_riesgo,
                s.created_at
             FROM solicitudes_credito s
             JOIN usuarios u ON u.id = s.usuario_id
             LEFT JOIN evaluacion_credito e ON e.solicitud_id = s.id
             WHERE s.estado = 'en_evaluacion' 
               AND s.monto_solicitado > 50000
             ORDER BY s.created_at ASC`
        );
        res.json({ pendientes_comite: result.rows });
    } catch (err) {
        console.error('❌ Error en getPendientesComite:', err.message);
        res.status(500).json({ error: 'Error al obtener solicitudes para comité.' });
    }
};

const aprobarCredito = async (req, res) => {
    const { id } = req.params;
    const { monto_aprobado, tasa_interes, plazo_meses, observaciones, accion } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const solicitud = await client.query(
            `SELECT s.*, u.nombre || ' ' || u.apellido AS cliente, u.email
             FROM solicitudes_credito s
             JOIN usuarios u ON u.id = s.usuario_id
             WHERE s.id = $1 AND s.estado = 'en_evaluacion'`,
            [id]
        );
        if (solicitud.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada.' });
        }

        const s = solicitud.rows[0];
        const monto = parseFloat(monto_aprobado || s.monto_solicitado);
        const tea = parseFloat(s.tea || 43.92);

        const cuotaMensual = calcularCuotaMensual(monto, tea, parseInt(plazo_meses || s.plazo_meses));

        let nivelAprobacion;
        if (monto <= 10000) {
            nivelAprobacion = 'admin';
        } else if (monto <= 50000) {
            nivelAprobacion = 'jefe_riesgos';
        } else if (monto <= 200000) {
            nivelAprobacion = 'comite_credito';
        } else {
            nivelAprobacion = 'gerencia_general';
        }

        await client.query(
            `INSERT INTO dictamen_credito 
             (solicitud_id, nivel_aprobacion, usuario_aprobador_id, 
              monto_aprobado, tasa_interes_aprobada, plazo_aprobado, 
              observaciones, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, nivelAprobacion, req.user.id, 
             monto, tasa_interes || tea, plazo_meses || s.plazo_meses,
             observaciones, accion === 'aprobar' ? 'aprobado' : 'rechazado']
        );

        const nuevoEstado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
        await client.query(
            `UPDATE solicitudes_credito SET estado = $1 WHERE id = $2`,
            [nuevoEstado, id]
        );

        if (accion === 'aprobar') {
            const cuenta = await client.query(
                `SELECT id FROM cuentas WHERE usuario_id = $1 AND tipo = 'ahorro' AND estado = 'activa' LIMIT 1`,
                [s.usuario_id]
            );
            if (cuenta.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'El usuario no tiene una cuenta activa para desembolso.' });
            }
            const cuentaId = cuenta.rows[0].id;

            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (plazo_meses || s.plazo_meses));

            const prestamo = await client.query(
                `INSERT INTO prestamos 
                 (usuario_id, cuenta_id, monto_solicitado, monto_aprobado, 
                  tasa_interes, plazo_meses, cuota_mensual, saldo_pendiente,
                  tipo, estado, fecha_aprobacion, fecha_desembolso, fecha_vencimiento,
                  seguro_desgravamen, fecha_primera_cuota, tipo_cliente)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11, $12, $13, $14)
                 RETURNING id`,
                [s.usuario_id, cuentaId, s.monto_solicitado, monto,
                 tea, plazo_meses || s.plazo_meses, cuotaMensual.toFixed(2), monto,
                 s.tipo, 'desembolsado', fechaVencimiento,
                 s.seguro_desgravamen || false, s.fecha_primera_cuota, s.tipo_cliente || 'personal']
            );

            const prestamoId = prestamo.rows[0].id;

            await client.query(
                `UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2`,
                [monto, cuentaId]
            );

            await client.query(
                `INSERT INTO transacciones 
                 (cuenta_destino_id, tipo, monto, moneda, descripcion, estado)
                 VALUES ($1, 'abono', $2, 'PEN', 'Desembolso de crédito aprobado', 'completada')`,
                [cuentaId, monto]
            );

            let saldoRestante = monto;
            const tasaMensual = Math.pow(1 + tea / 100, 1 / 12) - 1;
            const cuotaFija = parseFloat(cuotaMensual.toFixed(2));
            
            let fechaCuota = new Date(s.fecha_primera_cuota || new Date());
            
            for (let n = 1; n <= (plazo_meses || s.plazo_meses); n++) {
                const interes = saldoRestante * tasaMensual;
                const capital = cuotaFija - interes;
                saldoRestante -= capital;
                
                await client.query(
                    `INSERT INTO cuotas_prestamo 
                     (prestamo_id, numero_cuota, monto_cuota, monto_capital, monto_interes, fecha_vencimiento)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [prestamoId, n, cuotaFija, capital.toFixed(2), interes.toFixed(2), fechaCuota]
                );
                
                fechaCuota.setMonth(fechaCuota.getMonth() + 1);
            }

            await client.query(
                `INSERT INTO cartera_mora (prestamo_id, usuario_id, saldo_vencido)
                 VALUES ($1, $2, 0)`,
                [prestamoId, s.usuario_id]
            );

            await client.query(
                `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
                 VALUES ($1, '¡Crédito aprobado!', $2, 'prestamo')`,
                [s.usuario_id, `Tu crédito por S/ ${monto} ha sido aprobado y desembolsado. Cuota mensual: S/ ${cuotaFija}`]
            );
        }

        await client.query('COMMIT');

        res.json({
            message: accion === 'aprobar' ? 'Crédito aprobado y desembolsado exitosamente.' : 'Crédito rechazado.',
            nivel_aprobacion: nivelAprobacion
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error en aprobarCredito:', err.message);
        console.error('❌ Stack:', err.stack);
        res.status(500).json({ 
            error: 'Error al procesar la aprobación del crédito.',
            details: err.message 
        });
    } finally {
        client.release();
    }
};

const validarCaso = async (req, res) => {
    const { caso_numero } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT * FROM casos_prueba_credito WHERE caso_numero = $1`,
            [caso_numero]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }
        
        const caso = result.rows[0];
        
        const cuotaCalculada = calcularCuotaMensual(
            parseFloat(caso.monto),
            parseFloat(caso.tea),
            parseInt(caso.plazo_meses)
        );
        
        const cuotaEsperada = parseFloat(caso.cuota_esperada);
        const diferencia = Math.abs(cuotaCalculada - cuotaEsperada);
        const esValido = diferencia < 0.01;
        
        res.json({
            caso: caso.caso_numero,
            cliente: `${caso.cliente_nombre} ${caso.cliente_apellido}`,
            monto: caso.monto,
            plazo: caso.plazo_meses,
            tea: caso.tea,
            seguro: caso.seguro_desgravamen,
            cuota_calculada: cuotaCalculada.toFixed(2),
            cuota_esperada: cuotaEsperada.toFixed(2),
            diferencia: diferencia.toFixed(4),
            valido: esValido
        });
    } catch (err) {
        console.error('❌ Error en validarCaso:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const validarTodosCasos = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM casos_prueba_credito ORDER BY caso_numero`
        );
        
        const resultados = result.rows.map(caso => {
            const cuotaCalculada = calcularCuotaMensual(
                parseFloat(caso.monto),
                parseFloat(caso.tea),
                parseInt(caso.plazo_meses)
            );
            
            const cuotaEsperada = parseFloat(caso.cuota_esperada);
            const diferencia = Math.abs(cuotaCalculada - cuotaEsperada);
            const esValido = diferencia < 0.01;
            
            return {
                caso: caso.caso_numero,
                cliente: `${caso.cliente_nombre} ${caso.cliente_apellido}`,
                monto: caso.monto,
                plazo: caso.plazo_meses,
                tea: caso.tea,
                seguro: caso.seguro_desgravamen,
                cuota_calculada: cuotaCalculada.toFixed(2),
                cuota_esperada: cuotaEsperada.toFixed(2),
                diferencia: diferencia.toFixed(4),
                valido: esValido
            };
        });
        
        const totalValidos = resultados.filter(r => r.valido).length;
        
        res.json({
            total: resultados.length,
            validos: totalValidos,
            fallidos: resultados.length - totalValidos,
            resultados: resultados
        });
    } catch (err) {
        console.error('❌ Error en validarTodosCasos:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    solicitarCredito,
    getMisSolicitudes,
    getPendientes,
    getPendientesComite,
    aprobarCredito,
    validarCaso,
    validarTodosCasos,
    calcularCuotaMensual
};