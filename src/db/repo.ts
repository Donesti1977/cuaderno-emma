import type {
  Activity,
  Attempt,
  Grade,
  LearningSession,
  Profile,
  ProfileSettings,
  SkillProgress,
} from "../data/types";
import { updateSkillProgress } from "../lib/srs";
import { db } from "./db";

export function defaultSettings(): ProfileSettings {
  return {
    dailyGoal: 10,
    fontSize: "normal",
    dyslexiaFont: false,
    reduceMotion: false,
    voice: true,
    parentPin: "1234",
  };
}

export async function createProfile(
  name: string,
  grade: Grade,
): Promise<Profile> {
  const profile: Profile = {
    id: crypto.randomUUID(),
    name: name.trim() || "Emma",
    grade,
    avatar: "capybara",
    createdAt: new Date().toISOString(),
    settings: defaultSettings(),
  };
  await db.profiles.add(profile);
  return profile;
}

export async function updateProfile(
  profileId: string,
  patch: Partial<Pick<Profile, "name" | "grade">>,
): Promise<void> {
  await db.profiles.update(profileId, patch);
}

export async function updateSettings(
  profileId: string,
  patch: Partial<ProfileSettings>,
): Promise<void> {
  const profile = await db.profiles.get(profileId);
  if (!profile) return;
  await db.profiles.update(profileId, {
    settings: { ...profile.settings, ...patch },
  });
}

export async function recordAnswer(
  profileId: string,
  sessionId: string,
  activity: Activity,
  correct: boolean,
): Promise<SkillProgress> {
  const now = new Date();
  const id = `${profileId}:${activity.skillId}`;

  return db.transaction("rw", db.attempts, db.skillProgress, async () => {
    await db.attempts.add({
      profileId,
      sessionId,
      activityId: activity.id,
      skillId: activity.skillId,
      correct,
      at: now.toISOString(),
      difficulty: activity.difficulty,
    });

    const previous = await db.skillProgress.get(id);
    const next = updateSkillProgress(
      previous,
      profileId,
      activity,
      correct,
      now,
    );
    await db.skillProgress.put(next);
    return next;
  });
}

export async function saveSession(session: LearningSession): Promise<void> {
  await db.sessions.put(session);
}

export async function resetProgress(profileId: string): Promise<void> {
  await db.transaction(
    "rw",
    db.skillProgress,
    db.sessions,
    db.attempts,
    async () => {
      await db.skillProgress.where("profileId").equals(profileId).delete();
      await db.sessions.where("profileId").equals(profileId).delete();
      await db.attempts.where("profileId").equals(profileId).delete();
    },
  );
}

export async function deleteProfile(profileId: string): Promise<void> {
  await db.transaction(
    "rw",
    db.profiles,
    db.skillProgress,
    db.sessions,
    db.attempts,
    async () => {
      await db.profiles.delete(profileId);
      await db.skillProgress.where("profileId").equals(profileId).delete();
      await db.sessions.where("profileId").equals(profileId).delete();
      await db.attempts.where("profileId").equals(profileId).delete();
    },
  );
}

export async function getProfile(profileId: string): Promise<Profile | undefined> {
  return db.profiles.get(profileId);
}

export async function getFrequentErrors(
  profileId: string,
  limit = 5,
): Promise<{ activityId: string; count: number }[]> {
  const attempts: Attempt[] = await db.attempts
    .where("profileId")
    .equals(profileId)
    .filter((attempt) => !attempt.correct)
    .toArray();

  const counts = new Map<string, number>();
  for (const attempt of attempts) {
    counts.set(attempt.activityId, (counts.get(attempt.activityId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([activityId, count]) => ({ activityId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
