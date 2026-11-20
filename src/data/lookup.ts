import { curriculumForGrade } from "./curriculum";
import type {
  Activity,
  Curriculum,
  Grade,
  Skill,
  Subject,
  SubjectId,
  Unit,
} from "./types";

/** Las consultas se hacen sobre los temas del curso que se está viendo. */
function forGrade(grade: Grade): Curriculum {
  return curriculumForGrade(grade);
}

export function studyableSubjects(grade: Grade): Subject[] {
  return forGrade(grade).subjects.filter((subject) => subject.studyable);
}

export function findSubject(
  subjectId: string | undefined,
  grade: Grade,
): Subject | undefined {
  return forGrade(grade).subjects.find((subject) => subject.id === subjectId);
}

export function findUnit(
  unitId: string | undefined,
  grade: Grade,
): Unit | undefined {
  for (const subject of forGrade(grade).subjects) {
    const unit = subject.units.find((candidate) => candidate.id === unitId);
    if (unit) return unit;
  }
  return undefined;
}

export function findSubjectOfUnit(unit: Unit): Subject | undefined {
  return findSubject(unit.subjectId, unit.grade);
}

export function findSkillInUnit(unit: Unit, skillId: string): Skill | undefined {
  return unit.skills.find((skill) => skill.id === skillId);
}

export function findSkill(skillId: string, grade: Grade): Skill | undefined {
  for (const subject of forGrade(grade).subjects) {
    for (const unit of subject.units) {
      const skill = unit.skills.find((candidate) => candidate.id === skillId);
      if (skill) return skill;
    }
  }
  return undefined;
}

export function findActivity(
  activityId: string,
  grade: Grade,
): Activity | undefined {
  for (const subject of forGrade(grade).subjects) {
    for (const unit of subject.units) {
      const activity = unit.activities.find(
        (candidate) => candidate.id === activityId,
      );
      if (activity) return activity;
    }
  }
  return undefined;
}

export function findUnitOfActivity(
  activityId: string,
  grade: Grade,
): Unit | undefined {
  for (const subject of forGrade(grade).subjects) {
    for (const unit of subject.units) {
      if (unit.activities.some((activity) => activity.id === activityId)) {
        return unit;
      }
    }
  }
  return undefined;
}

export function findUnitOfSkill(
  skillId: string,
  grade: Grade,
): Unit | undefined {
  for (const subject of forGrade(grade).subjects) {
    for (const unit of subject.units) {
      if (unit.skills.some((skill) => skill.id === skillId)) return unit;
    }
  }
  return undefined;
}

export function allActivities(grade: Grade): Activity[] {
  return forGrade(grade).subjects.flatMap((subject) =>
    subject.units.flatMap((unit) => unit.activities),
  );
}

export function unitsOfSubject(subjectId: SubjectId, grade: Grade): Unit[] {
  return findSubject(subjectId, grade)?.units ?? [];
}

export function readyUnits(grade: Grade): Unit[] {
  return forGrade(grade).subjects.flatMap((subject) =>
    subject.units.filter((unit) => unit.status === "ready"),
  );
}
