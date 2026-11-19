import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "../data/types";

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
