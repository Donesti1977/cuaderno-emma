import { curriculum } from "./curriculum";
import type { Activity, Skill, Subject, SubjectId, Unit } from "./types";

export const subjects = curriculum.subjects;

export function findSubject(id: string | undefined): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}

export function findUnit(unitId: string | undefined): Unit | undefined {
  for (const subject of subjects) {
    const unit = subject.units.find((candidate) => candidate.id === unitId);
    if (unit) return unit;
  }
  return undefined;
}

export function findSubjectOfUnit(unit: Unit): Subject | undefined {
  return findSubject(unit.subjectId);
}

export function findSkillInUnit(unit: Unit, skillId: string): Skill | undefined {
  return unit.skills.find((skill) => skill.id === skillId);
}

export function findSkill(skillId: string): Skill | undefined {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      const skill = unit.skills.find((candidate) => candidate.id === skillId);
      if (skill) return skill;
    }
  }
  return undefined;
}

export function findActivity(activityId: string): Activity | undefined {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      const activity = unit.activities.find(
        (candidate) => candidate.id === activityId,
      );
      if (activity) return activity;
    }
  }
  return undefined;
}

export function findUnitOfActivity(activityId: string): Unit | undefined {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      if (unit.activities.some((activity) => activity.id === activityId)) {
        return unit;
      }
    }
  }
  return undefined;
}

export function findUnitOfSkill(skillId: string): Unit | undefined {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      if (unit.skills.some((skill) => skill.id === skillId)) return unit;
    }
  }
  return undefined;
}

export function allActivities(): Activity[] {
  return subjects.flatMap((subject) =>
    subject.units.flatMap((unit) => unit.activities),
  );
}

export function unitsOfSubject(subjectId: SubjectId): Unit[] {
  return findSubject(subjectId)?.units ?? [];
}

export function readyUnits(): Unit[] {
  return subjects.flatMap((subject) =>
    subject.units.filter((unit) => unit.status === "ready"),
  );
}
