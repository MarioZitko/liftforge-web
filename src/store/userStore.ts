import { create } from "zustand";
import { User } from "@/api/users/users.types";

interface UserStore {
	user: User | null;
	setUser: (user: User | null) => void;
	logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	logout: () => set({ user: null }),
}));
