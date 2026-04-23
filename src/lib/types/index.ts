export type AppRole = "admin" | "teacher";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  active: boolean;
  created_at: string;
};

export type School = {
  id: string;
  name: string;
  city: string | null;
  state: string;
  active: boolean;
  created_at: string;
};

export type SchoolClass = {
  id: string;
  school_id: string;
  name: string;
  grade_level: string;
  shift: string;
  weekly_periods: number;
  active: boolean;
  created_at: string;
};

export type Component = {
  id: string;
  name: string;
  stage: string;
  active: boolean;
  created_at: string;
};

export type Skill = {
  id: string;
  code: string;
  description_literal: string;
  component_id: string;
  grade_level: string;
  term: string;
  stage: string | null;
  modality: string | null;
  active: boolean;
  created_at: string;
};

export type PlanStatus = "draft" | "ready" | "approved";

export type Plan = {
  id: string;
  school_id: string;
  class_id: string;
  component_id: string;
  teacher_user_id: string;
  title: string;
  term: string;
  status: PlanStatus;
  canonical_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};