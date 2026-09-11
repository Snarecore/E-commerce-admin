import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { userAtom, User, userLoadedAtom } from "../store/user-store";
import { refreshAccessToken } from "../services/api-service";
import {
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    isSessionExpired,
    recordUserActivity
} from "../utils/auth-storage";
import { showErrorToast } from "../utils/toast-utils";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);
    const navigate = useNavigate();
    const initializedRef = useRef(false);

    // Initial session load & validation
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initSession = async () => {
            try {
                const storedUser = getStoredUser();

                if (!storedUser || (!storedUser.id && !storedUser.email)) {
                    setUser(null);
                    setUserLoaded(true);
                    return;
                }

                // Check 2-hour session expiry
                if (isSessionExpired()) {
                    removeStoredUser();
                    setUser(null);
                    setUserLoaded(true);
                    showErrorToast("Session expired after 2 hours. Please log in again.");
                    navigate("/login", { replace: true });
                    return;
                }

                const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1/";
                const apiUrl = rawApiUrl.replace(/\/$/, "");

                let res = await fetch(`${apiUrl}/auth/admin/me`, {
                    method: "GET",
                    credentials: "include"
                });

                if (res.status === 401) {
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        res = await fetch(`${apiUrl}/auth/admin/me`, {
                            method: "GET",
                            credentials: "include"
                        });
                    }
                }

                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        const mergedUser: User = {
                            id: userData.id || userData._id || storedUser?.id || "",
                            name: userData.name || storedUser?.name || "Admin",
                            email: userData.email || storedUser?.email || "",
                            role: userData.role || storedUser?.role || "admin"
                        };
                        setUser(mergedUser);
                        setStoredUser(mergedUser);
                    } else {
                        setUser(storedUser);
                    }
                } else {
                    removeStoredUser();
                    setUser(null);
                }
            } catch {
                const storedUser = getStoredUser();
                if (storedUser && (storedUser.id || storedUser.email)) {
                    setUser(storedUser);
                } else {
                    setUser(null);
                }
            } finally {
                setUserLoaded(true);
            }
        };

        initSession();
    }, [setUser, setUserLoaded, navigate]);

    // Proactive background interval: runs every 30s
    // 1. Checks 2-hour session expiry
    // 2. Silently refreshes access token cookie in the background
    useEffect(() => {
        let lastRefreshTime = Date.now();

        const intervalId = setInterval(async () => {
            const currentUser = getStoredUser();
            if (!currentUser) return;

            // Check if 2-hour session expired
            if (isSessionExpired()) {
                removeStoredUser();
                setUser(null);
                showErrorToast("Your 2-hour session has ended. Please log in again.");
                navigate("/login", { replace: true });
                return;
            }

            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTime;

            // Refresh cookie every 10 minutes
            if (timeSinceLastRefresh >= 600000) {
                lastRefreshTime = now;
                await refreshAccessToken();
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, [setUser, navigate]);

    // User activity tracking: tracks clicks, keystrokes, mouse moves
    useEffect(() => {
        const handleActivity = () => {
            recordUserActivity();
        };

        window.addEventListener("mousedown", handleActivity, { passive: true });
        window.addEventListener("keydown", handleActivity, { passive: true });
        window.addEventListener("scroll", handleActivity, { passive: true });
        window.addEventListener("touchstart", handleActivity, { passive: true });

        return () => {
            window.removeEventListener("mousedown", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("scroll", handleActivity);
            window.removeEventListener("touchstart", handleActivity);
        };
    }, []);

    // Listen to cross-tab storage changes and custom refresh events
    useEffect(() => {
        const handleTokenRefreshed = (e: CustomEvent<User>) => {
            if (e.detail) {
                setUser(e.detail);
            }
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "user") {
                if (!e.newValue) {
                    setUser(null);
                } else {
                    try {
                        const parsed = JSON.parse(e.newValue);
                        setUser(parsed);
                    } catch {}
                }
            }
        };

        window.addEventListener("auth-token-refreshed" as any, handleTokenRefreshed);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("auth-token-refreshed" as any, handleTokenRefreshed);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [setUser]);

    return null;
};

export default AppInitializer;

