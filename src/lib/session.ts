import type { Activity, SkillProgress, Unit } from "../data/types";
import { isDue } from "./srs";

export const SESSION_SIZES: Record<number, number> = {
  5: 5,
  10: 8,
  15: 12,
  20: 16,
};

export function sessionSize(goal: number): number {
  return SESSION_SIZES[goal] ?? 8;
}

export function estimatedMinutes(activityCount: number): number {
  return Math.max(5, Math.ceil(activityCount * 1.2));
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

interface RankedActivity {
  activity: Activity;
  score: number;
}

export function createSession(
  unit: Unit,
  progress: SkillProgress[],
  size: number,
  random = Math.random,
): Activity[] {
  const progressBySkill = new Map(
    progress.map((item) => [item.skillId, item]),
  );
  const now = new Date();

  const rank = (activity: Activity): number => {
    const skill = progressBySkill.get(activity.skillId);
    let score = activity.difficulty;
    if (!skill) return 60 + score;
    if (isDue(skill, now)) return 100 + score;
    if (skill.mastery < 40) return 55 + score;
    if (skill.mastery < 70) return 35 + score;
    return 15 + score;
  };

  const ranked: RankedActivity[] = unit.activities.map((activity) => ({
    activity,
    score: rank(activity),
  }));

  const bySkill = new Map<string, Activity[]>();
  for (const activity of unit.activities) {
    const list = bySkill.get(activity.skillId) ?? [];
    list.push(activity);
    bySkill.set(activity.skillId, list);
  }

  const chosen: Activity[] = [];
  const used = new Set<string>();

  // Primero, una actividad de cada habilidad para que la sesión no se
  // quede en un solo tipo de ejercicio.
  const skillOrder = unit.skills
    .map((skill) => ({
      id: skill.id,
      score: Math.max(
        0,
        ...ranked
          .filter((item) => item.activity.skillId === skill.id)
          .map((item) => item.score),
      ),
    }))
    .sort((a, b) => b.score - a.score);

  for (const skill of skillOrder) {
    if (chosen.length >= size) break;
    const pool = shuffle(bySkill.get(skill.id) ?? [], random);
    const pick = pool.find((activity) => !used.has(activity.id));
    if (pick) {
      chosen.push(pick);
      used.add(pick.id);
    }
  }

  const rest = shuffle(ranked, random)
    .filter((item) => !used.has(item.activity.id))
    .sort((a, b) => b.score - a.score);

  for (const item of rest) {
    if (chosen.length >= size) break;
    chosen.push(item.activity);
    used.add(item.activity.id);
  }

  return shuffle(chosen, random).slice(0, size);
}

export function starsFor(correct: number, total: number): 1 | 2 | 3 {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}

export function summaryMessage(correct: number, total: number): string {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) return "¡Pleno! Has acertado todo. Guarda esta sensación.";
  if (ratio >= 0.8) return "Muy bien. Ya casi lo tienes: una vuelta más y listo.";
  if (ratio >= 0.5)
    return "Buen trabajo. Los fallos de hoy son las pistas de mañana.";
  return "Hoy ha costado un poco, y también cuenta. Lo repasaremos con calma.";
}
