import Dexie, { Table } from "dexie";
import {
  School,
  SchoolClass,
  CurriculumComponent,
  CurriculumSkill,
  Template,
  Plan,
} from "@/lib/types";

class PlanejadorRSDatabase extends Dexie {
  schools!: Table<School, string>;
  classes!: Table<SchoolClass, string>;
  components!: Table<CurriculumComponent, string>;
  skills!: Table<CurriculumSkill, string>;
  templates!: Table<Template, string>;
  plans!: Table<Plan, string>;

  constructor() {
    super("planejadorRS");

    this.version(1).stores({
      schools: "id, name, city, state",
      classes: "id, schoolId, name, gradeLevel, shift, weeklyPeriods",
      components: "id, name, stage",
      skills: "id, code, componentId, gradeLevel, term",
      templates: "id, name, documentKind, createdAt",
      plans: "id, schoolId, classId, componentId, teacherName, title, planKind, updatedAt",
    });
  }
}

export const db = new PlanejadorRSDatabase();