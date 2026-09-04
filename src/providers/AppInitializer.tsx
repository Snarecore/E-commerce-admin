import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom } from "../store/user-store";
import { refreshAccessToken } from "../services/api-service";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const fetchSession = async () => {
            try {
                const storedUserStr = sessionStorage.getItem("user");
                const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
                let token = storedUser?.token || "";

                if (!storedUser || (!token && !storedUser?.id && !storedUser?._id && !storedUser?.email)) {
                    setUser(null);
                    setUserLoaded(true);
                    return;
                }

                const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1/";
                const apiUrl = rawApiUrl.replace(/\/$/, "");
                const headers: Record<string, string> = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                let res = await fetch(`${apiUrl}/auth/admin/me`, {
                    method: "GET",
                    headers,
                    credentials: "include"
                });

                if (res.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        token = newToken;
                        const retryHeaders: Record<string, string> = { Authorization: `Bearer ${newToken}` };
                        res = await fetch(`${apiUrl}/auth/admin/me`, {
                            method: "GET",
                            headers: retryHeaders,
                            credentials: "include"
                        });
                    }
                }

                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        const mergedUser: User = {
                            ...(storedUser || {}),
                            ...(userData as User),
                            id: userData.id || userData._id || storedUser?.id || storedUser?._id || "",
                            token: token || (userData as any)?.token || (userData as any)?.accessToken || storedUser?.token
                        };
                        setUser(mergedUser);
                        sessionStorage.setItem("user", JSON.stringify(mergedUser));
                    } else {
                        setUser(storedUser as User);
                    }
                } else {
                    if (storedUser && (storedUser.token || storedUser.id || storedUser._id || storedUser.email)) {
                        setUser(storedUser as User);
                    } else {
                        setUser(null);
                    }
                }
            } catch {
                const storedUserStr = sessionStorage.getItem("user");
                const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
                if (storedUser && (storedUser.token || storedUser.id || storedUser._id || storedUser.email)) {
                    setUser(storedUser as User);
                } else {
                    setUser(null);
                }
            } finally {
                setUserLoaded(true);
            }
        };

        fetchSession();
    }, [setUser, setUserLoaded]);

    return null;
};

export default AppInitializer;
