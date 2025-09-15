import CoachesApiClient from "@/api/coach/coach.api";
import { Coach, CreateCoachDto } from "@/api/coach/coach.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CoachStore {
  // State
  coach: Coach | null;
  coaches: Coach[]; // For admin/listing purposes
  isLoading: boolean;
  error: string | null;

  // CRUD Actions
  setCoach: (coach: Coach | null) => void;
  setCoaches: (coaches: Coach[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async Actions
  fetchCoach: (userId: string) => Promise<void>;
  fetchCoachById: (coachId: string) => Promise<void>;
  fetchAllCoaches: () => Promise<void>;
  createCoach: (coachData: Partial<Coach>) => Promise<Coach>;
  updateCoach: (coachId: string, updates: Partial<Coach>) => Promise<void>;
  deleteCoach: (coachId: string) => Promise<void>;

  // Utility Actions
  clearCoach: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useCoachStore = create<CoachStore>()(
  persist(
    (set, get) => ({
      // Initial State
      coach: null,
      coaches: [],
      isLoading: false,
      error: null,

      // Sync Actions
      setCoach: (coach) => set({ coach }),
      setCoaches: (coaches) => set({ coaches }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearCoach: () => set({ coach: null, error: null }),
      reset: () =>
        set({ coach: null, coaches: [], error: null, isLoading: false }),

      // Async Actions
      fetchCoach: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const coachApi = CoachesApiClient.getInstance();
          const coach = await coachApi.getByUserId(userId);
          set({ coach, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch coach";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchCoachById: async (coachId: string) => {
        set({ isLoading: true, error: null });
        try {
          const coachApi = CoachesApiClient.getInstance();
          const coach = await coachApi.getById(coachId);
          set({ coach, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch coach";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchAllCoaches: async () => {
        set({ isLoading: true, error: null });
        try {
          const coachApi = CoachesApiClient.getInstance();
          const coaches = await coachApi.getAll();
          set({ coaches, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch coaches";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      createCoach: async (coachData: Partial<Coach>) => {
        set({ isLoading: true, error: null });
        try {
          const coachApi = CoachesApiClient.getInstance();
          const newCoach = await coachApi.create({
            ...coachData,
            userId: coachData.userId, // TypeScript now knows this is defined
          } as CreateCoachDto);
          // Add to coaches list and set as current coach
          set((state) => ({
            coach: newCoach,
            coaches: [...state.coaches, newCoach],
            isLoading: false,
          }));

          return newCoach;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create coach";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateCoach: async (coachId: string, updates: Partial<Coach>) => {
        set({ isLoading: true, error: null });

        // Optimistic update
        const { coach, coaches } = get();
        if (coach?.id === coachId) {
          set({ coach: { ...coach, ...updates } });
        }
        set({
          coaches: coaches.map((c) =>
            c.id === coachId ? { ...c, ...updates } : c
          ),
        });

        try {
          const coachApi = CoachesApiClient.getInstance();
          const updatedCoach = await coachApi.update(coachId, updates);

          set((state) => ({
            coach: state.coach?.id === coachId ? updatedCoach : state.coach,
            coaches: state.coaches.map((c) =>
              c.id === coachId ? updatedCoach : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          // Revert optimistic update on error
          if (coach?.id === coachId) {
            set({ coach });
          }
          set({ coaches });

          const errorMessage =
            error instanceof Error ? error.message : "Failed to update coach";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteCoach: async (coachId: string) => {
        set({ isLoading: true, error: null });
        try {
          const coachApi = CoachesApiClient.getInstance();
          await coachApi.delete(coachId);

          set((state) => ({
            coach: state.coach?.id === coachId ? null : state.coach,
            coaches: state.coaches.filter((c) => c.id !== coachId),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete coach";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "liftforge-coach", // LocalStorage key
      // Only persist coach data, not loading states
      partialize: (state) => ({
        coach: state.coach,
        coaches: state.coaches,
      }),
    }
  )
);
