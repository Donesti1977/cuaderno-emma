import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import type {
  Attempt,
  LearningSession,
  SkillProgress,
} from "../data/types";
import { computeStats, type LearningStats } from "../lib/stats";
import { db } from "./db";

export function useProfiles() {
  const profiles = useLiveQuery(() => db.profiles.toArray(), []);
  return {
    profiles: profiles ?? [],
    loading: profiles === undefined,
  };
}

export function useProfile(profileId: string | null) {
  const profile = useLiveQuery(
    () =>
      profileId
        ? db.profiles.get(profileId)
        : Promise.resolve(undefined),
    [profileId],
  );
  return {
    profile,
    loading: profileId !== null && profile === undefined,
  };
}

export function useProgress(profileId: string | null) {
  const progress = useLiveQuery<SkillProgress[]>(
    () =>
      profileId
        ? db.skillProgress.where("profileId").equals(profileId).toArray()
        : Promise.resolve([]),
    [profileId],
  );
  return progress ?? [];
}

export function useProgressState(profileId: string | null) {
  const progress = useLiveQuery<SkillProgress[]>(
    () =>
      profileId
        ? db.skillProgress.where("profileId").equals(profileId).toArray()
        : Promise.resolve([]),
    [profileId],
  );
  return {
    progress: progress ?? [],
    loading: profileId !== null && progress === undefined,
  };
}

export function useSessions(profileId: string | null) {
  const sessions = useLiveQuery<LearningSession[]>(
    () =>
      profileId
        ? db.sessions.where("profileId").equals(profileId).toArray()
        : Promise.resolve([]),
    [profileId],
  );
  return sessions ?? [];
}

export function useAttempts(profileId: string | null) {
  const attempts = useLiveQuery<Attempt[]>(
    () =>
      profileId
        ? db.attempts.where("profileId").equals(profileId).toArray()
        : Promise.resolve([]),
    [profileId],
  );
  return attempts ?? [];
}

export function useLearningStats(profileId: string | null): LearningStats {
  const sessions = useSessions(profileId);
  const progress = useProgress(profileId);
  const attempts = useAttempts(profileId);

  return useMemo(
    () => computeStats(profileId ?? "", sessions, progress, attempts),
    [profileId, sessions, progress, attempts],
  );
}

export function useRecentSessions(profileId: string | null, limit = 8) {
  const sessions = useSessions(profileId);
  return useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
        )
        .slice(0, limit),
    [sessions, limit],
  );
}
