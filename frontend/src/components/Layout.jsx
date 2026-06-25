import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar />
      <main style={{
        marginLeft: 260,
        flex: 1,
        minHeight: '100vh',
        padding: '32px 40px',
        background: '#F9FAFB',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}