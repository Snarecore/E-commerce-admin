import { GetDataProps, PostDataProps, PatchDataProps, PutDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }
    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const response = await fetch(`${apiUrl}auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                const resData = await response.json();
                const newToken = resData?.accessToken || resData?.data?.accessToken;
                if (newToken) {
                    const rawUser = sessionStorage.getItem("user");
                    if (rawUser) {
                        const parsedUser = JSON.parse(rawUser);
                        parsedUser.token = newToken;
                        sessionStorage.setItem("user", JSON.stringify(parsedUser));
                    }
                    return newToken;
                }
            }
            sessionStorage.removeItem("user");
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
            return null;
        } catch {
            sessionStorage.removeItem("user");
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

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !url.includes("auth/refresh-token")) {
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
            return { error: true, message: errData?.message || `Failed: ${response.statusText}` };
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch error: ", error);
        return { error: true, message: "An error occurred while making the request." };
    }
}

export async function getData<T>({ url, token }: GetDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "GET", cache: "no-cache" });
}

export async function postData<T>({ url, token, body }: PostDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body: JSON.stringify(body) });
}

export async function patchData<T>({ url, token, body }: PatchDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body: JSON.stringify(body) });
}

export async function putData<T>({ url, token, body }: PutDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PUT", body: JSON.stringify(body) });
}

export async function deleteData<T>({ url, token }: DeleteDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "DELETE" });
}

export async function postFormData<T>({ url, token, body }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body });
}

export async function patchFormData<T>({ url, token, body }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body });
}
