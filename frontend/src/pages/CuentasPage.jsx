import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const tipoIcon = (tipo) => ({ 
  transferencia: '↔️', 
  deposito: '⬆️', 
  retiro: '⬇️', 
  pago_tarjeta: '💳', 
  abono: '✅',
  pago_servicio: '⚡',
  pago_prestamo: '🏦',
  compra_cmr: '🛍️',
  cargo_interes: '📊'
}[tipo] || '💰');

const tipoColor = (tipo, esOrigen) => {
  if (tipo === 'deposito' || tipo === 'abono') return 'monto-positivo';
  if (tipo === 'retiro' || tipo === 'transferencia' || tipo === 'pago_servicio' || tipo === 'pago_prestamo') return 'monto-negativo';
  if (esOrigen) return 'monto-negativo';
  return 'monto-positivo';
};

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [totalMovimientos, setTotalMovimientos] = useState(0);
  const limit = 20;

  useEffect(() => {
    api.get('/cuentas').then(d => {
      setCuentas(d.cuentas || []);
      if (d.cuentas.length > 0) setSelected(d.cuentas[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) {
      cargarMovimientos();
    }
  }, [selected, pagina, filtro]);

  const cargarMovimientos = async () => {
    try {
      const offset = (pagina - 1) * limit;
      const data = await api.get(`/cuentas/${selected.id}/movimientos?limit=${limit}&offset=${offset}`);
      setMovimientos(data.movimientos || []);
      setTotalMovimientos(data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // EXPORTAR PDF - CORREGIDO
  // ============================================================
const exportarPDF = async () => {
  if (!selected) return;
  setExportando(true);
  try {
    const token = localStorage.getItem('bf_token');
    // ✅ CORREGIDO: Usar la URL de Render
    const url = `https://banco-falabella-backend-4309.onrender.com/api/exportar/movimientos-pdf?cuenta_id=${selected.id}&token=${token}`;
    console.log('📄 Exportando PDF desde:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al generar el PDF');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `movimientos_cuenta_${selected.numero_cuenta}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
  } catch (err) {
    console.error('Error al exportar PDF:', err);
    alert('❌ Error al exportar el PDF. Intenta nuevamente.');
  } finally {
    setExportando(false);
  }
};

  const getTipoLabel = (tipo) => {
    const labels = {
      transferencia: 'Transferencia',
      deposito: 'Depósito',
      retiro: 'Retiro',
      pago_tarjeta: 'Pago Tarjeta',
      abono: 'Abono',
      pago_servicio: 'Pago Servicio',
      pago_prestamo: 'Pago Préstamo',
      compra_cmr: 'Compra CMR',
      cargo_interes: 'Cargo Interés'
    };
    return labels[tipo] || tipo;
  };

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtro === 'todos') return true;
    if (filtro === 'ingresos') return m.cuenta_destino === selected?.numero_cuenta;
    if (filtro === 'gastos') return m.cuenta_origen === selected?.numero_cuenta;
    return true;
  });

  const totalPaginas = Math.ceil(totalMovimientos / limit);

  if (loading) return <Layout><div className="loader" /></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Mis Cuentas</h1>
        {selected && (
          <button
            onClick={exportarPDF}
            disabled={exportando}
            style={{
              background: 'linear-gradient(135deg, #E31837 0%, #991B1B 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(227, 24, 55, 0.3)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 24px rgba(227, 24, 55, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(227, 24, 55, 0.3)';
            }}
          >
            {exportando ? '⏳ Generando...' : '📄 Exportar PDF'}
          </button>
        )}
      </div>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        Consulta tus saldos y movimientos
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {cuentas.map(c => (
          <button
            key={c.id}
            onClick={() => {
              setSelected(c);
              setPagina(1);
              setFiltro('todos');
            }}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              background: selected?.id === c.id ? '#00A550' : 'white',
              color: selected?.id === c.id ? 'white' : '#374151',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{c.tipo === 'ahorro' ? '🏦' : c.tipo === 'cmr' ? '💳' : '💰'}</span>
            {c.tipo.toUpperCase()} ···{c.numero_cuenta?.slice(-6)}
            <span style={{
              fontSize: 11,
              opacity: 0.7,
              background: selected?.id === c.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
              padding: '2px 8px',
              borderRadius: 999,
            }}>
              {fmt(c.saldo)}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, #003D1F 0%, #00A550 100%)',
            borderRadius: 18,
            padding: '28px 32px',
            color: 'white',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                Cuenta {selected.tipo} · {selected.moneda}
              </div>
              <div style={{ fontFamily: 'monospace', letterSpacing: 2, marginBottom: 12, opacity: 0.9 }}>
                {selected.numero_cuenta}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{fmt(selected.saldo)}</div>
            </div>
            <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 14px',
                  borderRadius: 999,
                  fontSize: 11,
                }}>
                  {selected.estado === 'activa' ? '✅ Activa' : selected.estado}
                </span>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
                {movimientos.length} movimientos
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { value: 'todos', label: '📋 Todos' },
              { value: 'ingresos', label: '⬆️ Ingresos' },
              { value: 'gastos', label: '⬇️ Gastos' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: 'none',
                  background: filtro === f.value ? '#00A550' : '#F3F4F6',
                  color: filtro === f.value ? 'white' : '#374151',
                  fontWeight: filtro === f.value ? 600 : 400,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
            <span style={{ fontSize: 12, color: '#6B7280', alignSelf: 'center' }}>
              {movimientosFiltrados.length} de {totalMovimientos} movimientos
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Movimientos</h3>
            </div>

            {movimientosFiltrados.length ? (
              <>
                {movimientosFiltrados.map((m, i) => {
                  const esOrigen = m.cuenta_origen === selected.numero_cuenta;
                  const esDestino = m.cuenta_destino === selected.numero_cuenta;
                  const esIngreso = esDestino && !esOrigen;
                  
                  return (
                    <div key={m.id} style={{
                      display: 'flex',
                      padding: '14px 24px',
                      alignItems: 'center',
                      borderBottom: i < movimientosFiltrados.length - 1 ? '1px solid #F3F4F6' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: esIngreso ? '#E8F7EF' : '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        marginRight: 14,
                        flexShrink: 0,
                      }}>{tipoIcon(m.tipo)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {m.descripcion || getTipoLabel(m.tipo)}
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          <span>{getTipoLabel(m.tipo)}</span>
                          {m.referencia && <span>· {m.referencia}</span>}
                          <span>· {new Date(m.created_at).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
                          {esOrigen && <span style={{ color: '#E31837' }}>· De: {m.cuenta_origen?.slice(-6)}</span>}
                          {esDestino && <span style={{ color: '#00A550' }}>· A: {m.cuenta_destino?.slice(-6)}</span>}
                        </div>
                      </div>
                      <div className={tipoColor(m.tipo, esOrigen)} style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 12 }}>
                        {esIngreso ? '+' : '-'}{fmt(m.monto)}
                      </div>
                    </div>
                  );
                })}

                {totalPaginas > 1 && (
                  <div style={{
                    padding: '14px 24px',
                    borderTop: '1px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      Mostrando {(pagina - 1) * limit + 1} - {Math.min(pagina * limit, totalMovimientos)} de {totalMovimientos}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: '1px solid #D1D5DB',
                          background: pagina === 1 ? '#F3F4F6' : 'white',
                          color: pagina === 1 ? '#6B7280' : '#374151',
                          cursor: pagina === 1 ? 'default' : 'pointer',
                          fontSize: 12,
                        }}
                      >
                        ◀ Anterior
                      </button>
                      <span style={{ padding: '6px 14px', color: '#374151', fontSize: 12 }}>
                        Página {pagina} de {totalPaginas}
                      </span>
                      <button
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                        disabled={pagina === totalPaginas}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: '1px solid #D1D5DB',
                          background: pagina === totalPaginas ? '#F3F4F6' : 'white',
                          color: pagina === totalPaginas ? '#6B7280' : '#374151',
                          cursor: pagina === totalPaginas ? 'default' : 'pointer',
                          fontSize: 12,
                        }}
                      >
                        Siguiente ▶
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <span>📭</span>
                <h4>Sin movimientos</h4>
                <p>No hay movimientos para mostrar en esta cuenta</p>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}