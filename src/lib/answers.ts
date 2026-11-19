import type { Activity } from "../data/types";

function normalizeText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?¿¡"'()]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeNumber(value: string): string {
  return value.replace(/\./g, "").replace(/\s/g, "").replace(",", ".");
}

function looksNumeric(value: string): boolean {
  return /^[\d.,\s-]+$/.test(value.trim());
}

export function checkInputAnswer(value: string, answers: string[]): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const normalized = normalizeText(trimmed);
  return answers.some((answer) => {
    if (normalizeText(answer) === normalized) return true;
    if (looksNumeric(answer) && looksNumeric(trimmed)) {
      return normalizeNumber(answer) === normalizeNumber(trimmed);
    }
    return false;
  });
}

export function correctAnswerText(activity: Activity): string {
  if (activity.type === "choice") {
    return activity.options[activity.correct];
  }
  if (activity.type === "input") {
    return activity.answers[0];
  }
  return activity.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(" · ");
}

export function activityTypeLabel(activity: Activity): string {
  if (activity.type === "choice") return "Elige una respuesta";
  if (activity.type === "input") return "Escribe la respuesta";
  return "Une las parejas";
}

export function difficultyLabel(difficulty: number): string {
  if (difficulty >= 3) return "Reto";
  if (difficulty === 2) return "Practica";
  return "Calentamiento";
}
