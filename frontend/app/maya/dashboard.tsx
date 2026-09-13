"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowLeft, ArrowRight, Baby, CalendarDays, Check, ChevronRight,
  FileHeart, Flower2, Heart, Info, Menu, MoonStar, MoveUpRight,
  Salad, ShieldCheck, Sparkles, SunMedium,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GovernedCard, HomeData, PlanResponse } from "@/lib/maya-api";
import { getBabyGrowth } from "../baby-growth-library";
import { Brand, FetalVisual, FruitVisual, PreviewFooter, StatusPanel } from "./visuals";

type Focus = "balanced" | "nutrition" | "movement" | "wellbeing";
const iconByDomain: Record<string, LucideIcon> = {
  health: Heart,
  nutrition: Salad,
  movement: Activity,
  symptoms: ShieldCheck,
  wellbeing: MoonStar,
  preparation: CalendarDays,
  recovery: Heart,
  feeding: Baby,
  documents: FileHeart,
};

function contextText(values: string[], empty: string) {
  return values.length ? values.join(", ") : empty;
}

function GovernedCards({
  cards,
  action,
}: {
  cards: GovernedCard[];
  action: (card: GovernedCard) => void;
}) {
  return <div className="plan-cards governed-cards">
    {cards.map(card => {
      const Icon = iconByDomain[card.domain] || Sparkles;
      return <article className={card.display_allowed ? "green" : "unavailable-card"} key={card.card_id}>
        <i><Icon /></i>
        <div>
          <span>{card.journey_scope}</span>
          <h3>{card.title}</h3>
          <p>{card.summary}</p>
          <small><ShieldCheck /> {card.display_allowed ? "Reviewed for display" : "Awaiting specialist and release review"}</small>
          <button onClick={() => action(card)}>{card.suggested_action} <ChevronRight /></button>
        </div>
      </article>;
    })}
  </div>;
}

export function ConnectedPlan({
  runPlan,
  initialFocus = "balanced",
}: {
  runPlan: (focus: Focus) => Promise<PlanResponse>;
  initialFocus?: Focus;
}) {
  const [focus, setFocus] = useState<Focus>(initialFocus);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const build = async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await runPlan(focus));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The plan could not be created.");
    } finally {
      setLoading(false);
    }
  };

  return <section className="connected-plan" id="plan-builder">
    <header>
      <div><span>VALIDATED PLAN PREVIEW</span><h2>Build a week that respects the sample context you chose.</h2></div>
      <div className="plan-actions">
        <label htmlFor="plan-focus">Plan focus</label>
        <select id="plan-focus" value={focus} onChange={event => setFocus(event.target.value as Focus)}>
          <option value="balanced">Balanced week</option>
          <option value="nutrition">Nutrition</option>
          <option value="movement">Movement</option>
          <option value="wellbeing">Wellbeing</option>
        </select>
        <Button onClick={() => void build()} disabled={loading}>{loading ? "Building…" : result ? "Rebuild plan" : "Build weekly plan"} <Sparkles /></Button>
      </div>
    </header>
    {error ? <StatusPanel tone="error" title="Plan unavailable" message={error} action={() => void build()} actionLabel="Retry plan" /> : null}
    {!result && !loading && !error ? <p className="plan-empty">Choose a focus, then build a proposed schedule. Nothing is saved from this React preview.</p> : null}
    {loading ? <div className="loading-state" role="status"><span /><p>Maya is checking safety, constraints and display validation…</p></div> : null}
    {result ? <div className="connected-result">
      <h3>{result.display.title}</h3>
      <p>{result.display.summary}</p>
      {result.display.applied_constraints.length ? <div className="constraint-strip"><b>Sample context applied</b><span>{result.display.applied_constraints.join(" · ")}</span></div> : null}
      {result.schedule?.items.length ? <div className="schedule-grid">{result.schedule.items.map(item => <article key={item.schedule_item_id}><span>{item.day} · {item.start}</span><b>{item.domain}</b><p>{item.item}</p><small>{item.optional ? "Flexible" : "Proposed"} · Not saved</small></article>)}</div> : <StatusPanel tone="empty" title="No schedule was displayed" message={result.display.uncertainties.join(" ") || "Maya stopped before producing a schedule."} />}
      <small><ShieldCheck /> Proposed preview only. Save and durable Personal Mode state are unavailable here.</small>
    </div> : null}
  </section>;
}

