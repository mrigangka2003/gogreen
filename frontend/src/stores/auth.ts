import { create } from "zustand";

export type User = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "org" | "emp" | "super-admin";
};

type AuthState = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));
