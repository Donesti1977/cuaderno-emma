import { z } from "zod";

const gradeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

const difficultySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

const subjectIdSchema = z.enum([
  "matematicas",
  "lengua",
  "ingles",
  "naturales",
  "sociales",
  "artistica",
]);

const statusSchema = z.enum(["ready", "soon"]);

const baseActivity = {
  id: z.string().min(1),
  skillId: z.string().min(1),
  difficulty: difficultySchema,
  prompt: z.string().min(3),
  explanation: z.string().min(3),
  hint: z.string().min(1).optional(),
};

const choiceActivitySchema = z
  .object({
    ...baseActivity,
    type: z.literal("choice"),
    options: z.array(z.string().min(1)).min(2).max(6),
    correct: z.number().int().min(0),
  })
  .superRefine((activity, ctx) => {
    if (activity.correct >= activity.options.length) {
      ctx.addIssue({
        code: "custom",
        message: "La respuesta correcta apunta fuera de las opciones.",
        path: ["correct"],
      });
    }
    if (new Set(activity.options).size !== activity.options.length) {
      ctx.addIssue({
        code: "custom",
        message: "Hay opciones repetidas.",
        path: ["options"],
      });
    }
  });

const inputActivitySchema = z.object({
  ...baseActivity,
  type: z.literal("input"),
  answers: z.array(z.string().min(1)).min(1),
  placeholder: z.string().optional(),
  suffix: z.string().optional(),
});

const matchPairSchema = z.object({
  id: z.string().min(1),
  left: z.string().min(1),
  right: z.string().min(1),
});

const matchActivitySchema = z
  .object({
    ...baseActivity,
    type: z.literal("match"),
    pairs: z.array(matchPairSchema).min(3).max(6),
  })
  .superRefine((activity, ctx) => {
    if (new Set(activity.pairs.map((pair) => pair.id)).size !== activity.pairs.length) {
      ctx.addIssue({
        code: "custom",
        message: "Hay identificadores de pareja repetidos.",
        path: ["pairs"],
      });
    }
  });

export const activitySchema = z.discriminatedUnion("type", [
  choiceActivitySchema,
  inputActivitySchema,
  matchActivitySchema,
]);

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  short: z.string().min(1),
  description: z.string().min(1),
});

export const unitSchema = z.object({
  id: z.string().min(1),
  grade: gradeSchema,
  subjectId: subjectIdSchema,
  order: z.number().int().min(1),
  term: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  status: statusSchema,
  skills: z.array(skillSchema),
  activities: z.array(activitySchema),
});

export const toolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  badge: z.string().optional(),
});

export const subjectSchema = z.object({
  id: subjectIdSchema,
  name: z.string().min(1),
  shortName: z.string().min(1),
  description: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  soft: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1),
  status: statusSchema,
  studyable: z.boolean(),
  units: z.array(unitSchema).min(1),
  tools: z.array(toolSchema).optional(),
});

export const curriculumSchema = z.object({
  grade: gradeSchema,
  subjects: z.array(subjectSchema).min(1),
});
