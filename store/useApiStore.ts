import { create } from "zustand";
import { Endpoint } from "@/lib/db/schema/schema";
import { apiClient } from "@/lib/api";


interface ApiStoreState {
  endpoints: Endpoint[];
  isLoading: boolean;
  error: string | null;
  fetchEndpoints: () => Promise<void>;
  addEndpoint: (endpoint: Omit<Endpoint, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateEndpoint: (id: string, updates: Partial<Endpoint>) => Promise<void>;
  deleteEndpoint: (id: string) => Promise<void>;
}

export const useApiStore = create<ApiStoreState>((set) => ({
  endpoints: [],
  isLoading: false,
  error: null,

  fetchEndpoints: async () => {
    set({ isLoading: true, error: null });
    try {
      // Axios natively passes session cookie blocks automatically down to server layers
      const response = await apiClient.get<Endpoint[]>("/endpoints");
      set({ endpoints: response.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEndpoint: async (newEp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Endpoint>("/endpoints", newEp);
      set((state) => ({ endpoints: [response.data, ...state.endpoints] }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateEndpoint: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/endpoints/${id}`, updates);
      set((state) => ({
        endpoints: state.endpoints.map((ep) =>
          ep.id === id ? { ...ep, ...updates, updatedAt: new Date() } : ep
        ),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEndpoint: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/endpoints/${id}`);
      set((state) => ({
        endpoints: state.endpoints.filter((ep) => ep.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
