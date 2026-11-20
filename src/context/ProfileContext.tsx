import { createContext, useContext, type ReactNode } from "react";
import type { Grade, Profile } from "../data/types";
import { useAppStore } from "../store/appStore";

const ProfileContext = createContext<Profile | null>(null);

export function ProfileProvider({
  profile,
  children,
}: {
  profile: Profile;
  children: ReactNode;
}) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext(): Profile {
  const profile = useContext(ProfileContext);
  if (!profile) {
    throw new Error("useProfileContext necesita un perfil activo.");
  }
  return profile;
}

/**
 * Curso activo: la selección del menú izquierdo; si el usuario nunca la
 * cambia, sigue el curso del perfil activo.
 */
export function useActiveGrade(): Grade {
  const grade = useAppStore((state) => state.grade);
  const profile = useProfileContext();
  return grade ?? profile.grade;
}
