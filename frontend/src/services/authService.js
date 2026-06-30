// ============================================================
// AUTH SERVICE - BANCO FALABELLA
// ============================================================

// ✅ URL CORREGIDA - Hardcodeada para producción
const API_URL = 'https://banco-falabella-backend-4309.onrender.com/api';

console.log('🔵 API_URL configurada:', API_URL);

// ============================================================
// UTILIDADES DE ALMACENAMIENTO
// ============================================================

const getToken = () => localStorage.getItem('bf_token');

const setToken = (token) => {
    if (token) {
        localStorage.setItem('bf_token', token);
        console.log('✅ Token guardado');
    }
};

const setUsuario = (usuario) => {
    if (usuario) {
        localStorage.setItem('bf_usuario', JSON.stringify(usuario));
        console.log('✅ Usuario guardado');
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

// ============================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================

export const authService = {
    // ----- REGISTRO -----
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
            console.log('✅ Usuario registrado');
            return data;
        } catch (error) {
            console.error('❌ Error en register:', error);
            throw error;
        }
    },

    // ----- LOGIN -----
    async login(email, contraseña) {
        try {
            console.log('🔑 Iniciando sesión...');
            console.log('📡 Enviando a:', `${API_URL}/auth/login`);
            
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contraseña }),
            });
            
            console.log('📡 Respuesta recibida, status:', res.status);
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

    // ----- LOGOUT (CORREGIDO) -----
    logout() {
        removeAuth();
        // ✅ Usar replace para que no se guarde en el historial
        window.location.replace('/login');
    },

    // ----- OBTENER USUARIO -----
    getUsuario() {
        return getUsuario();
    },

    // ----- VERIFICAR AUTENTICACIÓN -----
    isAuthenticated() {
        return isAuthenticated();
    },

    // ----- OBTENER TOKEN -----
    getToken() {
        return getToken();
    },

    // ----- ACTUALIZAR PERFIL -----
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
            if (data.usuario) {
                setUsuario(data.usuario);
            }
            return data;
        } catch (error) {
            console.error('❌ Error en actualizarPerfil:', error);
            throw error;
        }
    },

    // ----- CAMBIAR CONTRASEÑA -----
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

    // ----- RECUPERAR CONTRASEÑA -----
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

// ============================================================
// CLIENTE API
// ============================================================

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
            
            // ✅ Manejo de 401 sin redirección manual
            if (res.status === 401) {
                console.warn('⚠️ Sesión expirada');
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