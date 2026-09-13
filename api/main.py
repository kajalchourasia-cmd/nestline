"""Thin HTTP adapter connecting the existing Maya UI to the accepted backend.

This API intentionally exposes only controlled Demo Mode. It does not accept
real medical documents, impersonate Personal Mode, or bypass the accepted Stage 6–8
safety, orchestration, and validation boundaries. Stage 10 durable state remains
inside the established Streamlit/storage surface.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
import os
from pathlib import Path
from threading import RLock
from typing import Literal
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.schemas.foundation import SafetySpec
from app.schemas.onboarding import (
    ApproximateMonthTiming,
    DeliveryDateTiming,
    EstimatedDueDateTiming,
    ManualWeekDayTiming,
)
from app.schemas.orchestration import (
    AuthenticatedContextSnapshot,
    ContextItem,
    ContextKind,
    FactState,
)
from app.schemas.retrieval import JourneyPosition
from app.services.journey import JourneyResolutionError, JourneyResolver
from app.services.product_experience import run_compass
from app.services.safety_gate import SafetyGate, build_safety_input
from scripts.stage7_fixture_support import context_item


APP_ROOT = Path(__file__).resolve().parents[1]
SPEC_PATH = APP_ROOT / "data" / "safety" / "rule_spec.yaml"
SAFETY_SPEC = SafetySpec.model_validate_json(SPEC_PATH.read_text(encoding="utf-8"))
SAFETY_GATE = SafetyGate(SAFETY_SPEC, mode="evaluation_only")


class OnboardingRequest(BaseModel):
    session_id: UUID | None = None
    name: str = Field(default="", max_length=80)
    journey: Literal["pregnant", "postpartum"]
    timeline_mode: Literal["week", "month", "due", "birth_date"]
    timeline_value: str
    diets: list[str] = Field(default_factory=list, max_length=12)
    allergies: list[str] = Field(default_factory=list, max_length=20)
    symptoms: list[str] = Field(default_factory=list, max_length=12)
    use_fictional_sample_record: bool = False


class ChatRequest(BaseModel):
    session_id: UUID
    text: str = Field(min_length=1, max_length=2_000)


class PlanRequest(BaseModel):
    session_id: UUID
    horizon: Literal["day", "week"] = "week"
    focus: Literal["balanced", "nutrition", "movement", "wellbeing"] = "balanced"


class DemoSessionResponse(BaseModel):
    session_id: UUID
    mode: Literal["demo"] = "demo"
    fictional: Literal[True] = True


@dataclass
class DemoSession:
    session_id: UUID
    workspace_id: UUID
    owner_id: UUID
    name: str = ""
    state_version: int = 1
    journey: JourneyPosition = field(
        default_factory=lambda: JourneyPosition(stage="pregnancy", unit="week", exact=24)
    )
    journey_label: str = "Pregnancy week 24"
    timeline_source: str = "manual_week_day"
    diets: list[str] = field(default_factory=list)
    allergies: list[str] = field(default_factory=list)
    symptoms: list[str] = field(default_factory=list)
    use_fictional_sample_record: bool = False
    context: AuthenticatedContextSnapshot | None = None


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[UUID, DemoSession] = {}
        self._lock = RLock()

    def create(self) -> DemoSession:
        with self._lock:
            session_id, workspace_id, owner_id = uuid4(), uuid4(), uuid4()
            session = DemoSession(session_id, workspace_id, owner_id)
            self._sessions[session_id] = session
            return session

    def get(self, session_id: UUID) -> DemoSession:
        with self._lock:
            session = self._sessions.get(session_id)
            if session is None:
                raise KeyError(session_id)
            return session


STORE = SessionStore()
app = FastAPI(
    title="Maya AI Demo API",
    version="1.0.0",
    description="Controlled fictional demo adapter over the accepted project stages.",
)

allowed_origins = [
    value.strip()
    for value in os.environ.get(
        "MAYA_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5180,http://127.0.0.1:5180,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if value.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _session(session_id: UUID) -> DemoSession:
    try:
        return STORE.get(session_id)
    except KeyError as exc:
        raise HTTPException(404, "Demo session not found. Please restart onboarding.") from exc


def _resolve_timeline(payload: OnboardingRequest):
    today = date.today()
    resolver = JourneyResolver()
    if payload.journey == "postpartum":
        if payload.timeline_mode != "birth_date":
            raise JourneyResolutionError("postpartum onboarding requires a birth date")
        timing = DeliveryDateTiming(delivery_date=date.fromisoformat(payload.timeline_value))
    elif payload.timeline_mode == "week":
        timing = ManualWeekDayTiming(
            effective_date=today, gestational_week=int(payload.timeline_value), gestational_day=0,
        )
    elif payload.timeline_mode == "month":
        timing = ApproximateMonthTiming(
            effective_date=today, pregnancy_month=int(payload.timeline_value),
        )
    elif payload.timeline_mode == "due":
        timing = EstimatedDueDateTiming(
            effective_date=today,
            estimated_due_date=date.fromisoformat(payload.timeline_value),
        )
    else:
        raise JourneyResolutionError("pregnancy onboarding requires week, month, or due date")
    return resolver.resolve(timing)


def _journey_position(resolution) -> JourneyPosition:
    if resolution.stage == "pregnancy":
        if resolution.gestational_week is not None:
            return JourneyPosition(
                stage="pregnancy", unit="week", exact=resolution.gestational_week,
            )
        return JourneyPosition(
            stage="pregnancy", unit="week",
            range_start=resolution.approximate_week_min,
            range_end=resolution.approximate_week_max,
        )
    return JourneyPosition(
        stage="postpartum", unit="week", exact=resolution.postpartum_week,
    )


def _context_for(session: DemoSession) -> AuthenticatedContextSnapshot:
    rows: list[ContextItem] = []
    for index, value in enumerate(session.diets):
        rows.append(context_item(f"diet-{index}", ContextKind.PREFERENCE, value))
    for index, value in enumerate(session.allergies):
        rows.append(context_item(f"allergy-{index}", ContextKind.ALLERGY, value))
    for index, value in enumerate(session.symptoms):
        rows.append(context_item(f"symptom-{index}", ContextKind.SYMPTOM, value))
    if session.use_fictional_sample_record:
        rows.extend([
            context_item(
                "sample-supplement", ContextKind.SUPPLEMENT,
                {"name": "Fictional recorded supplement", "frequency": "daily", "timing": "08:00"},
                source_id="DEMO-DOC-001", span="Fictional sample: one recorded supplement daily",
                record_only=True,
            ),
            context_item(
                "sample-appointment", ContextKind.APPOINTMENT,
                {"day": "wednesday", "start": "10:00", "end": "11:00", "label": "Fictional check-up"},
            ),
        ])
    for day in ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"):
        rows.append(context_item(
            f"availability-{day}", ContextKind.PREFERENCE,
            {"day": day, "start": "08:00", "end": "12:00"},
        ))
    return AuthenticatedContextSnapshot(
        workspace_id=session.workspace_id,
        care_episode_id=session.workspace_id,
        owner_user_id=session.owner_id,
        session_subject=session.owner_id,
        state_version=session.state_version,
        captured_at=datetime.now(timezone.utc),
        journey=session.journey,
        items=rows,
    )


def _symptom_checks(symptoms: list[str]) -> list[dict]:
    values = []
    for symptom in symptoms:
        gate_input = build_safety_input(channel="onboarding_symptom", text=symptom)
        result = SAFETY_GATE.evaluate(gate_input)
        values.append({
            "symptom": symptom,
            "route": result.route,
            "message": result.fixed_message.text if result.fixed_message else (
                result.clarification.question if result.clarification else "No urgent rule matched."
            ),
            "matched_rule_ids": [match.rule_id for match in result.matched_rules],
            "ordinary_generation_allowed": result.ordinary_generation_allowed,
            "trace_id": str(result.trace.trace_id),
            "stop_reason": result.trace.stop_reason,
        })
    return values


@app.get("/healthz")
def health() -> dict:
    return {"status": "ok", "product": "Maya AI", "mode": "controlled_demo"}


@app.post("/v1/demo/session", response_model=DemoSessionResponse)
def create_demo_session() -> DemoSessionResponse:
    session = STORE.create()
    return DemoSessionResponse(session_id=session.session_id)


@app.post("/v1/demo/onboarding")
def onboard(payload: OnboardingRequest) -> dict:
    session = _session(payload.session_id) if payload.session_id else STORE.create()
    try:
        resolution = _resolve_timeline(payload)
    except (ValueError, JourneyResolutionError) as exc:
        raise HTTPException(422, str(exc)) from exc
    session.name = " ".join(payload.name.split())
    session.journey = _journey_position(resolution)
    session.journey_label = resolution.display_label
    session.timeline_source = resolution.timing_source
    session.diets = sorted(set(payload.diets))
    session.allergies = sorted(set(payload.allergies))
    session.symptoms = sorted(set(payload.symptoms))
    session.use_fictional_sample_record = payload.use_fictional_sample_record
    session.context = _context_for(session)
    symptom_checks = _symptom_checks(session.symptoms)
    safety_blocked = any(
        check["route"] in {"urgent", "needs_clarification"}
        or not check["ordinary_generation_allowed"]
        for check in symptom_checks
    )
    return {
        "session_id": session.session_id,
        "name": session.name,
        "journey": session.journey.model_dump(mode="json"),
        "journey_label": session.journey_label,
        "timeline_source": session.timeline_source,
        "limitations": resolution.limitations,
        "symptom_checks": symptom_checks,
        "safety_blocked": safety_blocked,
        "mode": "demo",
        "fictional": True,
    }


@app.get("/v1/demo/home/{session_id}")
def home(session_id: UUID) -> dict:
    session = _session(session_id)
    return {
        "name": session.name,
        "journey": session.journey.model_dump(mode="json"),
        "journey_label": session.journey_label,
        "confirmed_context": {
            "diets": session.diets,
            "allergies": session.allergies,
            "symptoms": session.symptoms,
        },
        "kpis": {
            "care_records": 1 if session.use_fictional_sample_record else 0,
            "upcoming_appointment": "Wednesday · 10:00" if session.use_fictional_sample_record else None,
            "plan_state": "not_created",
        },
        "mode": "demo",
        "fictional": True,
        "record_context": "connected" if session.use_fictional_sample_record else "not_connected",
        "context_notice": (
            "A fictional sample care record is connected."
            if session.use_fictional_sample_record else
            "No care record is connected. Personalised answers remain limited; "
            "missing context must be requested or cause the flow to stop rather than guess."
        ),
        "public_release_available": False,
    }


@app.post("/v1/demo/chat")
def chat(payload: ChatRequest) -> dict:
    session = _session(payload.session_id)
    if session.context is None:
        raise HTTPException(409, "Complete onboarding before using Ask Maya.")
    execution = run_compass(payload.text, context=session.context)
    return {
        "display": execution.display.model_dump(mode="json"),
        "mode": "demo",
        "fictional": True,
        "record_context": "connected" if session.use_fictional_sample_record else "not_connected",
        "context_notice": (
            "A fictional sample care record is connected."
            if session.use_fictional_sample_record else
            "No care record is connected. This response cannot assume missing personal information."
        ),
    }


@app.post("/v1/demo/plan")
def plan(payload: PlanRequest) -> dict:
    session = _session(payload.session_id)
    if session.context is None:
        raise HTTPException(409, "Complete onboarding before creating a plan.")
    prompt = {
        "balanced": "Create a balanced weekly plan for nutrition, movement, wellbeing and follow-up.",
        "nutrition": "Create a weekly nutrition plan that respects all confirmed constraints.",
        "movement": "Create a weekly movement plan that respects all confirmed restrictions.",
        "wellbeing": "Create a weekly wellbeing plan with optional gentle activities.",
    }[payload.focus]
    execution = run_compass(prompt, horizon=payload.horizon, context=session.context)
    schedule = execution.stage7.proposed_schedule
    return {
        "display": execution.display.model_dump(mode="json"),
        "schedule": schedule.model_dump(mode="json") if schedule else None,
        "mode": "demo",
        "fictional": True,
        "save_available": bool(schedule and schedule.save_eligible),
    }


@app.post("/v1/demo/document-sample/{session_id}")
def enable_sample_document(session_id: UUID) -> dict:
    session = _session(session_id)
    session.use_fictional_sample_record = True
    session.context = _context_for(session)
    return {
        "accepted": True,
        "document_id": "DEMO-DOC-001",
        "label": "Fictional sample record",
        "warning": "Real medical file upload is not enabled in Demo Mode.",
    }
