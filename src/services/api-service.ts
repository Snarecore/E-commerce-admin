import { GetDataProps, PostDataProps, PatchDataProps, PutDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";
import { getStoredUser, setStoredUser, removeStoredUser, getStoredToken, getStoredRefreshToken, isSessionExpired } from "../utils/auth-storage";

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1/";
const apiUrl = rawApiUrl.endsWith("/") ? rawApiUrl : `${rawApiUrl}/`;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const REFRESH_ENDPOINTS = [
    "auth/refresh-token",
    "auth/refresh",
    "auth/admin/refresh-token",
    "auth/admin/refresh",
    "auth/refreshToken"
];

export async function refreshAccessToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    if (isSessionExpired()) {
        removeStoredUser();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
        }
        return null;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const storedUser = getStoredUser();
            const storedToken = getStoredToken();
            const storedRefreshToken = getStoredRefreshToken();

            if (!storedUser && !storedToken && !storedRefreshToken) {
                return null;
            }

            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (storedToken) {
                headers["Authorization"] = `Bearer ${storedToken}`;
            }
            if (storedRefreshToken) {
                headers["x-refresh-token"] = storedRefreshToken;
            }

            const payloadBody = JSON.stringify({
                refreshToken: storedRefreshToken || storedToken,
                refresh_token: storedRefreshToken || storedToken,
                token: storedToken
            });

            for (const endpoint of REFRESH_ENDPOINTS) {
                try {
                    const response = await fetch(`${apiUrl}${endpoint}`, {
                        method: "POST",
                        credentials: "include",
                        headers,
                        body: payloadBody
                    });

                    if (response.ok) {
                        const resData = await response.json();
                        const newToken =
                            resData?.accessToken ||
                            resData?.data?.accessToken ||
                            resData?.token ||
                            resData?.data?.token ||
                            resData?.access_token ||
                            resData?.data?.access_token ||
                            (typeof resData?.data === "string" ? resData.data : null);

                        const newRefreshToken =
                            resData?.refreshToken ||
                            resData?.data?.refreshToken ||
                            resData?.refresh_token ||
                            resData?.data?.refresh_token ||
                            storedRefreshToken;

                        if (newToken && typeof newToken === "string" && newToken.trim().length > 10) {
                            if (storedUser) {
                                const updatedUser = {
                                    ...storedUser,
                                    token: newToken,
                                    refreshToken: newRefreshToken || storedUser.refreshToken
                                };
                                setStoredUser(updatedUser);
                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(new CustomEvent("auth-token-refreshed", { detail: updatedUser }));
                                }
                            }
                            return newToken;
                        }
                    } else if (response.status === 404) {
                        // Endpoint doesn't exist on server, try next endpoint candidate
                        continue;
                    } else if (response.status === 401 || response.status === 403) {
                        // Refresh token was explicitly rejected
                        break;
                    }
                } catch {
                    // Try next candidate endpoint
                    continue;
                }
            }

            return null;
        } catch {
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

async function apiRequest<T>(url: string, options: RequestInit, isRetry = false): Promise<T | { error: boolean; message: string }> {
    try {
        const fetchOptions: RequestInit = {
            ...options,
            credentials: "include"
        };

        const response = await fetch(`${apiUrl}${url}`, fetchOptions);

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !REFRESH_ENDPOINTS.some(ep => url.includes(ep))) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                const newHeaders = new Headers(options.headers || {});
                newHeaders.set("Authorization", `Bearer ${newToken}`);
                return apiRequest<T>(url, { ...options, headers: newHeaders }, true);
            }
        }

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            const errData = await response.json().catch(() => null);
            if (response.status === 429) {
                return {
                    error: true,
                    message: errData?.message || "Too many requests. Please wait a minute before trying again."
                };
            }
            return { error: true, message: errData?.message || `Failed: ${response.statusText}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch error: ", error);
        return { error: true, message: "An error occurred while making the request." };
    }
}

export async function getData<T>({ url, token }: GetDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "GET", cache: "no-cache" });
}

export async function postData<T>({ url, token, body }: PostDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "POST", body: JSON.stringify(body) });
}

export async function patchData<T>({ url, token, body }: PatchDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body: JSON.stringify(body) });
}

export async function putData<T>({ url, token, body }: PutDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "PUT", body: JSON.stringify(body) });
}

export async function deleteData<T>({ url, token }: DeleteDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "DELETE" });
}

export async function postFormData<T>({ url, token, body }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = {};
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "POST", body });
}

export async function patchFormData<T>({ url, token, body }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const activeToken = token || getStoredToken();
    const headers: HeadersInit = {};
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body });
}

