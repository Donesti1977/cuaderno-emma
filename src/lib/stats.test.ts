import { describe, expect, it } from "vitest";
import { mathUnit1 } from "../data/curriculum";
import type { Attempt, LearningSession, SkillProgress } from "../data/types";
import { dayKey } from "./dates";
import { evaluateStickers, stickerProgressText, STICKERS } from "./rewards";
import { computeStats, computeStreak, computeUnitMastery } from "./stats";

const now = new Date(2026, 10, 19, 18, 0);

function session(
  id: string,
  endedAt: Date,
  correct = 6,
  total = 8,
): LearningSession {
  return {
    id,
    profileId: "p1",
    unitId: mathUnit1.id,
    subjectId: "matematicas",
    startedAt: new Date(endedAt.getTime() - 12 * 60_000).toISOString(),
    endedAt: endedAt.toISOString(),
    total,
    correct,
    minutes: 12,
  };
}

function attempt(
  activityId: string,
  correct: boolean,
  at: Date,
  skillId = "m3-u1-leer",
): Attempt {
  return {
    profileId: "p1",
    sessionId: "s1",
    activityId,
    skillId,
    correct,
    at: at.toISOString(),
    difficulty: 1,
  };
}

function progress(skillId: string, mastery: number): SkillProgress {
  return {
    id: `p1:${skillId}`,
    profileId: "p1",
    skillId,
    mastery,
    box: 3,
    nextReview: "2099-01-01",
    attempts: 10,
    correct: 8,
    lastSeen: now.toISOString(),
  };
}

describe("estadísticas", () => {
  it("calcula la racha de días consecutivos", () => {
    expect(computeStreak([], now)).toBe(0);
    expect(
      computeStreak(
        [
          session("hoy", now),
          session("ayer", new Date(2026, 10, 18, 18, 0)),
          session("anteayer", new Date(2026, 10, 17, 18, 0)),
        ],
        now,
      ),
    ).toBe(3);
  });

  it("mantiene la racha si el último día fue ayer", () => {
    expect(
      computeStreak(
        [
          session("ayer", new Date(2026, 10, 18, 18, 0)),
          session("anteayer", new Date(2026, 10, 17, 18, 0)),
        ],
        now,
      ),
    ).toBe(2);
  });

  it("rompe la racha si hay un hueco", () => {
    expect(
      computeStreak(
        [
          session("hoy", now),
          session("hace-dos", new Date(2026, 10, 17, 18, 0)),
        ],
        now,
      ),
    ).toBe(1);
  });

  it("calcula el dominio medio de una unidad", () => {
    expect(computeUnitMastery(mathUnit1, [])).toBe(0);
    expect(
      computeUnitMastery(mathUnit1, [
        progress("m3-u1-leer", 80),
        progress("m3-u1-valor", 40),
      ]),
    ).toBe(20);
  });

  it("resume sesiones, minutos y aciertos", () => {
    const sessions = [
      session("hoy", now, 7, 8),
      session("ayer", new Date(2026, 10, 18, 18, 0), 5, 8),
    ];
    const attempts = [
      attempt("a1", true, now),
      attempt("a2", true, now),
      attempt("a3", false, now),
      attempt("a4", true, now),
    ];
    const stats = computeStats("p1", sessions, [progress("m3-u1-leer", 85)], attempts, now);

    expect(stats.sessionsCount).toBe(2);
    expect(stats.totalMinutes).toBe(24);
    expect(stats.todaySessions).toBe(1);
    expect(stats.totalAttempts).toBe(4);
    expect(stats.accuracy).toBe(75);
    expect(stats.masteredSkills).toBe(1);
    expect(stats.week).toHaveLength(7);
    expect(stats.week[6].key).toBe(dayKey(now));
    expect(stats.week[6].sessions).toBe(1);
    expect(stats.week[5].sessions).toBe(1);
  });

  it("solo cuenta los datos del perfil activo", () => {
    const other: LearningSession = {
      ...session("otro", now),
      profileId: "p2",
    };
    const stats = computeStats(
      "p1",
      [session("mio", now), other],
      [],
      [],
      now,
    );
    expect(stats.sessionsCount).toBe(1);
  });

  it("detecta habilidades flojas y pendientes de repaso", () => {
    const weak = { ...progress("m3-u1-valor", 25), nextReview: "2020-01-01" };
    const strong = progress("m3-u1-leer", 95);
    const stats = computeStats("p1", [], [weak, strong], [], now);
    expect(stats.weakSkills.map((item) => item.skillId)).toEqual([
      "m3-u1-valor",
    ]);
    expect(stats.dueSkills.map((item) => item.skillId)).toEqual([
      "m3-u1-valor",
    ]);
  });
});

describe("pegatinas", () => {
  it("evalúa las ocho pegatinas sin desbloquear nada al principio", () => {
    const stats = computeStats("p1", [], [], [], now);
    const stickers = evaluateStickers(stats);
    expect(stickers).toHaveLength(STICKERS.length);
    expect(stickers.every((sticker) => !sticker.unlocked)).toBe(true);
  });

  it("desbloquea la primera sesión y la de diez sesiones", () => {
    const sessions = Array.from({ length: 10 }, (_, index) =>
      session(`s${index}`, new Date(2026, 10, 19 - index, 18, 0)),
    );
    const stats = computeStats("p1", sessions, [], [], now);
    const stickers = evaluateStickers(stats);
    const unlocked = new Set(
      stickers.filter((sticker) => sticker.unlocked).map((sticker) => sticker.id),
    );
    expect(unlocked.has("primera-sesion")).toBe(true);
    expect(unlocked.has("diez-sesiones")).toBe(true);
    expect(unlocked.has("tres-dias")).toBe(true);
  });

  it("no desbloquea la precisión antes de treinta intentos", () => {
    const attempts = Array.from({ length: 10 }, (_, index) =>
      attempt(`a${index}`, true, now),
    );
    const stats = computeStats("p1", [], [], attempts, now);
    const sticker = evaluateStickers(stats).find(
      (item) => item.id === "buena-punteria",
    );
    expect(sticker?.unlocked).toBe(false);

    const many = Array.from({ length: 30 }, (_, index) =>
      attempt(`b${index}`, index < 28, now),
    );
    const statsMany = computeStats("p1", [], [], many, now);
    const stickerMany = evaluateStickers(statsMany).find(
      (item) => item.id === "buena-punteria",
    );
    expect(stickerMany?.unlocked).toBe(true);
  });

  it("escribe el progreso de precisión en porcentaje", () => {
    const attempts = Array.from({ length: 30 }, (_, index) =>
      attempt(`c${index}`, index < 25, now),
    );
    const statsMany = computeStats("p1", [], [], attempts, now);
    const sticker = evaluateStickers(statsMany).find(
      (item) => item.id === "buena-punteria",
    );
    expect(sticker).toBeDefined();
    if (sticker) {
      expect(stickerProgressText(sticker)).toBe("83 % de 85 %");
    }

    const sessions = Array.from({ length: 3 }, (_, index) =>
      session(`d${index}`, new Date(2026, 10, 19 - index, 18, 0)),
    );
    const stats = computeStats("p1", sessions, [], [], now);
    const streak = evaluateStickers(stats).find(
      (item) => item.id === "tres-dias",
    );
    expect(streak && stickerProgressText(streak)).toBe("3 de 3");
  });
});
