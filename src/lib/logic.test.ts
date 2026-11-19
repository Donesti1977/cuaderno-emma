import { describe, expect, it } from "vitest";
import { mathUnit1 } from "../data/curriculum";
import type { ChoiceActivity, InputActivity } from "../data/types";
import {
  checkInputAnswer,
  correctAnswerText,
  difficultyLabel,
} from "./answers";
import {
  addDays,
  dayKey,
  daysBetween,
  formatLongDate,
  isToday,
  startOfDay,
} from "./dates";
import {
  BOX_INTERVALS,
  masteryDelta,
  masteryLabel,
  nextBox,
  nextReviewDate,
  updateSkillProgress,
} from "./srs";
import {
  createSession,
  estimatedMinutes,
  sessionSize,
  shuffle,
  starsFor,
  summaryMessage,
} from "./session";

const choice: ChoiceActivity = {
  id: "test-choice",
  type: "choice",
  skillId: "m3-u1-leer",
  difficulty: 1,
  prompt: "¿Cuál es?",
  explanation: "Porque sí.",
  options: ["Uno", "Dos"],
  correct: 1,
};

const input: InputActivity = {
  id: "test-input",
  type: "input",
  skillId: "m3-u1-leer",
  difficulty: 2,
  prompt: "Escribe el número.",
  explanation: "Es 35.207.",
  answers: ["35207", "35.207"],
};

describe("respuestas", () => {
  it("acepta números con y sin puntos, espacios o comas", () => {
    expect(checkInputAnswer("35207", input.answers)).toBe(true);
    expect(checkInputAnswer("35.207", input.answers)).toBe(true);
    expect(checkInputAnswer(" 35 207 ", input.answers)).toBe(true);
    expect(checkInputAnswer("35270", input.answers)).toBe(false);
    expect(checkInputAnswer("", input.answers)).toBe(false);
  });

  it("ignora mayúsculas, tildes y puntuación en respuestas de texto", () => {
    expect(checkInputAnswer("VEINTICUATRO MIL TRESCIENTOS SEIS", ["Veinticuatro mil trescientos seis"])).toBe(true);
    expect(checkInputAnswer("veinticuatro mil trescientos seis.", ["Veinticuatro mil trescientos seis"])).toBe(true);
    expect(checkInputAnswer("Veinticuatro mil seis", ["Veinticuatro mil trescientos seis"])).toBe(false);
  });

  it("devuelve la respuesta correcta según el tipo", () => {
    expect(correctAnswerText(choice)).toBe("Dos");
    expect(correctAnswerText(input)).toBe("35207");
    expect(difficultyLabel(1)).toBe("Calentamiento");
    expect(difficultyLabel(2)).toBe("Practica");
    expect(difficultyLabel(3)).toBe("Reto");
  });
});

describe("fechas", () => {
  const now = new Date(2026, 10, 19, 17, 30);

  it("normaliza el inicio del día", () => {
    const start = startOfDay(now);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(dayKey(start)).toBe("2026-11-19");
  });

  it("suma días y calcula diferencias", () => {
    expect(dayKey(addDays(startOfDay(now), 3))).toBe("2026-11-22");
    expect(daysBetween(addDays(now, -4), now)).toBe(4);
    expect(isToday(now.toISOString(), now)).toBe(true);
    expect(isToday(addDays(now, -1).toISOString(), now)).toBe(false);
  });

  it("formatea la fecha larga en español", () => {
    const text = formatLongDate(now);
    expect(text.charAt(0)).toBe(text.charAt(0).toUpperCase());
    expect(text.toLowerCase()).toContain("noviembre");
  });
});

