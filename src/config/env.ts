/**
 * Authoritative Environment & API URL Configuration for Cloth-admin
 * Single Source of Truth for Base API URLs, Origins, and Socket URLs.
 */

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

export const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === "string" && envUrl.trim() && envUrl !== "undefined") {
        return stripTrailingSlash(envUrl.trim());
    }

    if (import.meta.env.PROD) {
        if (typeof window !== "undefined") {
            console.warn("[Env Warning] VITE_API_BASE_URL missing in production. Falling back to origin API.");
            return `${stripTrailingSlash(window.location.origin)}/api/v1`;
        }
    }

    return "http://localhost:5000/api/v1";
};

export const getApiBaseUrlWithTrailingSlash = (): string => {
    return `${getApiBaseUrl()}/`;
};

export const getSocketUrl = (): string => {
    const socketEnv = import.meta.env.VITE_SOCKET_URL;
    if (socketEnv && typeof socketEnv === "string" && socketEnv.trim() && socketEnv !== "undefined") {
        return stripTrailingSlash(socketEnv.trim());
    }

    try {
        const parsed = new URL(getApiBaseUrl());
        return parsed.origin;
    } catch {
        return typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
    }
};
