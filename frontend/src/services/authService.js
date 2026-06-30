const API_URL = import.meta.env.VITE_API_URL || 'https://banco-falabella-backend-4309.onrender.com/api';

console.log('🔵 API_URL configurada:', API_URL);

const getToken = () => localStorage.getItem('bf_token');

const setToken = (token) => {
    if (token) {
        localStorage.setItem('bf_token', token);
        console.log('✅ Token guardado en localStorage');
    }
};

const setUsuario = (usuario) => {
    if (usuario) {
        localStorage.setItem('bf_usuario', JSON.stringify(usuario));
        console.log('✅ Usuario guardado en localStorage');
    }
};

const getUsuario = () => {
    const u = localStorage.getItem('bf_usuario');
    return u ? JSON.parse(u) : null;
};

const removeAuth = () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_usuario');
    console.log('🗑️ Sesión cerrada');
};

const isAuthenticated = () => {
    return !!getToken();
};

const headers = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export const authService = {
    async register(form) {
        try {
            console.log('📝 Registrando usuario...');
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
            console.log('✅ Usuario registrado exitosamente');
            return data;
        } catch (error) {
            console.error('❌ Error en register:', error);
            throw error;
        }
    },

    async login(email, contraseña) {
        try {
            console.log('🔑 Iniciando sesión...');
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
                console.log('✅ Login exitoso');
            }
            return data;
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    },

    // ✅ CORREGIDO: Solo limpia sesión, NO redirige
    logout() {
        removeAuth();
        console.log('✅ Sesión cerrada. Esperando redirección desde React Router.');
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

    // Funciones adicionales para perfil
    async actualizarPerfil(datos) {
        try {
            const res = await fetch(`${API_URL}/auth/perfil`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify(datos),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al actualizar perfil');
            }
            // Actualizar usuario en localStorage
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
                headers: headers(),
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
            console.log(`📡 ${method} ${url}`);
            
            const res = await fetch(url, options);
            
            if (res.status === 401) {
                console.warn('⚠️ Sesión expirada');
                removeAuth();
                // ✅ Usar replace para no guardar en historial
                window.location.replace('/login');
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