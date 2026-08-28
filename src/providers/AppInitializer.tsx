import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom } from "../store/user-store";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1/";
                const res = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/admin/me`, {
                    method: "GET",
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        setUser(userData as User);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setUserLoaded(true);
            }
        };

        fetchSession();
    }, [setUser, setUserLoaded]);

    return null;
};

export default AppInitializer;
