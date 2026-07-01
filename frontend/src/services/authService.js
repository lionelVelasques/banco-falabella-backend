const API_URL = 'https://banco-falabella-backend-4309.onrender.com/api';

console.log('🔵 API_URL configurada:', API_URL);

const getToken = () => localStorage.getItem('bf_token');

const setToken = (token) => {
    if (token) {
        localStorage.setItem('bf_token', token);
    }
};

const setUsuario = (usuario) => {
    if (usuario) {
        localStorage.setItem('bf_usuario', JSON.stringify(usuario));
    }
};

const getUsuario = () => {
    const u = localStorage.getItem('bf_usuario');
    return u ? JSON.parse(u) : null;
};

const removeAuth = () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_usuario');
};

const isAuthenticated = () => {
    return !!getToken();
};

export const authService = {
    async register(form) {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error || 'Error en registro');
            }
            if (data.token) {
                setToken(data.token);
                setUsuario(data.usuario);
            }
            return data;
        } catch (error) {
            console.error('❌ Error en register:', error);
            throw error;
        }
    },

    async login(email, contraseña) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contraseña }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error || 'Error en login');
            }
            if (data.token) {
                setToken(data.token);
                setUsuario(data.usuario);
            }
            return data;
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    },

    logout() {
        removeAuth();
        window.location.replace('/login');
    },

    getUsuario() {
        return getUsuario();
    },

    isAuthenticated() {
        return isAuthenticated();
    },

    getToken() {
        return getToken();
    },

    async actualizarPerfil(datos) {
        try {
            const res = await fetch(`${API_URL}/auth/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(datos),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al actualizar perfil');
            }
            if (data.usuario) {
                setUsuario(data.usuario);
            }
            return data;
        } catch (error) {
            console.error('❌ Error en actualizarPerfil:', error);
            throw error;
        }
    },

    async cambiarPassword(passwordActual, nuevaPassword) {
        try {
            const res = await fetch(`${API_URL}/auth/cambiar-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ passwordActual, nuevaPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al cambiar contraseña');
            }
            return data;
        } catch (error) {
            console.error('❌ Error en cambiarPassword:', error);
            throw error;
        }
    },

    async solicitarRecuperacion(email) {
        try {
            const res = await fetch(`${API_URL}/auth/recuperar-solicitar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al solicitar recuperación');
            }
            return data;
        } catch (error) {
            console.error('❌ Error en solicitarRecuperacion:', error);
            throw error;
        }
    },
};

export const api = {
    async request(method, path, body = null) {
        const token = getToken();
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const url = `${API_URL}${path}`;
            const res = await fetch(url, options);
            
            if (res.status === 401) {
                removeAuth();
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || data.error || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            console.error(`❌ Error en ${method} ${path}:`, error);
            throw error;
        }
    },

    async get(path) {
        return this.request('GET', path);
    },

    async post(path, body) {
        return this.request('POST', path, body);
    },

    async put(path, body) {
        return this.request('PUT', path, body);
    },

    async delete(path) {
        return this.request('DELETE', path);
    },
};