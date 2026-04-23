export type School = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export type SchoolClass = {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
  shift: string;
  weeklyPeriods: number;
};

export type CurriculumComponent = {
  id: string;
  name: string;
  stage: string;
};

export type CurriculumSkill = {
  id: string;
  code: string;
  descriptionLiteral: string;
  componentId: string;
  gradeLevel: string;
  term: string;
};

export type Template = {
  id: string;
  name: string;
  documentKind: "annual" | "term" | "weekly" | "lesson";
  fileName: string;
  fileDataBase64: string;
  mappingSchema: unknown;
  createdAt: string;
};

export type Plan = {
  id: string;
  schoolId: string;
  classId: string;
  componentId: string;
  teacherName: string;
  title: string;
  planKind: "annual" | "term" | "weekly" | "lesson";
  canonicalJson: unknown;
  createdAt: string;
  updatedAt: string;
};