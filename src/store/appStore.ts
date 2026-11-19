import { create } from "zustand";

const PROFILE_KEY = "cuaderno:profileId";

export type ToastTone = "info" | "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AppState {
  profileId: string | null;
  setProfileId: (profileId: string | null) => void;
  toast: Toast | null;
  showToast: (message: string, tone?: ToastTone) => void;
  clearToast: () => void;
}

function readStoredProfile(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PROFILE_KEY);
  } catch {
    return null;
  }
}

export const useAppStore = create<AppState>((set) => ({
  profileId: readStoredProfile(),
  setProfileId: (profileId) => {
    if (typeof window !== "undefined") {
      try {
        if (profileId) {
          window.localStorage.setItem(PROFILE_KEY, profileId);
        } else {
          window.localStorage.removeItem(PROFILE_KEY);
        }
      } catch {
        // Sin almacenamiento local, la sesión dura lo que dure la pestaña.
      }
    }
    set({ profileId });
  },
  toast: null,
  showToast: (message, tone = "info") =>
    set({ toast: { id: Date.now(), message, tone } }),
  clearToast: () => set({ toast: null }),
}));
