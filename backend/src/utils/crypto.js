const CryptoJS = require('crypto-js');

// Obtener clave de cifrado desde variables de entorno
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'banco_falabella_clave_32_caracteres';

/**
 * Cifrar un texto con AES
 * @param {string} texto - Texto a cifrar
 * @returns {string|null} - Texto cifrado o null
 */
function cifrar(texto) {
    if (!texto) return null;
    try {
        return CryptoJS.AES.encrypt(texto, ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('❌ Error al cifrar:', error.message);
        return null;
    }
}

/**
 * Descifrar un texto cifrado con AES
 * @param {string} textoCifrado - Texto cifrado
 * @returns {string|null} - Texto descifrado o null
 */
function descifrar(textoCifrado) {
    if (!textoCifrado) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(textoCifrado, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('❌ Error al descifrar:', error.message);
        return null;
    }
}

module.exports = { cifrar, descifrar };