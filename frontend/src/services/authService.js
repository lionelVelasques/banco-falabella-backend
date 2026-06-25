const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('bf_token');
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const authService = {
  async login(email, contraseña) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error en login');
    localStorage.setItem('bf_token', data.token);
    localStorage.setItem('bf_usuario', JSON.stringify(data.usuario));
    return data;
  },

  async register(form) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error en registro');
    localStorage.setItem('bf_token', data.token);
    localStorage.setItem('bf_usuario', JSON.stringify(data.usuario));
    return data;
  },

  logout() {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_usuario');
  },

  getUsuario() {
    const u = localStorage.getItem('bf_usuario');
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: () => !!getToken(),

  async cambiarPassword(passwordActual, nuevaPassword) {
    const res = await fetch(`${API_URL}/auth/cambiar-password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ passwordActual, nuevaPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error);
    return data;
  },

  async solicitarRecuperacion(email) {
    const res = await fetch(`${API_URL}/auth/recuperar-solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error);
    return data;
  },

  async recuperarPassword(token, nuevaPassword) {
    const res = await fetch(`${API_URL}/auth/recuperar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nuevaPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error);
    return data;
  },

  async actualizarPerfil(datos) {
    const res = await fetch(`${API_URL}/auth/perfil`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(datos),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error);
    localStorage.setItem('bf_usuario', JSON.stringify(data.usuario));
    return data;
  },
};

export const api = {
  async get(path) {
    const res = await fetch(`${API_URL}${path}`, { headers: headers() });
    if (res.status === 401) {
      authService.logout();
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error en la petición');
    return data;
  },

  async post(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      authService.logout();
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error en la petición');
    return data;
  },

  async put(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      authService.logout();
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error en la petición');
    return data;
  },

  async delete(path) {
    const res = await fetch(`${API_URL}${path}`, { 
      method: 'DELETE',
      headers: headers(),
    });
    if (res.status === 401) {
      authService.logout();
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error en la petición');
    return data;
  },
};