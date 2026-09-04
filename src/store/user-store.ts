import { atom } from "jotai";
import { removeStoredUser } from "../utils/auth-storage";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    token?: string;
    refreshToken?: string;
}

export const userAtom = atom<User | null>(null);
export const userLoadedAtom = atom(false);

//@ts-ignore
export const logoutUserAtom = atom(null, (get :any, set: any, navigate?: () => void) => {
    removeStoredUser();
    set(userAtom, null);
    set(userLoadedAtom, true);
    if (typeof navigate === "function") {
        navigate();
    }
});