function PregnancyComparison({
  home,
  openLibrary,
}: {
  home: HomeData;
  openLibrary: () => void;
}) {
  const preview = home.comparison_preview;
  if (preview.display_mode === "range_confirmation") {
    return <article className="baby-size empty" role="status">
      <header><span>YOUR SIZE STORY</span><button onClick={openLibrary}>EXPLORE ALL WEEKS <ArrowRight /></button></header>
      <StatusPanel
        title={`Pregnancy weeks ${preview.range_start}–${preview.range_end}`}
        message="A month gives an approximate range. Confirm an exact week before Maya shows one personalised comparison."
      />
    </article>;
  }
  if (!preview.eligible_context || preview.exact_week === null) {
    return <article className="baby-size empty" role="status">
      <header><span>YOUR SIZE STORY</span><button onClick={openLibrary}>EXPLORE ALL WEEKS <ArrowRight /></button></header>
      <StatusPanel title="Comparison unavailable" message="Confirm a supported pregnancy week to see an editorial Product Preview comparison." />
    </article>;
  }

  const item = getBabyGrowth(preview.exact_week);
  const hasComparison = preview.exact_week > 2 && Boolean(item.comparisonAsset || item.comparison);
  const article = /^[aeiou]/i.test(item.comparison) ? "an" : "a";
  const reviewLabel = item.comparisonReviewState === "product_approved_2026-09-11"
    ? "Kajal product direction · 11 Sep 2026"
    : "Product review pending for this week";
  return <article className="baby-size">
    <header><span>WEEK {preview.exact_week} · EDITORIAL PRODUCT PREVIEW</span><button onClick={openLibrary}>VIEW ALL 41 WEEKS <ArrowRight /></button></header>
    <div className="size-pair"><FetalVisual week={preview.exact_week} />{hasComparison ? <FruitVisual week={preview.exact_week} /> : null}</div>
    <h2>{hasComparison ? <>About the size of {article} <em>{item.comparison.toLowerCase()}.</em></> : <>A very early week—<em>no embryo-size comparison is shown.</em></>}</h2>
    <footer className="comparison-boundary"><span><b>Editorial comparison</b>{reviewLabel}</span><i /><span><b>Measurements hidden</b>Clinical and measurement review pending</span><p><Info /> This visual preview is not a growth assessment. Image licensing and specialist review remain pending.</p></footer>
  </article>;
}

function DocumentsPanel({ home }: { home: HomeData }) {
  return <div className="record-panel">
    {home.records.map(record => <article key={record.document_id}>
      <i><FileHeart /></i><div><span>{record.status === "fictional_sample" ? "FICTIONAL SAMPLE" : "NOT PROVIDED"}</span><h3>{record.label}</h3><p>{record.summary}</p><small>{record.provenance}</small></div>
    </article>)}
    <StatusPanel title="Real upload unavailable" message="Personal Mode private storage, scanning, extraction and confirmation must be completed before real records can be accepted." />
  </div>;
}

const pregnancyFaqs = [
  "What should I ask at my next visit?",
  "Can you explain what information is missing from my plan?",
  "Show meal options that respect my sample allergy",
  "Help me prepare a symptom timeline",
];
const postpartumFaqs = [
  "What should I ask about recovery at my next visit?",
  "Show easy nourishment options",
  "Help me prepare a feeding question",
  "Create a wellbeing support plan",
];

