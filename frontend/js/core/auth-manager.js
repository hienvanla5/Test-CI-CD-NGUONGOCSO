import {
    login
} from "../services/auth.service.js";

import {
    saveToken,
    saveUser
} from "./storage.js";

export async function authenticate(
    loginData
) {
    const response =
        await login(loginData);

    const token =
        response.data.accessToken;

    const user =
        response.data.user;

    saveToken(token);

    saveUser(user);

    return user;
}