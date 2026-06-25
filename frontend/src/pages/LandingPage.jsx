import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FFFFFF', 
      fontFamily: 'Inter, sans-serif',
      color: '#1A1A1A'
    }}>
      {/* HEADER */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '2px solid #00A550',
        padding: '0 60px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 20px rgba(0, 165, 80, 0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          {/* LOGO */}
          <Logo size="md" linkTo="/" />

          {/* Navegación Desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {['Tarjetas', 'Créditos', 'Cuentas', 'CMR Puntos', 'Seguros', 'Promociones', 'Sostenibilidad', 'Educación'].map(item => (
              <a 
                key={item} 
                href="#" 
                style={{ 
                  color: '#4B5563', 
                  fontSize: 13, 
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  borderBottom: '2px solid transparent',
                  paddingBottom: 4,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={e => { 
                  e.target.style.color = '#00A550'; 
                  e.target.style.borderBottomColor = '#00A550';
                }}
                onMouseLeave={e => { 
                  e.target.style.color = '#4B5563'; 
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Acciones derecha */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input 
              type="text" 
              placeholder="🔍 Buscar..." 
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '2px solid #E5E7EB',
                fontSize: 13,
                outline: 'none',
                width: 200,
                transition: 'all 0.3s',
                background: '#F9FAFB',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#00A550';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 165, 80, 0.15)';
                e.target.style.background = 'white';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#F9FAFB';
              }}
            />
            
            {/* Botón para clientes */}
            <Link 
              to="/register" 
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
                color: 'white',
                padding: '10px 24px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.35)',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 24px rgba(255, 107, 53, 0.45)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(255, 107, 53, 0.35)';
              }}
            >
              ✨ Hazte Cliente
            </Link>
            
            {/* Botón Banca Internet (clientes) */}
            <Link 
              to="/login" 
              style={{
                background: 'linear-gradient(135deg, #00A550 0%, #007A3A 100%)',
                color: 'white',
                padding: '10px 28px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(0, 165, 80, 0.35)',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 24px rgba(0, 165, 80, 0.45)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 165, 80, 0.35)';
              }}
            >
              🏦 Banca Internet
            </Link>

            {/* Botón para Administradores */}
            <Link 
              to="/admin-login" 
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #E31837 100%)',
                color: 'white',
                padding: '10px 24px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(227, 24, 55, 0.35)',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 24px rgba(227, 24, 55, 0.45)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(227, 24, 55, 0.35)';
              }}
            >
              👑 Administradores
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #0D1117 0%, #003D1F 40%, #00A550 100%)',
        padding: '100px 60px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -150,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 200, 83, 0.10) 0%, transparent 70%)',
        }} />

        <div style={{ 
          maxWidth: 1400, 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 60,
          position: 'relative',
          zIndex: 1,
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 69, 0, 0.1) 100%)',
              color: '#FF6B35',
              padding: '8px 24px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 28,
              border: '1px solid rgba(255, 107, 53, 0.2)',
            }}>
              🚀 ¡NUEVO! Banca 100% digital
            </div>
            <h1 style={{
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: '-1.5px',
            }}>
              Pide tu <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #00A550 0%, #00E676 50%, #FF6B35 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradientMove 3s ease infinite',
              }}>
                CMR 100% digital
              </span>
            </h1>
            <p style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 500,
              lineHeight: 1.8,
              marginBottom: 36,
            }}>
              Úsala al instante desde tu App. Acumula más CMR Puntos y canjéalos en las mejores tiendas. 
              <span style={{ color: '#FF6B35', fontWeight: 700 }}> ¡Sin costo de emisión!</span>
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link 
                to="/register" 
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
                  color: 'white',
                  padding: '16px 44px',
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 16,
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 24px rgba(255, 107, 53, 0.4)',
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.5)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 24px rgba(255, 107, 53, 0.4)';
                }}
              >
                ✨ Solicítala aquí →
              </Link>
              <Link 
                to="/login" 
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  padding: '16px 40px',
                  borderRadius: 14,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: 'none',
                  border: '2px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255,255,255,0.12)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                👤 Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Tarjeta CMR */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{
              width: '100%',
              maxWidth: 420,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
              borderRadius: 28,
              padding: 36,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0, 165, 80, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 165, 80, 0.1) 0%, transparent 70%)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%)',
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #00A550 0%, #00C853 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 900,
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(0, 165, 80, 0.3)',
                    }}>F</div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>BANCO FALABELLA</div>
                      <div style={{ color: '#00A550', fontWeight: 700, fontSize: 14 }}>CMR</div>
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #FF6B35, #FF4500)',
                    padding: '4px 14px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'white',
                  }}>
                    PREMIUM
                  </div>
                </div>
                
                <div style={{
                  fontFamily: 'monospace',
                  letterSpacing: 3,
                  fontSize: 22,
                  color: 'white',
                  marginBottom: 28,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  **** **** **** 1234
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Línea de Crédito
                    </div>
                    <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: 20 }}>
                      S/ 2,000
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Válida hasta
                    </div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>12/28</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section style={{ padding: '80px 60px', maxWidth: 1400, margin: '0 auto', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(0, 165, 80, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
            color: '#00A550',
            padding: '4px 20px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 12,
          }}>
            💫 Beneficios exclusivos
          </span>
          <h2 style={{
            fontSize: 36,
            fontWeight: 800,
            color: '#0D1117',
            letterSpacing: '-1px',
          }}>
            Haz todo desde tu <span style={{ color: '#00A550' }}>App, Web o WhatsApp</span>
          </h2>
          <p style={{
            color: '#6B7280',
            fontSize: 16,
            maxWidth: 600,
            margin: '12px auto 0',
          }}>
            Gestiona tus finanzas de manera fácil, rápida y segura desde cualquier dispositivo.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}>
          {[
            { icon: '📱', title: 'Yapea y plinea gratis', desc: 'Transfiere a todos los bancos sin costo', color: '#00A550' },
            { icon: '🔐', title: 'Cambia tu Clave Internet', desc: 'Seguridad total para tus operaciones', color: '#FF6B35' },
            { icon: '💳', title: 'Pide tu CMR adicional', desc: '100% online, sin filas', color: '#3B82F6' },
            { icon: '📞', title: 'Contáctanos 24/7', desc: 'Estamos siempre para ayudarte', color: '#8B5CF6' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'white',
              borderRadius: 20,
              padding: 32,
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              transition: 'all 0.4s',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
            }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${f.color}15 0%, ${f.color}08 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                margin: '0 auto 16px',
                border: `2px solid ${f.color}20`,
              }}>
                {f.icon}
              </div>
              <h3 style={{ 
                fontWeight: 700, 
                fontSize: 17, 
                marginBottom: 8, 
                color: '#0D1117',
              }}>
                {f.title}
              </h3>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROMOCIONES */}
      <section style={{ padding: '80px 60px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 69, 0, 0.08) 100%)',
              color: '#FF6B35',
              padding: '4px 20px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              🔥 Ofertas imperdibles
            </span>
            <h2 style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#0D1117',
              letterSpacing: '-1px',
            }}>
              Promociones <span style={{ color: '#FF6B35' }}>exclusivas</span>
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: 16,
              maxWidth: 500,
              margin: '12px auto 0',
            }}>
              Disfruta de descuentos increíbles con tu tarjeta CMR
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {[
              { icon: '🍗', title: 'POLLO OYAS', desc: 'Pollo + papas + complemento', discount: '30% OFF', tag: '🔥 NUEVO', color: '#FF6B35' },
              { icon: '🚗', title: 'Uber', desc: 'Hasta 30% de dto. en Uber', discount: '30% OFF', tag: '⭐ EXCLUSIVO', color: '#00A550' },
              { icon: '🎬', title: 'CINEMARK', desc: 'Entradas 2D a S/10.90', discount: 'S/10.90', tag: '🎫 SUPERPROMO', color: '#3B82F6' },
            ].map(promo => (
              <div key={promo.title} style={{
                background: 'white',
                borderRadius: 20,
                padding: 28,
                border: '1px solid #F3F4F6',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                transition: 'all 0.4s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
              }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: `linear-gradient(135deg, ${promo.color} 0%, ${promo.color}dd 100%)`,
                  padding: '6px 18px',
                  borderRadius: '0 20px 0 20px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {promo.tag}
                </div>
                <div style={{ fontSize: 48, marginBottom: 12, marginTop: 8 }}>{promo.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, color: '#0D1117' }}>{promo.title}</h3>
                <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 14 }}>{promo.desc}</p>
                <div style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${promo.color}15 0%, ${promo.color}08 100%)`,
                  color: promo.color,
                  padding: '8px 20px',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 16,
                  border: `2px solid ${promo.color}20`,
                }}>
                  {promo.discount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDUCACIÓN FINANCIERA */}
      <section style={{ padding: '80px 60px', background: 'linear-gradient(135deg, #0D1117 0%, #003D1F 60%, #0D1117 100%)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(0, 165, 80, 0.15)',
                color: '#00A550',
                padding: '4px 18px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 16,
              }}>
                📚 Educación Financiera
              </span>
              <h2 style={{
                fontSize: 36,
                fontWeight: 800,
                color: 'white',
                marginBottom: 16,
                letterSpacing: '-1px',
              }}>
                Aprende a usar tus <br />
                <span style={{ color: '#00A550' }}>productos financieros</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
                Te enseñamos algunos tips para ahorrar más, prevenir fraudes y tomar mejores decisiones financieras.
              </p>
              <button style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
                color: 'white',
                padding: '14px 36px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 24px rgba(255, 107, 53, 0.3)',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.4)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 24px rgba(255, 107, 53, 0.3)';
              }}
              >
                📖 Conocer Más →
              </button>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}>
              {[
                { icon: '📚', label: 'Tips de ahorro', color: '#00A550' },
                { icon: '🛡️', label: 'Prevención fraudes', color: '#FF6B35' },
                { icon: '💰', label: 'Finanzas inteligentes', color: '#3B82F6' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  padding: '24px 28px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s',
                  minWidth: 120,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#0D1117',
        padding: '40px 60px',
        borderTop: '2px solid #00A550',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 24,
          }}>
            <Logo size="md" linkTo="/" variant="dark" />
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Viajes Falabella', 'Seguros Falabella', 'Sodimac', 'Tottus', 'Maestro', 'Ayuda y Contacto'].map(item => (
                <a key={item} href="#" style={{
                  color: '#6B7280',
                  fontSize: 13,
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontWeight: 500,
                }}
                onMouseEnter={e => {
                  e.target.style.color = '#00A550';
                }}
                onMouseLeave={e => {
                  e.target.style.color = '#6B7280';
                }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #1F2937',
            paddingTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <p style={{ color: '#374151', fontSize: 12 }}>
              © 2026 Banco Falabella · Supervisado por la SBS
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#" style={{ color: '#374151', fontSize: 12, textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#00A550'}
                onMouseLeave={e => e.target.style.color = '#374151'}
              >
                Términos y Condiciones
              </a>
              <a href="#" style={{ color: '#374151', fontSize: 12, textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#00A550'}
                onMouseLeave={e => e.target.style.color = '#374151'}
              >
                Política de Privacidad
              </a>
              <a href="#" style={{ color: '#374151', fontSize: 12, textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#00A550'}
                onMouseLeave={e => e.target.style.color = '#374151'}
              >
                Libro de Reclamaciones
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}