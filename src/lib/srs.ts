import type { Activity, Difficulty, SkillProgress } from "../data/types";
import { addDays, dayKey, startOfDay } from "./dates";

/** Días que se espera antes de volver a practicar una habilidad. */
export const BOX_INTERVALS = [0, 1, 2, 4, 8, 16];

export function clampMastery(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function masteryDelta(difficulty: Difficulty, correct: boolean): number {
  if (!correct) return -7;
  if (difficulty === 3) return 12;
  if (difficulty === 2) return 9;
  return 6;
}

export function nextBox(box: number, correct: boolean): number {
  return correct ? Math.min(5, box + 1) : Math.max(0, box - 1);
}

export function nextReviewDate(box: number, from = new Date()): string {
  const days = correctInterval(box);
  return dayKey(addDays(startOfDay(from), days));
}

function correctInterval(box: number): number {
  if (box <= 0) return 1;
  return BOX_INTERVALS[Math.min(box, BOX_INTERVALS.length - 1)] ?? 1;
}

export function isDue(progress: SkillProgress, now = new Date()): boolean {
  return progress.nextReview <= dayKey(now);
}

export function updateSkillProgress(
  previous: SkillProgress | undefined,
  profileId: string,
  activity: Activity,
  correct: boolean,
  now = new Date(),
): SkillProgress {
  const base: SkillProgress =
    previous ??
    {
      id: `${profileId}:${activity.skillId}`,
      profileId,
      skillId: activity.skillId,
      mastery: 0,
      box: 0,
      nextReview: dayKey(now),
      attempts: 0,
      correct: 0,
      lastSeen: now.toISOString(),
    };

  const mastery = clampMastery(
    base.mastery + masteryDelta(activity.difficulty, correct),
  );
  const box = nextBox(base.box, correct);

  return {
    ...base,
    mastery,
    box,
    nextReview: correct
      ? nextReviewDate(box, now)
      : dayKey(addDays(startOfDay(now), 1)),
    attempts: base.attempts + 1,
    correct: base.correct + (correct ? 1 : 0),
    lastSeen: now.toISOString(),
  };
}

export function masteryLabel(mastery: number): string {
  if (mastery >= 85) return "Dominada";
  if (mastery >= 60) return "En buen camino";
  if (mastery >= 30) return "Practicando";
  if (mastery > 0) return "Empezando";
  return "Sin empezar";
}
