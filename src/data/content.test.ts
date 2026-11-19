import { describe, expect, it } from "vitest";
import { curriculum, mathUnit1 } from "./curriculum";
import { curriculumSchema } from "./schema";
import {
  allActivities,
  findActivity,
  findSkill,
  findSubject,
  findUnit,
  findUnitOfActivity,
  findUnitOfSkill,
  readyUnits,
} from "./lookup";

describe("currículo", () => {
  it("cumple el esquema de contenido", () => {
    const result = curriculumSchema.safeParse(curriculum);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it("no repite identificadores", () => {
    const activities = allActivities();
    const ids = activities.map((activity) => activity.id);
    expect(new Set(ids).size).toBe(ids.length);

    const skillIds = curriculum.subjects.flatMap((subject) =>
      subject.units.flatMap((unit) => unit.skills.map((skill) => skill.id)),
    );
    expect(new Set(skillIds).size).toBe(skillIds.length);

    const unitIds = curriculum.subjects.flatMap((subject) =>
      subject.units.map((unit) => unit.id),
    );
    expect(new Set(unitIds).size).toBe(unitIds.length);
  });

  it("cada actividad pertenece a una habilidad de su unidad", () => {
    for (const subject of curriculum.subjects) {
      for (const unit of subject.units) {
        const skillIds = new Set(unit.skills.map((skill) => skill.id));
        for (const activity of unit.activities) {
          expect(skillIds.has(activity.skillId)).toBe(true);
          expect(activity.difficulty).toBeGreaterThanOrEqual(1);
          expect(activity.difficulty).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it("las opciones y las parejas no se repiten", () => {
    for (const activity of allActivities()) {
      if (activity.type === "choice") {
        expect(new Set(activity.options).size).toBe(activity.options.length);
        expect(activity.correct).toBeGreaterThanOrEqual(0);
        expect(activity.correct).toBeLessThan(activity.options.length);
      }
      if (activity.type === "match") {
        expect(new Set(activity.pairs.map((pair) => pair.id)).size).toBe(
          activity.pairs.length,
        );
        expect(new Set(activity.pairs.map((pair) => pair.left)).size).toBe(
          activity.pairs.length,
        );
        expect(new Set(activity.pairs.map((pair) => pair.right)).size).toBe(
          activity.pairs.length,
        );
      }
      if (activity.type === "input") {
        expect(activity.answers.length).toBeGreaterThan(0);
        for (const answer of activity.answers) {
          expect(answer.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("las unidades listas tienen contenido suficiente", () => {
    const ready = readyUnits();
    expect(ready.length).toBeGreaterThan(0);

    for (const unit of ready) {
      expect(unit.skills.length).toBeGreaterThanOrEqual(3);
      expect(unit.activities.length).toBeGreaterThanOrEqual(unit.skills.length * 3);
      for (const skill of unit.skills) {
        const count = unit.activities.filter(
          (item) => item.skillId === skill.id,
        ).length;
        expect(count).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("el Tema 1 de Matemáticas de 3º está completo", () => {
    expect(mathUnit1.id).toBe("mat-3-u1-numeros");
    expect(mathUnit1.grade).toBe(3);
    expect(mathUnit1.subjectId).toBe("matematicas");
    expect(mathUnit1.status).toBe("ready");
    expect(mathUnit1.skills).toHaveLength(6);
    expect(mathUnit1.activities).toHaveLength(41);
    expect(new Set(mathUnit1.activities.map((item) => item.id))).toEqual(
      new Set(Array.from({ length: 41 }, (_, index) => `m3-u1-a${String(index + 1).padStart(2, "0")}`)),
    );
  });
});

describe("búsquedas", () => {
  it("encuentra materias, unidades, habilidades y actividades", () => {
    expect(findSubject("matematicas")?.id).toBe("matematicas");
    expect(findSubject("no-existe")).toBeUndefined();
    expect(findUnit(mathUnit1.id)?.title).toBe(mathUnit1.title);
    expect(findUnit("no-existe")).toBeUndefined();
    expect(findSkill("m3-u1-leer")?.name).toBe("Leer y escribir");
    expect(findActivity("m3-u1-a01")?.type).toBe("choice");
    expect(findActivity("m3-u1-a41")?.type).toBe("input");
    expect(findUnitOfActivity("m3-u1-a01")?.id).toBe(mathUnit1.id);
    expect(findUnitOfSkill("m3-u1-problemas")?.id).toBe(mathUnit1.id);
  });
});
