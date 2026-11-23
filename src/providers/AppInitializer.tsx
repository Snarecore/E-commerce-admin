import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { userAtom, User, userLoadedAtom } from "../store/user-store";
import { refreshAccessToken } from "../services/api-service";
import {
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    recordUserActivity,
    subscribeAuthEvents
} from "../utils/auth-storage";
import { getApiBaseUrl } from "../config/env";
import { queryClient } from "../config/query-client";

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

                const apiUrl = getApiBaseUrl().replace(/\/+$/, "");

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
                        recordUserActivity();
                    } else {
                        setUser(storedUser);
                    }
                } else {
                    removeStoredUser();
                    try { queryClient.clear(); } catch {}
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
    }, [setUser, setUserLoaded]);

    // Multi-tab session synchronization (BroadcastChannel)
    useEffect(() => {
        return subscribeAuthEvents((event) => {
            if (event.type === "LOGOUT") {
                setUser(null);
                setUserLoaded(true);
                try {
                    queryClient.clear();
                } catch {}
                if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                    navigate("/login", { replace: true });
                }
            }
        });
    }, [setUser, setUserLoaded, navigate]);

    // Proactive background interval: runs every 30s
    // Silently refreshes access token cookie in the background before expiry
    useEffect(() => {
        let lastRefreshTime = Date.now();

        const intervalId = setInterval(async () => {
            const currentUser = getStoredUser();
            if (!currentUser) return;

            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshTime;

            // Silently refresh token every 10 minutes for active users
            if (timeSinceLastRefresh >= 600000) {
                lastRefreshTime = now;
                await refreshAccessToken();
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

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

