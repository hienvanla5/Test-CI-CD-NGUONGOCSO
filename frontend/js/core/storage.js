const TOKEN_KEY = "accessToken";
const TOKEN_TYPE_KEY = "tokenType";
const EXPIRES_IN_KEY = "expiresIn";
const USER_KEY = "currentUser";

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function saveTokenType(tokenType) {
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
}

export function getTokenType() {
    return localStorage.getItem(TOKEN_TYPE_KEY);
}

export function removeTokenType() {
    localStorage.removeItem(TOKEN_TYPE_KEY);
}

export function saveExpiresIn(expiresIn) {
    localStorage.setItem(EXPIRES_IN_KEY, String(expiresIn));
}

export function getExpiresIn() {
    return localStorage.getItem(EXPIRES_IN_KEY);
}

export function removeExpiresIn() {
    localStorage.removeItem(EXPIRES_IN_KEY);
}

export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
}

export function clearAuth() {
    removeToken();
    removeTokenType();
    removeExpiresIn();
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    return true;
}