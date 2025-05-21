import { create } from "zustand";
import { GetMeResponse } from "@/api/auth/auth.types";

interface UserStore {
	user: GetMeResponse | null; // ✅ not `User`
	setUser: (user: GetMeResponse | null) => void;
	logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	logout: () => set({ user: null }),
}));
