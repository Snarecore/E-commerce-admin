import { GetDataProps, PostDataProps, PatchDataProps, PutDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";
import { removeStoredUser, getStoredToken, recordUserActivity, broadcastAuthEvent } from "../utils/auth-storage";
import { getApiBaseUrlWithTrailingSlash } from "../config/env";

const getApiUrl = () => getApiBaseUrlWithTrailingSlash();

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const currentApiUrl = getApiUrl();
            const response = await fetch(`${currentApiUrl}auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const resData = await response.json().catch(() => null);
                const newToken = resData?.accessToken || resData?.data?.accessToken || "refreshed";
                recordUserActivity();
                broadcastAuthEvent({ type: "REFRESH_SUCCESS" });
                return newToken;
            }

            // Only definitive 401 means the refresh token is truly expired or revoked on the server
            if (response.status === 401) {
                removeStoredUser();
                if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            }

            return null;
        } catch (err) {
            // Network failure or timeout must NOT clear user authentication
            console.warn("[Auth Warning] Network error during silent token refresh:", err);
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

        const currentApiUrl = getApiUrl();
        const response = await fetch(`${currentApiUrl}${url}`, fetchOptions);

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !url.includes("auth/refresh")) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                const updatedOptions: RequestInit = { ...options };
                if (newToken !== "refreshed") {
                    const headers = new Headers(updatedOptions.headers || {});
                    headers.set("Authorization", `Bearer ${newToken}`);
                    updatedOptions.headers = headers;
                }
                return apiRequest<T>(url, updatedOptions, true);
            }
        }

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            const errData = await response.json().catch(() => null);
            if (response.status === 413) {
                return {
                    error: true,
                    message: "Selected image(s) or payload size is too large (exceeds limit). Please upload smaller image files."
                };
            }
            if (response.status === 429) {
                return {
                    error: true,
                    message: errData?.message || "Too many requests. Please wait a minute before trying again."
                };
            }
            const rawMsg = errData?.message || errData?.data?.message || `Failed (${response.status}): ${response.statusText}`;
            const formattedMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : String(rawMsg);
            return { error: true, message: formattedMsg };
        }

        return await response.json();
    } catch (error: any) {
        console.error("Fetch error: ", error);
        return { error: true, message: error?.message || "An error occurred while making the request." };
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

