const { pool } = require('../config');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const config = require('../config');

const exportarMovimientosPDF = async (req, res) => {
  try {
    // Verificar token desde query o header
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const { cuenta_id } = req.query;

    if (!cuenta_id) {
      return res.status(400).json({ error: 'ID de cuenta no proporcionado' });
    }

    // Verificar que la cuenta existe y pertenece al usuario
    const cuentaCheck = await pool.query(
      'SELECT id, numero_cuenta, tipo, moneda, saldo, usuario_id FROM cuentas WHERE id = $1',
      [cuenta_id]
    );
    
    if (cuentaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    const cuenta = cuentaCheck.rows[0];

    // Verificar que la cuenta pertenece al usuario del token
    if (cuenta.usuario_id !== decoded.id) {
      // Verificar si es admin
      const userCheck = await pool.query(
        'SELECT tipo_usuario FROM usuarios WHERE id = $1',
        [decoded.id]
      );
      if (userCheck.rows.length === 0 || userCheck.rows[0].tipo_usuario !== 'admin') {
        return res.status(403).json({ error: 'No tienes acceso a esta cuenta.' });
      }
    }

    // Obtener transacciones de la cuenta
    const result = await pool.query(
      `SELECT t.id, t.tipo, t.monto, t.moneda, t.descripcion, t.referencia, t.created_at,
              co.numero_cuenta AS cuenta_origen, cd.numero_cuenta AS cuenta_destino
       FROM transacciones t
       LEFT JOIN cuentas co ON co.id = t.cuenta_origen_id
       LEFT JOIN cuentas cd ON cd.id = t.cuenta_destino_id
       WHERE (t.cuenta_origen_id = $1 OR t.cuenta_destino_id = $1)
         AND t.estado = 'completada'
       ORDER BY t.created_at DESC
       LIMIT 500`,
      [cuenta_id]
    );

    const movimientos = result.rows;

    // ============================================================
    // CREAR PDF
    // ============================================================
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Configurar respuesta para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=movimientos_${new Date().toISOString().slice(0, 10)}.pdf`);
    res.setHeader('Cache-Control', 'no-cache');
    
    doc.pipe(res);

    // ============================================================
    // ENCABEZADO
    // ============================================================
    doc.fontSize(22)
       .fillColor('#00A550')
       .text('Banco Falabella', { align: 'center' })
       .moveDown(0.3);

    doc.fontSize(14)
       .fillColor('#333333')
       .text('Extracto de Movimientos', { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(10)
       .fillColor('#666666')
       .text(`Cuenta: ${cuenta.numero_cuenta || 'N/A'}`, { align: 'left' })
       .text(`Tipo: ${cuenta.tipo?.toUpperCase() || 'N/A'}`, { align: 'left' })
       .text(`Saldo actual: S/ ${parseFloat(cuenta.saldo || 0).toFixed(2)}`, { align: 'left' })
       .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-PE')}`, { align: 'left' })
       .text(`Hora: ${new Date().toLocaleTimeString('es-PE')}`, { align: 'left' })
       .moveDown(0.8);

    doc.strokeColor('#00A550').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // ============================================================
    // TABLA DE MOVIMIENTOS
    // ============================================================
    const tableTop = doc.y;
    const tableHeight = 22;

    // Encabezados
    doc.fontSize(9)
       .fillColor('#FFFFFF')
       .rect(50, tableTop, 500, tableHeight)
       .fill('#00A550');

    doc.fillColor('#FFFFFF')
       .text('Fecha', 55, tableTop + 6, { width: 80 })
       .text('Tipo', 135, tableTop + 6, { width: 70 })
       .text('Descripción', 205, tableTop + 6, { width: 130 })
       .text('Origen', 335, tableTop + 6, { width: 80 })
       .text('Destino', 415, tableTop + 6, { width: 80 })
       .text('Monto', 495, tableTop + 6, { width: 60, align: 'right' });

    let y = tableTop + tableHeight + 5;
    const pageHeight = doc.page.height - 100;

    if (movimientos.length === 0) {
      doc.fontSize(12)
         .fillColor('#999999')
         .text('No hay movimientos para mostrar en esta cuenta', 50, y, { align: 'center' });
    }

    movimientos.forEach((m, i) => {
      // Salto de página si es necesario
      if (y > pageHeight) {
        doc.addPage();
        y = 50;
        // Repetir encabezados
        doc.fontSize(9)
           .fillColor('#FFFFFF')
           .rect(50, y, 500, tableHeight)
           .fill('#00A550');
        doc.fillColor('#FFFFFF')
           .text('Fecha', 55, y + 6, { width: 80 })
           .text('Tipo', 135, y + 6, { width: 70 })
           .text('Descripción', 205, y + 6, { width: 130 })
           .text('Origen', 335, y + 6, { width: 80 })
           .text('Destino', 415, y + 6, { width: 80 })
           .text('Monto', 495, y + 6, { width: 60, align: 'right' });
        y += tableHeight + 5;
      }

      // Alternar colores de fila
      if (i % 2 === 0) {
        doc.rect(50, y - 2, 500, 20).fill('#F9FAFB');
      }

      const monto = parseFloat(m.monto);
      const esIngreso = m.cuenta_destino === cuenta.numero_cuenta;

      doc.fillColor('#333333')
         .fontSize(8)
         .text(new Date(m.created_at).toLocaleDateString('es-PE'), 55, y, { width: 80 })
         .text(m.tipo || 'N/A', 135, y, { width: 70 })
         .text((m.descripcion || 'N/A').substring(0, 25), 205, y, { width: 130 })
         .text(m.cuenta_origen || 'N/A', 335, y, { width: 80 })
         .text(m.cuenta_destino || 'N/A', 415, y, { width: 80 });

      doc.fillColor(esIngreso ? '#00A550' : '#E31837')
         .text(`${esIngreso ? '+' : '-'}S/ ${monto.toFixed(2)}`, 495, y, { width: 60, align: 'right' });

      y += 22;
    });

    // ============================================================
    // PIE DE PÁGINA
    // ============================================================
    doc.moveDown(2);
    doc.strokeColor('#00A550').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.fontSize(8)
       .fillColor('#999999')
       .text(`Total de movimientos: ${movimientos.length}`, 50, doc.y + 10)
       .text(`Generado el: ${new Date().toLocaleString('es-PE')}`, { align: 'right' });

    // Finalizar PDF
    doc.end();

  } catch (err) {
    console.error('❌ Error en exportarMovimientosPDF:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ error: 'Error al generar el PDF: ' + err.message });
  }
};

module.exports = { exportarMovimientosPDF };