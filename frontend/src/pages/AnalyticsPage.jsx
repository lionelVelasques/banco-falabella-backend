import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const COLORS = ['#00A550', '#E31837', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [resumen, setResumen] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/resumen'),
      api.get('/analytics/gastos-por-mes'),
    ]).then(([r, g]) => {
      setResumen(r.resumen || r);
      setGastos(g.datos || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loader" /></Layout>;

  const barData = gastos.reduce((acc, item) => {
    const existe = acc.find(a => a.mes === item.mes);
    if (existe) {
      existe[item.tipo] = parseFloat(item.total);
    } else {
      acc.push({ mes: item.mes, [item.tipo]: parseFloat(item.total) });
    }
    return acc;
  }, []);

  const pieData = resumen?.por_tipo?.map(p => ({
    name: p.tipo,
    value: parseFloat(p.total),
  })) || [];

  const evolucion = resumen?.evolucion?.map(e => ({
    mes: e.mes,
    variacion: parseFloat(e.variacion),
  })) || [];

  const r = resumen;

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Análisis financiero</h1>
      <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 28 }}>Resumen de tus finanzas del mes</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Ingresos del mes', value: fmt(r?.ingresos_mes), color: 'var(--verde)', bg: 'var(--verde-claro)', icon: '📈' },
          { label: 'Gastos del mes', value: fmt(r?.gastos_mes), color: 'var(--rojo)', bg: '#FEE2E2', icon: '📉' },
          {
            label: 'Balance neto',
            value: fmt(r?.balance_mes),
            color: (r?.balance_mes || 0) >= 0 ? 'var(--verde)' : 'var(--rojo)',
            bg: (r?.balance_mes || 0) >= 0 ? 'var(--verde-claro)' : '#FEE2E2',
            icon: '⚖️'
          },
        ].map(k => (
          <div key={k.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: k.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--gris-500)', marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Movimientos por mes</h3>
          {barData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="transferencia" fill="#00A550" radius={[4, 4, 0, 0]} name="Transferencias" />
                <Bar dataKey="retiro" fill="#E31837" radius={[4, 4, 0, 0]} name="Retiros" />
                <Bar dataKey="deposito" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Depósitos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><span>📊</span>Sin datos suficientes</div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Distribución por tipo</h3>
          {pieData.length ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}>
                {pieData.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--gris-700)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{fmt(p.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state"><span>🥧</span>Sin datos</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Variación de saldo (últimos 6 meses)</h3>
        {evolucion.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Line type="monotone" dataKey="variacion" stroke="#00A550" strokeWidth={2.5}
                dot={{ fill: '#00A550', r: 4 }} name="Variación" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state"><span>📈</span>Sin datos de evolución</div>
        )}
      </div>
    </Layout>
  );
}