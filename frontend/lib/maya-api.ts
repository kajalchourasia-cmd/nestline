export type JourneyKind = "pregnant" | "postpartum";

export type OnboardingPayload = {
  session_id?: string;
  name: string;
  journey: JourneyKind;
  timeline_mode: "week" | "month" | "due" | "birth_date";
  timeline_value: string;
  diets: string[];
  allergies: string[];
  symptoms: string[];
  use_fictional_sample_record: boolean;
};

export type SafetyCheck = {
  symptom: string;
  route: "urgent" | "needs_clarification" | "non_urgent";
  message: string;
  matched_rule_ids: string[];
  ordinary_generation_allowed: boolean;
  trace_id: string;
  stop_reason: string;
};

export type OnboardingResult = {
  session_id: string;
  journey: { stage: string; unit: string; exact: number | null; range_start: number | null; range_end: number | null };
  journey_label: string;
  symptom_checks: SafetyCheck[];
  safety_blocked: boolean;
};

export type MayaDisplay = {
  route: string;
  title: string;
  summary: string;
  uncertainties: string[];
  applied_constraints: string[];
  proposed_actions: string[];
  validation_display_allowed: boolean;
  ordinary_generation_calls: number;
};

export type HomeData = {
  name: string;
  journey: { stage: string; unit: string; exact: number | null; range_start: number | null; range_end: number | null };
  journey_label: string;
  confirmed_context: { diets: string[]; allergies: string[]; symptoms: string[] };
  kpis: { care_records: number; upcoming_appointment: string | null; plan_state: string };
  mode: "demo";
  fictional: true;
  record_context: "connected" | "not_connected";
  context_notice: string;
  public_release_available: boolean;
};

export type PlanResponse = {
  display: MayaDisplay;
  schedule: null | { save_eligible: boolean; items: Array<{ schedule_item_id: string; day: string; start: string; end: string; domain: string; item: string }> };
  save_available: boolean;
  fictional: true;
};

const API_URL = (process.env.NEXT_PUBLIC_MAYA_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "The Maya service could not complete this request." })) as { detail?: string };
    throw new Error(body.detail || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const mayaApi = {
  createSession: () => request<{ session_id: string }>("/v1/demo/session", { method: "POST" }),
  onboard: (payload: OnboardingPayload) => request<OnboardingResult>("/v1/demo/onboarding", {
    method: "POST", body: JSON.stringify(payload),
  }),
  home: (sessionId: string) => request<HomeData>(`/v1/demo/home/${sessionId}`),
  chat: (sessionId: string, text: string) => request<{ display: MayaDisplay; record_context: "connected" | "not_connected"; context_notice: string }>("/v1/demo/chat", {
    method: "POST", body: JSON.stringify({ session_id: sessionId, text }),
  }),
  plan: (sessionId: string, focus: "balanced" | "nutrition" | "movement" | "wellbeing" = "balanced") => request<PlanResponse>("/v1/demo/plan", {
    method: "POST", body: JSON.stringify({ session_id: sessionId, horizon: "week", focus }),
  }),
};
