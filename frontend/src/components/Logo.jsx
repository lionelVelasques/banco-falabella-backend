import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Logo({ size = 'md', linkTo = '/', variant = 'light' }) {
  const sizes = {
    sm: { height: 45, fontSize: 10 },
    md: { height: 60, fontSize: 14 },
    lg: { height: 80, fontSize: 18 },
    xl: { height: 100, fontSize: 22 },
  };

  const s = sizes[size] || sizes.md;
  const textColor = variant === 'dark' ? 'white' : '#0D1117';

  return (
    <Link to={linkTo} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <img 
        src={logo} 
        alt="Banco Falabella" 
        style={{
          height: s.height,
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </Link>
  );
}