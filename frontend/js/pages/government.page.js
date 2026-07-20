import {
    requireAuth,
    setupLogout
} from "../core/auth-guard.js";

requireAuth();
setupLogout();