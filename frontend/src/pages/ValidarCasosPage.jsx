import { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

export default function ValidarCasosPage() {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validarTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/creditos/validar-todos');
      setResultados(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validarCaso = async (casoNumero) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/creditos/validar-caso/${casoNumero}`);
      alert(`Caso ${casoNumero}:\nCuota calculada: S/ ${data.cuota_calculada}\nCuota esperada: S/ ${data.cuota_esperada}\n${data.valido ? '✅ VALIDO' : '❌ NO VALIDO'}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Validar Casos de Crédito
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>
          Verifica que los 30 casos de crédito empresarial sean calculados correctamente
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={validarTodos}
            disabled={loading}
            style={{ width: 'auto' }}
          >
            {loading ? 'Validando...' : '🔍 Validar todos los casos'}
          </button>
          <span style={{ fontSize: 13, color: '#6B7280' }}>
            {resultados && `${resultados.validos} de ${resultados.total} casos válidos`}
          </span>
          {error && <span className="alert-error" style={{ padding: '4px 12px' }}>❌ {error}</span>}
        </div>
      </div>

      {resultados && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F9FAFB'
          }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
              Resultados de Validación
            </h3>
            <div>
              <span className="badge badge-verde">✅ {resultados.validos} válidos</span>
              <span className="badge badge-rojo" style={{ marginLeft: 8 }}>❌ {resultados.fallidos} fallidos</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 500, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Cliente</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Monto</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Plazo</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>TEA</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Seguro</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Cuota Esperada</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Cuota Calculada</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultados.resultados.map((r, index) => {
                  // Convertir valores a números si son strings
                  const monto = parseFloat(r.monto) || 0;
                  const cuotaEsperada = parseFloat(r.cuota_esperada) || 0;
                  const cuotaCalculada = parseFloat(r.cuota_calculada) || 0;
                  const plazo = parseInt(r.plazo) || 0;
                  const tea = parseFloat(r.tea) || 0;
                  
                  return (
                    <tr 
                      key={r.caso || index} 
                      style={{ 
                        cursor: 'pointer',
                        borderBottom: '1px solid #F3F4F6',
                        background: r.valido ? 'white' : '#FEF2F2'
                      }}
                      onClick={() => validarCaso(r.caso)}
                      onMouseEnter={(e) => {
                        if (r.valido) {
                          e.currentTarget.style.background = '#F9FAFB';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (r.valido) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.caso}</td>
                      <td style={{ padding: '10px 14px' }}>{r.cliente || 'N/A'}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>S/ {monto.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{plazo} meses</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{tea.toFixed(2)}%</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{r.seguro ? '✅ Sí' : '❌ No'}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>S/ {cuotaEsperada.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>S/ {cuotaCalculada.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span className={`badge ${r.valido ? 'badge-verde' : 'badge-rojo'}`}>
                          {r.valido ? '✅ Válido' : '❌ Fallido'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!resultados && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <h4 style={{ color: '#374151', marginBottom: 4 }}>Presiona "Validar todos los casos"</h4>
          <p style={{ fontSize: 14 }}>El sistema verificará los 30 casos de crédito empresarial</p>
        </div>
      )}
    </Layout>
  );
}