function ContentTabs({
  home,
  openChat,
  runFocusedPlan,
  postpartum = false,
}: {
  home: HomeData;
  openChat: (question?: string) => void;
  runFocusedPlan: (focus: Focus) => void;
  postpartum?: boolean;
}) {
  const tabs = postpartum
    ? [
        ["recovery", "Recovery"],
        ["nutrition", "Nourishment"],
        ["feeding", "Feeding"],
        ["wellbeing", "Wellbeing"],
        ["faq", "FAQs"],
        ["documents", "Care records"],
      ]
    : [
        ["health", "This week"],
        ["nutrition", "Nutrition"],
        ["movement", "Movement"],
        ["symptoms", "Symptoms"],
        ["wellbeing", "Wellbeing"],
        ["faq", "FAQs"],
        ["documents", "Care records"],
      ];
  const cardsFor = (domain: string) => home.content_cards.filter(card => card.domain === domain || (domain === "health" && card.domain === "preparation"));
  const cardAction = (card: GovernedCard) => {
    if (card.domain === "nutrition" || card.domain === "movement" || card.domain === "wellbeing") {
      runFocusedPlan(card.domain);
      return;
    }
    openChat(card.suggested_action);
  };
  const faqs = postpartum ? postpartumFaqs : pregnancyFaqs;

  return <section className="plan" id="explore">
    <Tabs defaultValue={postpartum ? "recovery" : "health"}>
      <header className="plan-nav">
        <div><span>{postpartum ? "POSTPARTUM SPACE" : home.journey_label.toUpperCase()}</span><h2>Explore your Maya space.</h2></div>
        <TabsList aria-label="Dashboard sections">{tabs.map(([value, label]) => <TabsTrigger value={value} key={value}>{label}</TabsTrigger>)}</TabsList>
      </header>
      <div className="plan-layout"><div>
        {tabs.filter(([value]) => !["faq", "documents"].includes(value)).map(([value, label], index) => <TabsContent value={value} key={value}>
          <Intro n={String(index + 1).padStart(2, "0")} title={label} text="The full product section stays visible while unreleased health content remains safely gated." />
          <GovernedCards cards={cardsFor(value)} action={cardAction} />
        </TabsContent>)}
        <TabsContent value="faq"><Intro n="FAQ" title="Questions are part of care." text="Choose a question to send the displayed words through Maya’s safety, retrieval and validation path." /><div className="faqs">{faqs.map((question, index) => <button onClick={() => openChat(question)} key={question}><span>{String(index + 1).padStart(2, "0")}</span>{question}<ChevronRight /></button>)}</div></TabsContent>
        <TabsContent value="documents"><Intro n="DOCS" title="Keep context visible." text="Care-record state is explicit. Missing information is never changed into “none.”" /><DocumentsPanel home={home} /></TabsContent>
      </div>
      <aside>
        <article className="ask-card"><header><span><i><Flower2 /></i> ASK MAYA</span><button onClick={() => openChat()} aria-label="Open Ask Maya"><MoveUpRight /></button></header><div className="maya-signal"><i /><i /><i /><span><Sparkles /></span></div><h3>What’s on your mind?</h3><p className="maya-description">Ask in your own words. Maya keeps your selected sample timeline and constraints in context.</p><p className="prompt-label">You could ask:</p><div className="quick-prompts">{faqs.slice(0, 3).map(question => <button key={question} onClick={() => openChat(question)}>{question}<ChevronRight /></button>)}</div><button className="open-maya" onClick={() => openChat()}>Talk with Maya <ArrowRight /></button></article>
        <article className="documents"><div><i><FileHeart /></i><p><b>Care records</b>{home.kpis.care_records ? "1 fictional sample record" : "Not provided"}</p></div></article>
        <article className="dos"><div className="dos-grid"><section><b className="do-title">AVAILABLE</b><p>Ask general questions</p><p>Build proposed plans</p><p>Review sample context</p></section><section><b className="dont-title">NOT YET</b><p>Real record upload</p><p>Durable React saving</p><p>Clinical approval</p></section></div></article>
      </aside></div>
    </Tabs>
    <PreviewFooter />
  </section>;
}

