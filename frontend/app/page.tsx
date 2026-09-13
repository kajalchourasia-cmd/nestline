"use client";

import { useEffect, useState } from "react";
import type {
  HomeData, JourneyKind, MayaDisplay, OnboardingPayload, OnboardingResult,
} from "@/lib/maya-api";
import { MayaApiError, mayaApi } from "@/lib/maya-api";
import { Chat } from "./maya/chat";
import { PregnancyDashboard, PostpartumDashboard, WeekLibrary } from "./maya/dashboard";
import { Landing, Onboarding } from "./maya/onboarding";

type View = "landing" | "onboarding" | "dashboard" | "chat" | "library";
type Focus = "balanced" | "nutrition" | "movement" | "wellbeing";

const SESSION_KEY = "maya-product-preview-session";
const CONTEXT_KEY = "maya-product-preview-fictional-context";

function cachedContext(): OnboardingPayload | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(CONTEXT_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as OnboardingPayload;
  } catch {
    sessionStorage.removeItem(CONTEXT_KEY);
    return null;
  }
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [sessionId, setSessionId] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem(SESSION_KEY) || "");
  const [lastPayload, setLastPayload] = useState<OnboardingPayload | null>(() => cachedContext());
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [journey, setJourney] = useState<JourneyKind>("pregnant");
  const [appError, setAppError] = useState("");
  const [onboardingNotice, setOnboardingNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");

  const rememberSession = (id: string) => {
    setSessionId(id);
    localStorage.setItem(SESSION_KEY, id);
  };

  const clearSessionIdentity = () => {
    setSessionId("");
    localStorage.removeItem(SESSION_KEY);
  };

  const clearSession = () => {
    clearSessionIdentity();
    setHomeData(null);
  };

  const rememberPayload = (payload: OnboardingPayload) => {
    const cached = { ...payload, session_id: undefined };
    setLastPayload(cached);
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(cached));
  };

  const clearPayload = () => {
    setLastPayload(null);
    sessionStorage.removeItem(CONTEXT_KEY);
  };

  const createSession = async () => {
    const session = await mayaApi.createSession();
    rememberSession(session.session_id);
    return session.session_id;
  };

  const begin = () => {
    clearSession();
    clearPayload();
    setAppError("");
    setOnboardingNotice("");
    setView("onboarding");
    setBusy(true);
    void createSession().catch(reason => {
      setOnboardingNotice(reason instanceof Error ? reason.message : "The Maya API is unavailable.");
    }).finally(() => setBusy(false));
  };

  const finishOnboarding = async (payload: OnboardingPayload): Promise<OnboardingResult> => {
    setOnboardingNotice("");
    let sid = payload.session_id || sessionId;
    if (!sid) sid = await createSession();
    const submitted = { ...payload, session_id: sid };
    let resolved: OnboardingResult;
    try {
      resolved = await mayaApi.onboard(submitted);
    } catch (reason) {
      if (!(reason instanceof MayaApiError) || !reason.isMissingSession) throw reason;
      clearSession();
      sid = await createSession();
      resolved = await mayaApi.onboard({ ...payload, session_id: sid });
    }
    rememberPayload(payload);
    rememberSession(resolved.session_id);
    setJourney(payload.journey);
    if (resolved.safety_blocked) return resolved;
    const nextHome = await mayaApi.home(resolved.session_id);
    setHomeData(nextHome);
    setView("dashboard");
    return resolved;
  };

  const preview = async () => {
    setBusy(true);
    setAppError("");
    try {
      clearSession();
      clearPayload();
      const sid = await createSession();
      await finishOnboarding({
        session_id: sid,
        name: "Maya guest",
        journey: "pregnant",
        timeline_mode: "week",
        timeline_value: "26",
        diets: ["Vegetarian"],
        allergies: ["Peanut"],
        symptoms: [],
        use_fictional_sample_record: true,
      });
    } catch (reason) {
      setAppError(reason instanceof Error ? reason.message : "The Maya API is unavailable.");
    } finally {
      setBusy(false);
    }
  };

  const withRecoveredSession = async <T,>(operation: (id: string) => Promise<T>): Promise<T> => {
    if (!sessionId) {
      setOnboardingNotice("Add a sample timeline before using this feature.");
      setView("onboarding");
      throw new Error("Add a sample timeline before using this feature.");
    }
    try {
      return await operation(sessionId);
    } catch (reason) {
      if (!(reason instanceof MayaApiError) || !reason.isMissingSession) throw reason;
      clearSessionIdentity();
      if (!lastPayload) {
        setOnboardingNotice("The local preview restarted. Please add your sample timeline again.");
        setView("onboarding");
        throw new Error("The local preview restarted. Please complete onboarding again.");
      }
      const recoveredId = await createSession();
      const recovered = await mayaApi.onboard({ ...lastPayload, session_id: recoveredId });
      if (recovered.safety_blocked) {
        setOnboardingNotice("The recovered sample needs safety clarification before continuing.");
        setView("onboarding");
        throw new Error("Safety clarification is required before continuing.");
      }
      const nextHome = await mayaApi.home(recoveredId);
      setHomeData(nextHome);
      setJourney(lastPayload.journey);
      return operation(recoveredId);
    }
  };

  const runPlan = (focus: Focus) => withRecoveredSession(id => mayaApi.plan(id, focus));
  const runChat = (text: string): Promise<MayaDisplay> =>
    withRecoveredSession(id => mayaApi.chat(id, text).then(response => response.display));

  const openChat = (question = "") => {
    setChatQuestion(question);
    setView("chat");
  };

  const openLandingChat = () => {
    setOnboardingNotice("Add a sample timeline first so Ask Maya has trusted journey context.");
    setView("onboarding");
    if (!sessionId) {
      setBusy(true);
      void createSession().catch(reason => {
        setOnboardingNotice(reason instanceof Error ? reason.message : "The Maya API is unavailable.");
      }).finally(() => setBusy(false));
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return;
    void mayaApi.validateSession(stored).then(async status => {
      if (!status.onboarding_complete) return;
      const nextHome = await mayaApi.home(stored);
      setHomeData(nextHome);
      setJourney(nextHome.journey.stage === "postpartum" ? "postpartum" : "pregnant");
      setView("dashboard");
    }).catch(async reason => {
      if (!(reason instanceof MayaApiError) || !reason.isMissingSession) return;
      clearSession();
      if (!lastPayload) {
        setOnboardingNotice("The local Product Preview restarted. Add your sample timeline again.");
        return;
      }
      setOnboardingNotice("The local Product Preview restarted. Restoring your fictional sample context…");
      try {
        await finishOnboarding(lastPayload);
      } catch (recoveryError) {
        setOnboardingNotice(recoveryError instanceof Error ? recoveryError.message : "The sample context could not be restored.");
      }
    });
  // Restore one browser-local Product Preview session on first hydration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const context = (document as Document & {
      modelContext?: {
        registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(context.registerTool({
      name: "open_maya_view",
      title: "Open a Maya view",
      description: "Navigate Maya to the landing page, onboarding, dashboard, Ask Maya, or the editorial week library.",
      inputSchema: {
        type: "object",
        properties: { view: { type: "string", enum: ["landing", "onboarding", "dashboard", "chat", "library"] } },
        required: ["view"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const next = (input as { view?: string })?.view;
        if (!["landing", "onboarding", "dashboard", "chat", "library"].includes(next || "")) {
          throw new Error("Choose a valid Maya view.");
        }
        if ((next === "dashboard" || next === "library") && !homeData) {
          throw new Error("Complete Product Preview onboarding before opening that view.");
        }
        setView(next as View);
        return { view: next, status: "opened" };
      },
    }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, [homeData]);

  if (view === "onboarding") {
    return <Onboarding back={() => setView("landing")} done={finishOnboarding} initialError={onboardingNotice} />;
  }
  if (view === "dashboard" && homeData) {
    return journey === "postpartum"
      ? <PostpartumDashboard home={homeData} openChat={openChat} goHome={() => setView("landing")} runPlan={runPlan} />
      : <PregnancyDashboard home={homeData} openChat={openChat} goHome={() => setView("landing")} openLibrary={() => setView("library")} runPlan={runPlan} />;
  }
  if (view === "library" && homeData && journey === "pregnant") {
    return <WeekLibrary selectedWeek={homeData.journey.exact} back={() => setView("dashboard")} home={homeData} />;
  }
  if (view === "chat" && homeData) {
    return <Chat
      key={chatQuestion || "free-text"}
      name={homeData.name}
      journey={journey}
      journeyLabel={homeData.journey_label}
      back={() => setView("dashboard")}
      runChat={runChat}
      initialQuestion={chatQuestion}
    />;
  }
  if (view === "chat" && !homeData) {
    return <Onboarding back={() => setView("landing")} done={finishOnboarding} initialError={onboardingNotice || "Add a sample timeline first so Ask Maya has trusted journey context."} />;
  }
  return <Landing start={begin} preview={() => void preview()} chat={openLandingChat} busy={busy} error={appError} retry={() => void preview()} />;
}
