const STORAGE_KEYS = Object.freeze({
    ACCESS_TOKEN: "accessToken",
    TOKEN_TYPE: "tokenType",
    EXPIRES_IN: "expiresIn",
    CURRENT_USER: "currentUser"
});

/* ========================================
   ACCESS TOKEN
======================================== */

export function saveToken(token) {
    if (!token) {
        removeToken();
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.ACCESS_TOKEN,
        String(token)
    );
}

export function getToken() {
    return localStorage.getItem(
        STORAGE_KEYS.ACCESS_TOKEN
    );
}

export function removeToken() {
    localStorage.removeItem(
        STORAGE_KEYS.ACCESS_TOKEN
    );
}

/* ========================================
   TOKEN TYPE
======================================== */

export function saveTokenType(tokenType) {
    if (!tokenType) {
        removeTokenType();
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.TOKEN_TYPE,
        String(tokenType)
    );
}

export function getTokenType() {
    return localStorage.getItem(
        STORAGE_KEYS.TOKEN_TYPE
    );
}

export function removeTokenType() {
    localStorage.removeItem(
        STORAGE_KEYS.TOKEN_TYPE
    );
}

/* ========================================
   TOKEN EXPIRATION
======================================== */

export function saveExpiresIn(expiresIn) {
    if (
        expiresIn === null ||
        expiresIn === undefined ||
        expiresIn === ""
    ) {
        removeExpiresIn();
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.EXPIRES_IN,
        String(expiresIn)
    );
}

export function getExpiresIn() {
    return localStorage.getItem(
        STORAGE_KEYS.EXPIRES_IN
    );
}

export function removeExpiresIn() {
    localStorage.removeItem(
        STORAGE_KEYS.EXPIRES_IN
    );
}

/* ========================================
   CURRENT USER
======================================== */

export function saveUser(user) {
    if (!user) {
        removeUser();
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user)
    );
}

export function getUser() {
    const storedUser =
        localStorage.getItem(
            STORAGE_KEYS.CURRENT_USER
        );

    if (!storedUser) {
        return null;
    }

    try {
        let parsedUser =
            JSON.parse(storedUser);

        /*
         * Hỗ trợ dữ liệu cũ từng bị
         * JSON.stringify hai lần.
         */
        if (typeof parsedUser === "string") {
            parsedUser =
                JSON.parse(parsedUser);
        }

        if (
            !parsedUser ||
            typeof parsedUser !== "object"
        ) {
            return null;
        }

        return parsedUser;
    } catch (error) {
        console.error(
            "[Storage] Không thể đọc currentUser:",
            error
        );

        removeUser();

        return null;
    }
}

export function removeUser() {
    localStorage.removeItem(
        STORAGE_KEYS.CURRENT_USER
    );
}

/* ========================================
   AUTHENTICATION
======================================== */

export function clearAuth() {
    removeToken();
    removeTokenType();
    removeExpiresIn();
    removeUser();
}

export function isAuthenticated() {
    return Boolean(getToken());
}