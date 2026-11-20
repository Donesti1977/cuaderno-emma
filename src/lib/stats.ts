import { curriculumForGrade } from "../data/curriculum";
import type {
  Attempt,
  Grade,
  LearningSession,
  SkillProgress,
  Unit,
} from "../data/types";
import {
  addDays,
  dayKey,
  formatMinutes,
  isToday,
  lastSevenDays,
  startOfDay,
  weekdayInitial,
} from "./dates";
import { isDue } from "./srs";

export interface DaySummary {
  key: string;
  date: Date;
  label: string;
  minutes: number;
  sessions: number;
}

export interface LearningStats {
  sessions: LearningSession[];
  progress: SkillProgress[];
  attempts: Attempt[];
  sessionsCount: number;
  totalMinutes: number;
  todayMinutes: number;
  todaySessions: number;
  streak: number;
  accuracy: number;
  masteredSkills: number;
  totalAttempts: number;
  dueSkills: SkillProgress[];
  weakSkills: SkillProgress[];
  unitMastery: Record<string, number>;
  week: DaySummary[];
  lastSession?: LearningSession;
}

export function unitSkills(unit: Unit) {
  return unit.skills;
}

export function allUnits(grade: Grade): Unit[] {
  return curriculumForGrade(grade).subjects.flatMap((subject) => subject.units);
}

export function computeUnitMastery(
  unit: Unit,
  progress: SkillProgress[],
): number {
  if (unit.skills.length === 0) return 0;
  const bySkill = new Map(progress.map((item) => [item.skillId, item]));
  const total = unit.skills.reduce((sum, skill) => {
    return sum + (bySkill.get(skill.id)?.mastery ?? 0);
  }, 0);
  return Math.round(total / unit.skills.length);
}

export function computeStreak(sessions: LearningSession[], now = new Date()): number {
  const days = new Set(
    sessions.map((session) => dayKey(new Date(session.endedAt))),
  );
  if (days.size === 0) return 0;

  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeStats(
  profileId: string,
  sessions: LearningSession[],
  progress: SkillProgress[],
  attempts: Attempt[],
  now = new Date(),
  grade: Grade = 3,
): LearningStats {
  const mySessions = sessions
    .filter((session) => session.profileId === profileId)
    .sort(
      (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
    );
  const myProgress = progress.filter((item) => item.profileId === profileId);
  const myAttempts = attempts.filter((attempt) => attempt.profileId === profileId);

  const totalAttempts = myAttempts.length;
  const correctAttempts = myAttempts.filter((attempt) => attempt.correct).length;
  const accuracy =
    totalAttempts === 0
      ? 0
      : Math.round((correctAttempts / totalAttempts) * 100);

  const todaySessions = mySessions.filter((session) =>
    isToday(session.endedAt, now),
  );

  const unitMastery: Record<string, number> = {};
  for (const unit of allUnits(grade)) {
    unitMastery[unit.id] = computeUnitMastery(unit, myProgress);
  }

  const week = lastSevenDays(now).map((date) => {
    const key = dayKey(date);
    const daySessions = mySessions.filter(
      (session) => dayKey(new Date(session.endedAt)) === key,
    );
    return {
      key,
      date,
      label: weekdayInitial(date),
      minutes: daySessions.reduce((sum, session) => sum + session.minutes, 0),
      sessions: daySessions.length,
    };
  });

  return {
    sessions: mySessions,
    progress: myProgress,
    attempts: myAttempts,
    sessionsCount: mySessions.length,
    totalMinutes: mySessions.reduce((sum, session) => sum + session.minutes, 0),
    todayMinutes: todaySessions.reduce(
      (sum, session) => sum + session.minutes,
      0,
    ),
    todaySessions: todaySessions.length,
    streak: computeStreak(mySessions, now),
    accuracy,
    masteredSkills: myProgress.filter((item) => item.mastery >= 80).length,
    totalAttempts,
    dueSkills: myProgress.filter((item) => isDue(item, now)),
    weakSkills: myProgress
      .filter((item) => item.attempts > 0 && item.mastery < 60)
      .sort((a, b) => a.mastery - b.mastery),
    unitMastery,
    week,
    lastSession: mySessions[0],
  };
}

export function alreadyPracticedToday(
  sessions: LearningSession[],
  now = new Date(),
): boolean {
  return sessions.some((session) => isToday(session.endedAt, now));
}

export function weekSummaryText(week: DaySummary[]): string {
  const activeDays = week.filter((day) => day.sessions > 0).length;
  const minutes = week.reduce((sum, day) => sum + day.minutes, 0);
  if (activeDays === 0) return "Esta semana aún no hay sesiones.";
  return `${activeDays} ${activeDays === 1 ? "día" : "días"} de estudio · ${formatMinutes(minutes)}`;
}
