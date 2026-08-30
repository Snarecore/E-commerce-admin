import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom } from "../store/user-store";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
                const token = storedUser?.token || "";

                if (!token) {
                    setUser(null);
                    setUserLoaded(true);
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1/";
                const headers: Record<string, string> = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const res = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/admin/me`, {
                    method: "GET",
                    headers,
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        setUser({ ...(userData as User), token: token || (userData as any)?.token });
                    } else if (storedUser?.id) {
                        setUser(storedUser as User);
                    } else {
                        setUser(null);
                    }
                } else if (storedUser?.id && storedUser?.token) {
                    setUser(storedUser as User);
                } else {
                    setUser(null);
                }
            } catch {
                const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
                if (storedUser?.id) {
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
