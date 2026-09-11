import { User } from "../store/user-store";

// 2 Hours session duration in milliseconds (2 * 60 * 60 * 1000)
export const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
export const STORAGE_KEY_USER = "user";
export const STORAGE_KEY_SESSION_EXPIRES_AT = "session_expires_at";
export const STORAGE_KEY_LAST_ACTIVITY = "session_last_activity";

/**
 * Parses JWT token and checks if it's expired or nearing expiration.
 * @param token - JWT access token string
 * @param offsetSeconds - Margin of safety in seconds (default 60s)
 */
export function isTokenExpired(token?: string | null, offsetSeconds = 60): boolean {
    if (!token) return true;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        if (typeof payload.exp !== "number") return false;
        const expiryMs = payload.exp * 1000;
        return Date.now() >= (expiryMs - offsetSeconds * 1000);
    } catch {
        return false;
    }
}

/**
 * Reads the stored user from sessionStorage or localStorage (safe profile only, no raw tokens).
 */
export function getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_USER);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return {
            id: parsed.id || parsed._id || "",
            name: parsed.name || "",
            email: parsed.email || "",
            role: parsed.role || "admin"
        } as User;
    } catch {
        return null;
    }
}

/**
 * Returns the current stored access token (optional, deprecated in favor of HttpOnly cookies).
 */
export function getStoredToken(): string {
    return "";
}

/**
 * Returns the stored refresh token (deprecated in favor of HttpOnly cookies).
 */
export function getStoredRefreshToken(): string {
    return "";
}

/**
 * Saves or updates safe non-sensitive user profile data.
 */
export function setStoredUser(user: User, customExpiryMs?: number): void {
    if (typeof window === "undefined") return;
    try {
        const safeUser = {
            id: user.id || (user as any)._id || "",
            name: user.name || "",
            email: user.email || "",
            role: user.role || "admin"
        };
        const userStr = JSON.stringify(safeUser);
        sessionStorage.setItem(STORAGE_KEY_USER, userStr);
        localStorage.setItem(STORAGE_KEY_USER, userStr);

        const currentExpiry = getSessionExpiryTime();
        const expiryTime = customExpiryMs || currentExpiry || (Date.now() + SESSION_DURATION_MS);
        
        sessionStorage.setItem(STORAGE_KEY_SESSION_EXPIRES_AT, String(expiryTime));
        localStorage.setItem(STORAGE_KEY_SESSION_EXPIRES_AT, String(expiryTime));

        recordUserActivity();
    } catch (e) {
        console.error("Failed to save user session:", e);
    }
}

/**
 * Clears user session and storage data.
 */
export function removeStoredUser(): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.removeItem(STORAGE_KEY_USER);
        sessionStorage.removeItem(STORAGE_KEY_SESSION_EXPIRES_AT);
        sessionStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);

        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_SESSION_EXPIRES_AT);
        localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
    } catch (e) {
        console.error("Failed to clear user session:", e);
    }
}

/**
 * Gets the timestamp when the 2-hour session will expire.
 */
export function getSessionExpiryTime(): number | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY_SESSION_EXPIRES_AT) || localStorage.getItem(STORAGE_KEY_SESSION_EXPIRES_AT);
        if (!raw) return null;
        const num = Number(raw);
        return isNaN(num) ? null : num;
    } catch {
        return null;
    }
}

/**
 * Records user interaction timestamp.
 */
let lastActivityRecorded = 0;
export function recordUserActivity(): void {
    if (typeof window === "undefined") return;
    const now = Date.now();
    // Throttle writes to once every 10 seconds
    if (now - lastActivityRecorded < 10000) return;
    lastActivityRecorded = now;

    try {
        sessionStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, String(now));
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, String(now));

        // Slide session expiration forward on active user interaction (2 hours from now)
        const newExpiry = now + SESSION_DURATION_MS;
        sessionStorage.setItem(STORAGE_KEY_SESSION_EXPIRES_AT, String(newExpiry));
        localStorage.setItem(STORAGE_KEY_SESSION_EXPIRES_AT, String(newExpiry));
    } catch {}
}

/**
 * Checks if the user's 2-hour session is valid.
 */
export function isSessionValid(): boolean {
    const user = getStoredUser();
    if (!user) return false;

    const expiry = getSessionExpiryTime();
    if (!expiry) return true; // Default to valid if no timestamp set yet

    return Date.now() < expiry;
}

/**
 * Checks if the 2-hour session has expired.
 */
export function isSessionExpired(): boolean {
    const user = getStoredUser();
    if (!user) return false;

    const expiry = getSessionExpiryTime();
    if (!expiry) return false;

    return Date.now() >= expiry;
}
