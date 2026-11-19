import Dexie, { type Table } from "dexie";
import type {
  Attempt,
  LearningSession,
  Profile,
  SkillProgress,
} from "../data/types";

export class CuadernoDB extends Dexie {
  profiles!: Table<Profile, string>;
  skillProgress!: Table<SkillProgress, string>;
  sessions!: Table<LearningSession, string>;
  attempts!: Table<Attempt, number>;

  constructor() {
    super("cuaderno-emma");
    this.version(1).stores({
      profiles: "id, createdAt",
      skillProgress: "id, profileId, skillId, nextReview, [profileId+skillId]",
      sessions: "id, profileId, endedAt",
      attempts: "++id, profileId, sessionId, activityId, skillId, at, correct",
    });
  }
}

export const db = new CuadernoDB();
