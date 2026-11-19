export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];

export type SubjectId =
  | "matematicas"
  | "lengua"
  | "ingles"
  | "naturales"
  | "sociales"
  | "artistica"
  | "ef";

export type Difficulty = 1 | 2 | 3;

export type SubjectStatus = "ready" | "soon";
export type UnitStatus = "ready" | "soon";

export interface Skill {
  id: string;
  name: string;
  short: string;
  description: string;
}

interface BaseActivity {
  id: string;
  skillId: string;
  difficulty: Difficulty;
  prompt: string;
  explanation: string;
  hint?: string;
}

export interface ChoiceActivity extends BaseActivity {
  type: "choice";
  options: string[];
  correct: number;
}

export interface InputActivity extends BaseActivity {
  type: "input";
  answers: string[];
  placeholder?: string;
  suffix?: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchActivity extends BaseActivity {
  type: "match";
  pairs: MatchPair[];
}

export type Activity = ChoiceActivity | InputActivity | MatchActivity;

export interface Unit {
  id: string;
  grade: Grade;
  subjectId: SubjectId;
  order: number;
  term: string;
  title: string;
  subtitle: string;
  description: string;
  status: UnitStatus;
  skills: Skill[];
  activities: Activity[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  badge?: string;
}

export interface Subject {
  id: SubjectId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  soft: string;
  icon: string;
  status: SubjectStatus;
  units: Unit[];
  tools?: Tool[];
}

export interface Curriculum {
  grade: Grade;
  subjects: Subject[];
}

export interface ProfileSettings {
  dailyGoal: 5 | 10 | 15 | 20;
  fontSize: "normal" | "grande" | "muy-grande";
  dyslexiaFont: boolean;
  reduceMotion: boolean;
  voice: boolean;
  parentPin: string;
}

export interface Profile {
  id: string;
  name: string;
  grade: Grade;
  avatar: "capybara";
  createdAt: string;
  settings: ProfileSettings;
}

export interface SkillProgress {
  id: string;
  profileId: string;
  skillId: string;
  mastery: number;
  box: number;
  nextReview: string;
  attempts: number;
  correct: number;
  lastSeen: string;
}

export interface LearningSession {
  id: string;
  profileId: string;
  unitId: string;
  subjectId: SubjectId;
  startedAt: string;
  endedAt: string;
  total: number;
  correct: number;
  minutes: number;
}

export interface Attempt {
  id?: number;
  profileId: string;
  sessionId: string;
  activityId: string;
  skillId: string;
  correct: boolean;
  at: string;
  difficulty: Difficulty;
}
