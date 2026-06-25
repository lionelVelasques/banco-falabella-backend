import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, authService } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usuario = authService.getUsuario();

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Cargando dashboard...');
        const response = await api.get('/dashboard');
        console.log('📊 Datos del dashboard:', response);
        setData(response);
      } catch (error) {
        console.error('❌ Error al cargar dashboard:', error);
        setError(error.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargarDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loader" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#991B1B' }}>
          <h3>❌ Error al cargar el dashboard</h3>
          <p>{error}</p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
            style={{ width: 'auto', marginTop: 16 }}
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <h3>No hay datos para mostrar</h3>
          <p>Inicia sesión nuevamente para cargar tus datos.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Encabezado */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Hola, {usuario?.nombre || 'Usuario'} 👋
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>
          Bienvenido a tu banca digital. Aquí está el resumen de tus finanzas.
        </p>
      </div>

      {/* Saldo total */}
      <div className="saldo-card" style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>Saldo total en cuentas</p>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
            {fmt(data.saldo_total || 0)}
          </h2>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
            {data.cuentas?.length || 0} cuentas activas · {data.tarjetas?.length || 0} tarjetas
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="kpi-card">
          <div className="flex-between">
            <div>
              <div className="kpi-value">{data.cuentas?.length || 0}</div>
              <div className="kpi-label">Cuentas activas</div>
            </div>
            <div className="kpi-icon">💳</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex-between">
            <div>
              <div className="kpi-value">{data.tarjetas?.length || 0}</div>
              <div className="kpi-label">Tarjetas CMR</div>
            </div>
            <div className="kpi-icon">💎</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex-between">
            <div>
              <div className="kpi-value">{data.prestamos?.length || 0}</div>
              <div className="kpi-label">Préstamos activos</div>
            </div>
            <div className="kpi-icon">📈</div>
          </div>
        </div>
      </div>

      {/* Cuentas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: 16, color: '#111827' }}>
            💳 Mis cuentas
          </h3>
          {data.cuentas?.length ? data.cuentas.map(c => (
            <div key={c.id} className="card" style={{
              padding: 18,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${c.tipo === 'ahorro' ? 'badge-verde' : c.tipo === 'cmr' ? 'badge-azul' : 'badge-gris'}`}>
                    {c.tipo.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>
                    ···{c.numero_cuenta?.slice(-6)}
                  </span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                  {fmt(c.saldo)}
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{c.moneda}</span>
            </div>
          )) : (
            <div className="card" style={{ textAlign: 'center', color: '#6B7280', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏦</div>
              Sin cuentas activas
            </div>
          )}
        </div>

        {/* Tarjetas CMR */}
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: 16, color: '#111827' }}>
            💎 Tarjetas CMR
          </h3>
          {data.tarjetas?.length ? data.tarjetas.map(t => (
            <div key={t.id} className="card" style={{
              padding: 18,
              marginBottom: 10,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: 'white',
            }}>
              <div style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 15, marginBottom: 10 }}>
                {t.numero_enmascarado}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>Disponible</div>
                  <div style={{ fontWeight: 700, color: '#4ADE80' }}>{fmt(t.saldo_disponible)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>Utilizado</div>
                  <div style={{ fontWeight: 700, color: '#F87171' }}>{fmt(t.saldo_utilizado)}</div>
                </div>
              </div>
            </div>
          )) : (
            <div className="card" style={{ textAlign: 'center', color: '#6B7280', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
              Sin tarjetas activas
            </div>
          )}
        </div>
      </div>

      {/* Últimos movimientos */}
      <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: 16, color: '#111827' }}>
        📋 Últimos movimientos
      </h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data.movimientos_recientes?.length ? data.movimientos_recientes.map((m, i) => (
          <div key={m.id} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: i < data.movimientos_recientes.length - 1 ? '1px solid #F3F4F6' : 'none',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              marginRight: 14,
              flexShrink: 0,
            }}>🔄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {m.descripcion || m.tipo?.replace('_', ' ')?.toUpperCase() || 'Movimiento'}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {m.created_at ? new Date(m.created_at).toLocaleDateString('es-PE') : 'Fecha no disponible'}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#E31837' }}>
              {fmt(m.monto)}
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <span>📭</span>
            <h4>Sin movimientos recientes</h4>
            <p>Realiza tu primera transacción para ver el historial aquí.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}