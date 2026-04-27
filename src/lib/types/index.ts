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

export type SkillListItem = Skill & {
  component_name?: string;
  support_text?: string;
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

export type PlanSkill = {
  id: string;
  plan_id: string;
  skill_id: string;
  created_at: string;
};

export type DocumentVisibility =
  | "official"
  | "school"
  | "private"
  | "plan_context";

export type DocumentRecord = {
  id: string;
  title: string;
  document_type: string;
  visibility: DocumentVisibility;
  source_kind: string;
  school_id: string | null;
  owner_user_id: string | null;
  plan_id: string | null;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  storage_bucket: string;
  status: string;
  extracted_text: string | null;
  parsed_json: Record<string, unknown>;
  usable_by_ai: boolean;
  approved_by_admin: boolean;
  notes: string | null;
  created_at: string;
};