describe("repetición espaciada", () => {
  const now = new Date(2026, 10, 19, 10, 0);

  it("sube y baja de caja con límites", () => {
    expect(nextBox(0, true)).toBe(1);
    expect(nextBox(5, true)).toBe(5);
    expect(nextBox(3, false)).toBe(2);
    expect(nextBox(0, false)).toBe(0);
    expect(BOX_INTERVALS).toHaveLength(6);
  });

  it("calcula el dominio con límites de 0 a 100", () => {
    expect(masteryDelta(1, true)).toBe(6);
    expect(masteryDelta(2, true)).toBe(9);
    expect(masteryDelta(3, true)).toBe(12);
    expect(masteryDelta(2, false)).toBe(-7);
  });

  it("programa el repaso y actualiza el progreso", () => {
    expect(nextReviewDate(1, now)).toBe(dayKey(addDays(now, 1)));
    expect(nextReviewDate(2, now)).toBe(dayKey(addDays(now, 2)));

    const first = updateSkillProgress(undefined, "p1", choice, true, now);
    expect(first.attempts).toBe(1);
    expect(first.correct).toBe(1);
    expect(first.box).toBe(1);
    expect(first.mastery).toBe(6);

    const second = updateSkillProgress(first, "p1", choice, false, now);
    expect(second.attempts).toBe(2);
    expect(second.correct).toBe(1);
    expect(second.box).toBe(0);
    expect(second.mastery).toBe(0);
    expect(second.nextReview).toBe(dayKey(addDays(now, 1)));
  });

  it("etiqueta el dominio en lenguaje natural", () => {
    expect(masteryLabel(0)).toBe("Sin empezar");
    expect(masteryLabel(20)).toBe("Empezando");
    expect(masteryLabel(40)).toBe("Practicando");
    expect(masteryLabel(70)).toBe("En buen camino");
    expect(masteryLabel(90)).toBe("Dominada");
  });
});

describe("sesiones", () => {
  it("traduce el tiempo diario a número de preguntas", () => {
    expect(sessionSize(5)).toBe(5);
    expect(sessionSize(10)).toBe(8);
    expect(sessionSize(15)).toBe(12);
    expect(sessionSize(20)).toBe(16);
    expect(sessionSize(999)).toBe(8);
    expect(estimatedMinutes(8)).toBeGreaterThanOrEqual(5);
  });

  it("baraja sin perder elementos", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = shuffle(items);
    expect(result).toHaveLength(items.length);
    expect(new Set(result)).toEqual(new Set(items));
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("crea una sesión sin repetir actividades y tocando todas las habilidades", () => {
    const result = createSession(mathUnit1, [], 8, () => 0.5);
    expect(result).toHaveLength(8);
    expect(new Set(result.map((item) => item.id)).size).toBe(8);
    const skills = new Set(result.map((item) => item.skillId));
    expect(skills.size).toBe(mathUnit1.skills.length);
  });

  it("prioriza habilidades pendientes de repaso", () => {
    const masteryBySkill = new Map(
      mathUnit1.skills.map((skill, index) => [
        skill.id,
        {
          id: `p1:${skill.id}`,
          profileId: "p1",
          skillId: skill.id,
          mastery: index === 0 ? 0 : 95,
          box: index === 0 ? 0 : 5,
          nextReview: index === 0 ? "2020-01-01" : "2099-01-01",
          attempts: 10,
          correct: 10,
          lastSeen: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );
    const result = createSession(
      mathUnit1,
      [...masteryBySkill.values()],
      6,
      () => 0.5,
    );
    expect(result.some((item) => item.skillId === "m3-u1-leer")).toBe(true);
  });

  it("calcula estrellas y mensajes de cierre", () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(8, 10)).toBe(2);
    expect(starsFor(7, 10)).toBe(2);
    expect(starsFor(6, 10)).toBe(1);
    expect(summaryMessage(10, 10)).toContain("Pleno");
    expect(summaryMessage(8, 10)).toContain("Muy bien");
    expect(summaryMessage(5, 10)).toContain("Buen trabajo");
    expect(summaryMessage(2, 10)).toContain("también cuenta");
  });
});
