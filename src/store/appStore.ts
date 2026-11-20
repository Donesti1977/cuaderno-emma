import { create } from "zustand";
import { GRADES, type Grade } from "../data/types";

const PROFILE_KEY = "cuaderno:profileId";
const GRADE_KEY = "cuaderno:grade";

export type ToastTone = "info" | "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AppState {
  profileId: string | null;
  setProfileId: (profileId: string | null) => void;
  /** Curso seleccionado en el menú izquierdo; null = seguir el curso del perfil. */
  grade: Grade | null;
  setGrade: (grade: Grade) => void;
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

function readStoredGrade(): Grade | null {
  if (typeof window === "undefined") return null;
  try {
    const value = Number(window.localStorage.getItem(GRADE_KEY));
    return GRADES.includes(value as Grade) ? (value as Grade) : null;
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
  grade: readStoredGrade(),
  setGrade: (grade) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(GRADE_KEY, String(grade));
      } catch {
        // El curso sigue disponible mientras dure la sesión.
      }
    }
    set({ grade });
  },
  toast: null,
  showToast: (message, tone = "info") =>
    set({ toast: { id: Date.now(), message, tone } }),
  clearToast: () => set({ toast: null }),
}));
