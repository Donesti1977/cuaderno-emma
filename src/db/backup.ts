import { findUnit } from "../data/lookup";
import type {
  Attempt,
  Grade,
  LearningSession,
  Profile,
  SkillProgress,
} from "../data/types";
import { db } from "./db";

export interface Backup {
  version: 1;
  exportedAt: string;
  profile: Pick<Profile, "name" | "grade">;
  progress: SkillProgress[];
  sessions: LearningSession[];
  attempts: Attempt[];
}

export async function exportBackup(profileId: string): Promise<Backup> {
  const profile = await db.profiles.get(profileId);
  const progress = await db.skillProgress
    .where("profileId")
    .equals(profileId)
    .toArray();
  const sessions = await db.sessions
    .where("profileId")
    .equals(profileId)
    .toArray();
  const attempts = await db.attempts
    .where("profileId")
    .equals(profileId)
    .toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      name: profile?.name ?? "Emma",
      grade: profile?.grade ?? 3,
    },
    progress,
    sessions,
    attempts,
  };
}

export function downloadBackup(backup: Backup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `cuaderno-emma-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(
  profileId: string,
  raw: unknown,
  grade: Grade,
): Promise<void> {
  if (!raw || typeof raw !== "object") {
    throw new Error("El archivo no tiene el formato esperado.");
  }

  const data = raw as Partial<Backup>;
  if (
    data.version !== 1 ||
    !Array.isArray(data.progress) ||
    !Array.isArray(data.sessions) ||
    !Array.isArray(data.attempts)
  ) {
    throw new Error("La copia no es válida o es de otra versión.");
  }

  const progress: SkillProgress[] = data.progress
    .filter((item) => item && typeof item.skillId === "string")
    .map((item) => ({
      ...item,
      id: `${profileId}:${item.skillId}`,
      profileId,
    }));

  const sessions: LearningSession[] = data.sessions
    .filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.unitId === "string" &&
        findUnit(item.unitId, grade),
    )
    .map((item) => ({
      ...item,
      profileId,
    }));

  const attempts: Attempt[] = data.attempts
    .filter(
      (item) =>
        item &&
        typeof item.activityId === "string" &&
        typeof item.skillId === "string",
    )
    .map((item) => {
      const { id: _ignored, ...rest } = item;
      return { ...rest, profileId };
    });

  await db.transaction(
    "rw",
    db.skillProgress,
    db.sessions,
    db.attempts,
    async () => {
      await db.skillProgress.where("profileId").equals(profileId).delete();
      await db.sessions.where("profileId").equals(profileId).delete();
      await db.attempts.where("profileId").equals(profileId).delete();
      await db.skillProgress.bulkPut(progress);
      await db.sessions.bulkPut(sessions);
      await db.attempts.bulkAdd(attempts);
    },
  );
}
