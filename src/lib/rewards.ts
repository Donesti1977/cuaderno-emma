import type { LearningStats } from "./stats";

export type StickerMetric =
  | "sessions"
  | "streak"
  | "mastered"
  | "attempts"
  | "accuracy"
  | "unitMastery";

export interface Sticker {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  metric: StickerMetric;
  goal: number;
  unitId?: string;
}

export interface StickerState extends Sticker {
  current: number;
  unlocked: boolean;
  ratio: number;
}

export const STICKERS: Sticker[] = [
  {
    id: "primera-sesion",
    name: "Primer día",
    description: "Completa tu primera sesión.",
    icon: "spark",
    color: "#e8b23f",
    metric: "sessions",
    goal: 1,
  },
  {
    id: "tres-dias",
    name: "Tres días seguidos",
    description: "Vuelve tres días seguidos. Sin prisa, pero sin olvidar.",
    icon: "flame",
    color: "#d95b43",
    metric: "streak",
    goal: 3,
  },
  {
    id: "cinco-habilidades",
    name: "Cinco habilidades",
    description: "Llega al 80 % en cinco habilidades distintas.",
    icon: "star",
    color: "#2f6f99",
    metric: "mastered",
    goal: 5,
  },
  {
    id: "diez-sesiones",
    name: "Diez sesiones",
    description: "Diez sesiones completas. Eso ya es un hábito.",
    icon: "medal",
    color: "#4c8356",
    metric: "sessions",
    goal: 10,
  },
  {
    id: "sin-miedo",
    name: "Sin miedo a fallar",
    description: "Responde 20 preguntas. Los errores también enseñan.",
    icon: "leaf",
    color: "#87506c",
    metric: "attempts",
    goal: 20,
  },
  {
    id: "unidad-numeros",
    name: "Números de cinco cifras",
    description: "Domina la unidad de numeración al 80 %.",
    icon: "book",
    color: "#a9672f",
    metric: "unitMastery",
    goal: 80,
    unitId: "mat-3-u1-numeros",
  },
  {
    id: "semana-completa",
    name: "Semana de estudio",
    description: "Siete días seguidos. La capibara está impresionada.",
    icon: "sun",
    color: "#e8b23f",
    metric: "streak",
    goal: 7,
  },
  {
    id: "buena-punteria",
    name: "Buena puntería",
    description: "Un 85 % de aciertos con al menos 30 preguntas.",
    icon: "target",
    color: "#2f7b76",
    metric: "accuracy",
    goal: 85,
  },
];

function metricValue(sticker: Sticker, stats: LearningStats): number {
  if (sticker.metric === "unitMastery") {
    return sticker.unitId ? (stats.unitMastery[sticker.unitId] ?? 0) : 0;
  }

  const values: Record<Exclude<StickerMetric, "unitMastery">, number> = {
    sessions: stats.sessionsCount,
    streak: stats.streak,
    mastered: stats.masteredSkills,
    attempts: stats.totalAttempts,
    accuracy: stats.accuracy,
  };

  return values[sticker.metric];
}

export function evaluateStickers(stats: LearningStats): StickerState[] {
  return STICKERS.map((sticker) => {
    const current = metricValue(sticker, stats);
    const attempted = sticker.metric !== "accuracy" || stats.totalAttempts >= 30;
    return {
      ...sticker,
      current,
      unlocked: attempted && current >= sticker.goal,
      ratio: Math.min(1, current / sticker.goal),
    };
  });
}

export function stickerProgressText(sticker: StickerState): string {
  const current = Math.min(sticker.current, sticker.goal);
  return sticker.metric === "accuracy"
    ? `${current} % de ${sticker.goal} %`
    : `${current} de ${sticker.goal}`;
}

export function unlockedStickers(stats: LearningStats): StickerState[] {
  return evaluateStickers(stats).filter((sticker) => sticker.unlocked);
}

export function newlyUnlockedStickers(
  stats: LearningStats,
  previousSessions: number,
): StickerState[] {
  return evaluateStickers(stats).filter(
    (sticker) =>
      sticker.unlocked &&
      (sticker.id === "primera-sesion" ||
        sticker.id === "diez-sesiones") &&
      previousSessions < sticker.goal,
  );
}
