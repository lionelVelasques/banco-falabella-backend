const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin, isJefeRiesgos, isComite, isGerencia } = require('../middleware/auth');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cuentaController = require('../controllers/cuentaController');
const transferenciaController = require('../controllers/transferenciaController');
const tarjetaController = require('../controllers/tarjetaController');
const prestamoController = require('../controllers/prestamoController');
const creditoController = require('../controllers/creditoController');
const analyticsController = require('../controllers/analyticsController');
const recuperacionesController = require('../controllers/recuperacionesController');
const exportController = require('../controllers/exportController');
const pagosServiciosController = require('../controllers/pagosServiciosController');

// ============================================================
// RUTAS PÚBLICAS
// ============================================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/recuperar-solicitar', authController.solicitarRecuperacion);
router.post('/auth/recuperar', authController.recuperarPassword);

// ============================================================
// RUTAS PROTEGIDAS
// ============================================================
router.use(authMiddleware);

// ----- AUTH -----
router.put('/auth/perfil', userController.actualizarPerfil);
router.post('/auth/cambiar-password', userController.cambiarPassword);

// ----- USUARIO -----
router.get('/user/profile', userController.getProfile);
router.get('/user/accounts', userController.getAccounts);
router.get('/user/cards', userController.getCards);
router.get('/user/loans', userController.getLoans);
router.get('/user/transactions/:cuenta_id', userController.getTransactions);

// ----- CUENTAS -----
router.get('/cuentas', cuentaController.getMisCuentas);
router.get('/cuentas/:id/movimientos', cuentaController.getMovimientos);
router.get('/dashboard', cuentaController.getDashboard); // ← RUTA DEL DASHBOARD

// ----- TRANSFERENCIAS -----
router.post('/transferencias', transferenciaController.realizarTransferencia);
router.get('/transferencias/historial', transferenciaController.getHistorial);

// ----- TARJETAS CMR -----
router.get('/tarjetas', tarjetaController.getMisTarjetas);
router.post('/tarjetas', tarjetaController.solicitarTarjeta);
router.post('/tarjetas/:id/pagar', tarjetaController.pagarTarjeta);
router.get('/tarjetas/:id/movimientos', tarjetaController.getMovimientosTarjeta);

// ----- PRÉSTAMOS -----
router.get('/prestamos', prestamoController.getMisPrestamos);
router.post('/prestamos/solicitar', prestamoController.solicitarPrestamo);
router.get('/prestamos/:id/cuotas', prestamoController.getCuotas);
router.post('/prestamos/:id/pagar', prestamoController.pagarPrestamo);

// ----- CRÉDITOS -----
router.post('/creditos/solicitar', creditoController.solicitarCredito);
router.get('/creditos/mis-solicitudes', creditoController.getMisSolicitudes);

// ----- ANALYTICS -----
router.get('/analytics/gastos-por-mes', analyticsController.gastosPorMes);
router.get('/analytics/resumen', analyticsController.resumenFinanciero);

// ----- PAGOS DE SERVICIOS -----
router.post('/pagos-servicios/pagar', pagosServiciosController.pagarServicio);
router.get('/pagos-servicios/historial', pagosServiciosController.getHistorialPagos);

// ----- EXPORTAR PDF -----
router.get('/exportar/movimientos-pdf', exportController.exportarMovimientosPDF);

// ============================================================
// RUTAS DE ADMINISTRADOR
// ============================================================
router.get('/creditos/pendientes', isAdmin, creditoController.getPendientes);
router.get('/creditos/pendientes-comite', isAdmin, creditoController.getPendientesComite);
router.post('/creditos/:id/aprobar', isAdmin, creditoController.aprobarCredito);

router.post('/prestamos/:id/aprobar', isAdmin, prestamoController.aprobarPrestamo);

router.get('/recuperaciones/mora', isAdmin, recuperacionesController.getMora);
router.get('/recuperaciones/kpis', isAdmin, recuperacionesController.getKPIs);
router.get('/recuperaciones/:id/gestiones', isAdmin, recuperacionesController.getGestiones);
router.post('/recuperaciones/:id/gestion', isAdmin, recuperacionesController.registrarGestion);
router.post('/recuperaciones/:id/derivar-judicial', isAdmin, recuperacionesController.derivarJudicial);
router.post('/recuperaciones/:id/castigar', isAdmin, recuperacionesController.castigar);

router.get('/creditos/validar-caso/:caso_numero', isAdmin, creditoController.validarCaso);
router.get('/creditos/validar-todos', isAdmin, creditoController.validarTodosCasos);

module.exports = router;