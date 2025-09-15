import ClientsApiClient from "@/api/client/client.api";
import { Client, CreateClientDto } from "@/api/client/client.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClientStore {
  // State
  client: Client | null;
  clients: Client[]; // For admin/coach listing purposes
  isLoading: boolean;
  error: string | null;

  // CRUD Actions
  setClient: (client: Client | null) => void;
  setClients: (clients: Client[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async Actions
  fetchClient: (userId: string) => Promise<void>;
  fetchClientById: (clientId: string) => Promise<void>;
  fetchAllClients: () => Promise<void>;
  fetchClientsByCoach: (coachId: string) => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<Client>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;

  // Utility Actions
  clearClient: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      // Initial State
      client: null,
      clients: [],
      isLoading: false,
      error: null,

      // Sync Actions
      setClient: (client) => set({ client }),
      setClients: (clients) => set({ clients }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      clearClient: () => set({ client: null, error: null }),
      reset: () =>
        set({ client: null, clients: [], error: null, isLoading: false }),

      // Async Actions
      fetchClient: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const clientApi = ClientsApiClient.getInstance();
          const client = await clientApi.getByUserId(userId);
          set({ client, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch client";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchClientById: async (clientId: string) => {
        set({ isLoading: true, error: null });
        try {
          const clientApi = ClientsApiClient.getInstance();
          const client = await clientApi.getById(clientId);
          set({ client, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch client";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchAllClients: async () => {
        set({ isLoading: true, error: null });
        try {
          const clientApi = ClientsApiClient.getInstance();
          const clients = await clientApi.getAll();
          set({ clients, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch clients";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchClientsByCoach: async (coachId: string) => {
        set({ isLoading: true, error: null });
        try {
          const clientApi = ClientsApiClient.getInstance();
          const clients = await clientApi.getByCoachId(coachId);
          set({ clients, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch clients by coach";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      createClient: async (clientData: Partial<Client>) => {
        set({ isLoading: true, error: null });
        try {
          // Validate required fields
          if (!clientData.userId) {
            throw new Error("userId is required to create a client");
          }

          const clientApi = ClientsApiClient.getInstance();
          const newClient = await clientApi.create({
            ...clientData,
            userId: clientData.userId,
          } as CreateClientDto); // Use CreateClientDto type if available

          // Add to clients list and set as current client
          set((state) => ({
            client: newClient,
            clients: [...state.clients, newClient],
            isLoading: false,
          }));

          return newClient;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create client";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateClient: async (clientId: string, updates: Partial<Client>) => {
        set({ isLoading: true, error: null });

        // Optimistic update
        const { client, clients } = get();
        if (client?.id === clientId) {
          set({ client: { ...client, ...updates } });
        }
        set({
          clients: clients.map((c) =>
            c.id === clientId ? { ...c, ...updates } : c
          ),
        });

        try {
          const clientApi = ClientsApiClient.getInstance();
          const updatedClient = await clientApi.update(clientId, updates);

          set((state) => ({
            client:
              state.client?.id === clientId ? updatedClient : state.client,
            clients: state.clients.map((c) =>
              c.id === clientId ? updatedClient : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          // Revert optimistic update on error
          if (client?.id === clientId) {
            set({ client });
          }
          set({ clients });

          const errorMessage =
            error instanceof Error ? error.message : "Failed to update client";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteClient: async (clientId: string) => {
        set({ isLoading: true, error: null });
        try {
          const clientApi = ClientsApiClient.getInstance();
          await clientApi.delete(clientId);

          set((state) => ({
            client: state.client?.id === clientId ? null : state.client,
            clients: state.clients.filter((c) => c.id !== clientId),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete client";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "liftforge-client", // LocalStorage key
      // Only persist client data, not loading states
      partialize: (state) => ({
        client: state.client,
        clients: state.clients,
      }),
    }
  )
);
