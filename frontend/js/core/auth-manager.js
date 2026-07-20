import {
    login,
    getCurrentUser
} from "../services/auth.service.js";

import {
    saveToken,
    saveTokenType,
    saveExpiresIn,
    saveUser
} from "./storage.js";

function decodeJwtPayload(token) {
    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const payload =
            parts[1];

        const decoded =
            atob(
                payload.replace(
                    /-/g,
                    "+"
                ).replace(
                    /_/g,
                    "/"
                )
            );

        return JSON.parse(
            decoded
        );
    } catch (error) {
        console.error(
            "Failed to decode JWT:",
            error
        );

        return null;
    }
}

function buildUserFromJwt(token) {
    const payload =
        decodeJwtPayload(token);

    if (!payload) return null;

    return {
        userId:
            payload.userId ||
            null,
        username:
            payload.sub ||
            null,
        fullName:
            payload.fullName ||
            null,
        roleCode:
            payload.role ||
            null,
        organizationId:
            payload.orgId ||
            null,
        organizationCode:
            payload.orgCode ||
            null,
        organizationName:
            payload.orgName ||
            null
    };
}

export async function authenticate(
    loginData
) {
    const response =
        await login(loginData);

    if (!response.success) {
        throw new Error(
            response.message ||
                "Đăng nhập thất bại."
        );
    }

    const token =
        response.data.accessToken;

    const tokenType =
        response.data.tokenType;

    const expiresIn =
        response.data.expiresIn;

    saveToken(token);

    saveTokenType(tokenType);

    saveExpiresIn(expiresIn);

    let user;

    try {
        const meResponse =
            await getCurrentUser();

        if (
            meResponse &&
            meResponse.success
        ) {
            user = meResponse.data;
        }
    } catch (error) {
        console.warn(
            "Could not fetch user profile, falling back to JWT data:",
            error
        );
    }

    if (!user) {
        user =
            buildUserFromJwt(
                token
            );

        console.log(
            "User data from JWT:",
            user
        );
    }

    if (user) {
        saveUser(user);
    }

    return user;
}