export function PregnancyDashboard({
  home,
  openChat,
  goHome,
  openLibrary,
  runPlan,
}: {
  home: HomeData;
  openChat: (question?: string) => void;
  goHome: () => void;
  openLibrary: () => void;
  runPlan: (focus: Focus) => Promise<PlanResponse>;
}) {
  const week = home.journey.exact;
  const rangeLabel = home.journey.range_start ? `${home.journey.range_start}–${home.journey.range_end}` : "—";
  const trimester = week ? (week < 14 ? "first" : week < 28 ? "second" : "third") : "approximate";
  const [requestedFocus, setRequestedFocus] = useState<Focus>("balanced");
  const focusPlan = (focus: Focus) => {
    setRequestedFocus(focus);
    document.getElementById("plan-builder")?.scrollIntoView({ behavior: "smooth" });
  };

  return <main className="dashboard">
    <header className="dash-nav"><Brand onClick={goHome} /><div><button className="emergency-route" onClick={() => openChat("I need urgent help")}><ShieldCheck /> Get urgent help</button>{home.name ? <button className="profile" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} aria-label="Open your sample context"><i>{home.name[0]}</i><b>{home.name}</b></button> : null}<button className="mobile-menu" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} aria-label="Open dashboard sections"><Menu /></button></div></header>
    <section className="welcome"><div><span>{home.journey_label.toUpperCase()}</span><h1>{home.name ? `Welcome, ${home.name}.` : "Welcome to your Maya."}</h1><p>Your sample timeline, preferences and questions—brought into one calm view.</p></div><button onClick={goHome}>About Maya <MoveUpRight /></button></section>
    <section className="metrics">
      <article className="metric-card week-kpi"><header><i><Baby /></i></header><span>YOUR TIMELINE</span><div><b>{week ?? rangeLabel}</b><p>{week ? "weeks" : "week range"}</p></div><small><b>{week ? `${trimester} trimester` : "Approximate month"}</b><span>{week ? `${Math.max(0, 40 - week)} weeks to week 40` : "Confirm an exact week for one comparison"}</span></small></article>
      <article className="metric-card appointment"><header><i><CalendarDays /></i></header><span>NEXT APPOINTMENT</span><div><b>{home.kpis.upcoming_appointment ? "Sample" : "—"}</b><p>{home.kpis.upcoming_appointment || "Not provided"}</p></div><small><b>{home.kpis.upcoming_appointment ? "Fictional record" : "No record added"}</b><span>{home.kpis.upcoming_appointment ? "Not a real appointment" : "You can continue without one"}</span></small></article>
      <article className="metric-card calm-kpi"><header><i><Heart /></i></header><span>WELLBEING</span><div><b>—</b><p>not logged</p></div><small><b>Check-in available</b><span>Ask Maya when you want to</span></small></article>
      <article className="rhythm-kpi"><span>YOUR SAMPLE CONTEXT</span><div className="rhythm-list"><p><i className={home.confirmed_context.diets.length ? "done" : ""}><Check /></i>{contextText(home.confirmed_context.diets, "Diet not provided")}</p><p><i className={home.confirmed_context.allergies.length ? "done" : ""}><Check /></i>{contextText(home.confirmed_context.allergies, "Allergies not provided")}</p><p><i className={home.confirmed_context.symptoms.length ? "done" : ""}><Check /></i>{contextText(home.confirmed_context.symptoms, "Symptoms not provided")}</p></div></article>
    </section>
    <section className="growth">
      <article className="trimester"><header><div><span>YOUR JOURNEY</span><h2>{week ? `The ${trimester} trimester` : "An approximate pregnancy range"}</h2></div><i><Baby /></i></header><div className="journey-track"><span>First</span><span>Second</span><span>Third</span><i style={{ width: `${week ? Math.min(100, (week / 40) * 100) : 0}%` }} /></div><p>{week ? `Maya is using exact pregnancy week ${week}.` : `Maya has kept your month as weeks ${rangeLabel}; it has not guessed a single week.`}</p></article>
      <PregnancyComparison home={home} openLibrary={openLibrary} />
    </section>
    <ConnectedPlan key={requestedFocus} runPlan={runPlan} initialFocus={requestedFocus} />
    <ContentTabs home={home} openChat={openChat} runFocusedPlan={focusPlan} />
    <button className="floating-chat" onClick={() => openChat()}><i><Flower2 /></i><span><b>Ask Maya</b><small>Here with you</small></span></button>
  </main>;
}

export function PostpartumDashboard({
  home,
  openChat,
  goHome,
  runPlan,
}: {
  home: HomeData;
  openChat: (question?: string) => void;
  goHome: () => void;
  runPlan: (focus: Focus) => Promise<PlanResponse>;
}) {
  const [requestedFocus, setRequestedFocus] = useState<Focus>("balanced");
  const focusPlan = (focus: Focus) => {
    setRequestedFocus(focus);
    document.getElementById("plan-builder")?.scrollIntoView({ behavior: "smooth" });
  };
  return <main className="dashboard postpartum">
    <header className="dash-nav"><Brand onClick={goHome} /><div><button className="emergency-route" onClick={() => openChat("I need urgent help")}><ShieldCheck /> Get urgent help</button>{home.name ? <button className="profile" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} aria-label="Open your sample context"><i>{home.name[0]}</i><b>{home.name}</b></button> : null}<button className="mobile-menu" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} aria-label="Open dashboard sections"><Menu /></button></div></header>
    <section className="welcome"><div><span>YOUR POSTPARTUM SPACE</span><h1>{home.name ? `Welcome, ${home.name}.` : "Welcome to your Maya."}</h1><p>Recovery, nourishment, feeding and wellbeing in one calm view.</p></div><button onClick={goHome}>About Maya <MoveUpRight /></button></section>
    <section className="metrics postpartum-metrics">
      <article className="blush"><span>RECOVERY WEEK</span><div><b>{home.journey.exact ?? "—"}</b><p>weeks<br />postpartum</p></div><small><Heart />Resolved from the sample date entered</small><em /></article>
      <article><span>FEEDING RHYTHM</span><div><b>—</b><p>not<br />provided</p></div><small><Baby />Maya will not invent missing data</small></article>
      <article><span>WELLBEING</span><div><b>—</b><p>not<br />logged</p></div><small><MoonStar />Check in only when you want to</small></article>
    </section>
    <section className="postpartum-overview">
      <article className="recovery-card"><header><div><span>YOUR RECOVERY</span><h2>Your pace stays visible.</h2></div><i><Flower2 /></i></header><div className="recovery-line"><span className="active"><b>Now</b><small>Current sample stage</small></span><span><b>Next</b><small>Guidance gated by review</small></span><span><b>Follow-up</b><small>Ask when needed</small></span></div><p><Sparkles /><span><b>Product Preview</b>Reviewed recovery guidance will appear here when eligible.</span></p></article>
      <article className="baby-rhythm"><header><span>BABY’S RHYTHM</span><i><Baby /></i></header><h2>Patterns can be added<br /><em>when you choose.</em></h2><div><span><SunMedium /><b>Feeding</b><small>Not provided</small></span><span><MoonStar /><b>Sleep</b><small>Not provided</small></span></div></article>
    </section>
    <ConnectedPlan key={requestedFocus} runPlan={runPlan} initialFocus={requestedFocus} />
    <ContentTabs home={home} openChat={openChat} runFocusedPlan={focusPlan} postpartum />
    <button className="floating-chat" onClick={() => openChat()}><i><Flower2 /></i><span><b>Ask Maya</b><small>Here with you</small></span></button>
  </main>;
}

