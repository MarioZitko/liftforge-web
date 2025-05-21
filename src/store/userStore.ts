import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GetMeResponse } from "@/api/auth/auth.types";

interface UserStore {
	user: GetMeResponse | null;
	setUser: (user: GetMeResponse | null) => void;
	logout: () => void;
}

export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			user: null,
			setUser: (user) => set({ user }),
			logout: () => set({ user: null }),
		}),
		{
			name: "liftforge-user", // LocalStorage key
		}
	)
);
