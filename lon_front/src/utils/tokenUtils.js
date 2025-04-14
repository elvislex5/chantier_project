export function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erreur de décodage du token:', error);
        return null;
    }
}

export function getTokenExpirationTime(token) {
    const decoded = decodeToken(token);
    return decoded ? decoded.exp * 1000 : null; // Convertir en millisecondes
}

export function isTokenExpired(token) {
    const expirationTime = getTokenExpirationTime(token);
    return expirationTime ? Date.now() >= expirationTime : true;
} 