export function WeekLibrary({
  selectedWeek,
  back,
  home,
}: {
  selectedWeek: number | null;
  back: () => void;
  home: HomeData;
}) {
  const [activeWeek, setActiveWeek] = useState(selectedWeek || 22);
  const active = getBabyGrowth(activeWeek);
  const hasComparison = activeWeek > 2 && Boolean(active.comparison);
  const approval = home.comparison_preview;
  const weeks = useMemo(() => Array.from({ length: 41 }, (_, index) => getBabyGrowth(index + 1)), []);

  return <main className="week-library">
    <header><button onClick={back}><ArrowLeft /> Back to dashboard</button><Brand onClick={back} /><span>EDITORIAL PRODUCT PREVIEW</span></header>
    <section className="library-hero"><div><span>WEEK BY WEEK</span><h1>One little story,<br /><em>growing with you.</em></h1><p>Explore all 41 editorial comparison records. These are design-preview elements; measurements are hidden and specialist/licence reviews remain pending.</p><div className="approval-note"><ShieldCheck /><p><b>Product direction recorded</b>Kajal · product/content capacity · 11 September 2026<br /><small>Catalogue v{approval.catalogue_version} · {approval.catalogue_sha256.slice(0, 12)}…</small></p></div></div><article><div className="library-pair"><FetalVisual week={activeWeek} />{hasComparison ? <FruitVisual week={activeWeek} /> : null}</div><span>WEEK {activeWeek}</span><h2>{hasComparison ? <>About the size of <em>{active.comparison.toLowerCase()}</em></> : "No embryo-size comparison shown"}</h2><p className="stage-copy">{activeWeek <= 2 ? "Pregnancy dating begins before an embryo-size illustration is appropriate." : active.comparisonReviewState === "product_approved_2026-09-11" ? "Product-reviewed editorial direction; not clinical guidance." : "Editorial record awaiting product review."}</p><div className="library-measures hidden-measures"><p><small>MEASUREMENTS</small><b>Hidden pending verification</b></p><p><small>IMAGE LICENCE</small><b>Pending</b></p></div><footer><Info /> This comparison is not a diagnosis or assessment of fetal growth.</footer></article></section>
    <section className="library-grid-section"><header><div><span>THE COMPLETE LIBRARY</span><h2>Weeks 1–41</h2></div><p>Rounded and intentionally repeated later-week objects preserve the recorded product direction.</p></header><div className="library-grid">{weeks.map(item => {
      const available = item.week > 2;
      return <button key={item.week} className={activeWeek === item.week ? "active" : ""} onClick={() => { setActiveWeek(item.week); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Open week ${item.week} editorial preview`}><div><FetalVisual week={item.week} compact />{available ? <FruitVisual week={item.week} compact /> : null}</div><span>WEEK {item.week}</span><h3>{available ? item.comparison : "Earliest beginning"}</h3><p>{item.comparisonReviewState === "product_approved_2026-09-11" ? "Product reviewed" : "Product review pending"}<i /> measurements hidden</p></button>;
    })}</div></section>
    <p className="library-note"><ShieldCheck /> Product approval does not imply clinical, India-localisation, measurement or licence approval. All 41 records remain outside public health guidance.</p>
  </main>;
}

function Intro({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className="plan-intro"><span>{n} / EXPLORE</span><h2>{title}</h2><p>{text}</p></div>;
}
