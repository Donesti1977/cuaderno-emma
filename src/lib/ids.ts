/**
 * Genera IDs únicos para perfiles, sesiones, etc.
 *
 * `crypto.randomUUID()` no existe en todos los navegadores (Chrome 92,
 * Firefox 95 y Safari 15.4; antes y en algunos contextos inseguros no está
 * disponible), así que hay un fallback que genera un ID de tamaño de UUID a
 * partir de la hora y de aleatoriedad.
 */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}
