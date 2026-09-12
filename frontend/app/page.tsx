"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowLeft, ArrowRight, Baby, CalendarDays, Check, ChevronDown, ChevronRight,
  FileHeart, Flower2, Heart, Info, Menu, MessageCircle, MoonStar, MoveUpRight,
  Paperclip, Plus, Salad, Send, ShieldCheck, Sparkles, SunMedium,
  Utensils, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBabyGrowth } from "./baby-growth-library";
import { mayaApi, type HomeData, type MayaDisplay, type OnboardingPayload, type PlanResponse } from "@/lib/maya-api";

type View = "landing" | "onboarding" | "dashboard" | "chat" | "library";
const diets = ["Vegetarian", "Egg-friendly", "Dairy-free", "Gluten-free"];
const symptoms = ["Back ache", "Heartburn", "Low energy", "Trouble sleeping"];
const allergies = ["Nuts", "Dairy", "Soy", "Gluten"];
function FetalVisual({ week, compact = false }: { week: number; compact?: boolean }) {
  const data=getBabyGrowth(week);
  const displayScale=compact ? data.visualScale : Math.min(1.18,data.visualScale*2.1);
  return <span className={`fetal-visual ${compact ? "compact" : ""}`} aria-label={`Gentle educational illustration for pregnancy week ${week}`} style={{"--growth-scale":displayScale} as CSSProperties}>
    {data.babyAsset ? <img src={data.babyAsset} alt=""/> : <span className="pre-stage"><i/><i/><i/></span>}
  </span>;
}

function FruitVisual({ week, compact = false }: { week: number; compact?: boolean }) {
  const data=getBabyGrowth(week);
  const displayScale=compact ? data.visualScale : Math.min(1.18,data.visualScale*2.1);
  return <span className={`fruit-visual ${compact ? "compact" : ""} ${data.comparisonAsset ? "" : "waiting"}`} aria-label={data.comparison} style={{"--growth-scale":displayScale} as CSSProperties}>{data.comparisonAsset ? <img src={data.comparisonAsset} alt={data.comparison}/> : <i/>}</span>;
}
const plan = {
  health: [
    [Heart, "Body check-in", "Your energy may dip a little", "Make space for two short recovery pauses today. Even ten quiet minutes count.", "rose"],
    [CalendarDays, "Coming up", "Glucose screening window", "Weeks 24–28 are a common screening window. Your care team will guide your timing.", "yellow"],
    [MoonStar, "Tonight", "Side-sleeping support", "A pillow between your knees can ease hip and lower-back pressure.", "violet"],
  ],
  nutrition: [
    [Salad, "Focus nutrient", "Pair iron with vitamin C", "Try lentils with tomatoes or spinach with lemon to support absorption.", "green"],
    [Utensils, "Easy plate", "Build a steadier lunch", "Fill half your plate with vegetables, then add whole grains and a protein you enjoy.", "yellow"],
    [SunMedium, "Gentle reminder", "Sip before you feel thirsty", "Keep water within reach and take a few sips whenever you change activities.", "rose"],
  ],
  movement: [
    [Activity, "12 minutes", "Low-impact mobility flow", "Cat-cow, supported squats and gentle hip circles—stop if anything feels uncomfortable.", "green"],
    [Heart, "Your pace", "A conversational walk", "A pace where you can still speak comfortably is a simple guide for moderate effort.", "rose"],
    [MoonStar, "Wind down", "Release shoulder tension", "Three slow shoulder rolls in each direction can soften desk-day stiffness.", "violet"],
  ],
  symptoms: [
    [Activity, "Common this week", "Round ligament discomfort", "Move slowly when standing or turning. Call your care team for severe or persistent pain.", "rose"],
    [MoonStar, "Relief idea", "For nighttime heartburn", "Try an earlier, lighter dinner and stay upright for a while after eating.", "violet"],
    [ShieldCheck, "Know the signs", "When to reach out", "Call your care team for bleeding, fluid leakage, severe headache, or reduced movement.", "yellow"],
  ],
  wellbeing: [
    [Heart, "One-minute reset", "Name what you need", "Complete: “Today would feel softer if I…” then choose the smallest next step.", "rose"],
    [Sparkles, "Connection", "Let someone in", "Share one specific thing a partner, friend or family member can take off your plate.", "yellow"],
    [MoonStar, "Reflection", "Your feelings can be mixed", "Excitement and worry can sit together. Neither makes you less ready or loving.", "violet"],
  ],
} as const;

const postpartumPlan = {
  recovery: [
    [Heart, "Body care", "A gentler recovery check", "Notice tenderness, bleeding, hydration and how supported your body feels today.", "rose"],
    [MoonStar, "Rest window", "Protect one quiet pocket", "A short supported rest can still be restorative even when sleep comes in fragments.", "violet"],
    [ShieldCheck, "Care signal", "Know when to call", "Reach your care team for heavy bleeding, fever, chest pain, severe headache or worrying low mood.", "yellow"],
  ],
  nourishment: [
    [Salad, "Recovery fuel", "Keep easy nourishment close", "Pair protein, whole grains and produce in combinations that are easy to reach and enjoy.", "green"],
    [SunMedium, "Hydration", "Sip with every feed", "Linking water to an existing rhythm can make hydration feel less like another task.", "yellow"],
    [Utensils, "Support", "Let someone feed you, too", "Keep a small list of meals others can make or bring without needing more decisions from you.", "rose"],
  ],
  feeding: [
    [Baby, "Baby’s cues", "Watch the baby, not the clock", "Early rooting, hand-to-mouth movement and restlessness can be useful hunger cues.", "rose"],
    [Heart, "Your comfort", "Feeding should not stay painful", "Persistent pain deserves skilled support from your midwife, doctor or lactation professional.", "green"],
    [MoonStar, "Night rhythm", "Prepare one calm station", "Water, a snack, burp cloth and soft light can reduce friction during night feeds.", "violet"],
  ],
  wellbeing: plan.wellbeing,
} as const;

function Brand({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  return <button className={`brand ${light ? "light" : ""}`} onClick={onClick} aria-label="Maya home"><i><Flower2 /></i><b>maya</b></button>;
}

function Landing({ start, preview, chat }: { start: () => void; preview: () => void; chat: () => void }) {
  return <main className="landing">
    <nav className="landing-nav"><Brand /><button className="landing-maya" onClick={chat}><MessageCircle/><b>Ask Maya</b></button></nav>
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker"><Sparkles /> Thoughtful care, week by week</span>
        <h1><span>Feel held through</span><span>every <em>little change.</em></span></h1>
        <p>Maya brings your body, baby and wellbeing into one calm rhythm—personalised to your week, your preferences and your real life.</p>
        <div className="hero-actions"><Button onClick={start}>Begin my journey <ArrowRight /></Button></div>
        <div className="trust"><div><span>K</span><span>A</span></div><p><b>Designed for the in-between moments</b><small>Guidance, never judgement.</small></p></div>
      </div>
      <div className="hero-art">
        <div className="orbital o1"><span/><span/><span/><span/><span/></div><div className="orbital o2"><span/><span/><span/></div>
        <div className="orbit-center"><Flower2/><span>care around you</span></div>
        <div className="orbit-tab tab-a"><Heart /><p><b>One gentle focus</b>Rest before you need it.</p></div>
        <div className="orbit-tab tab-b"><Baby /><p><b>Baby is listening</b>Voices may feel familiar.</p></div>
        <div className="orbit-tab tab-c"><Salad /><p><b>Nourishment</b>Made for your preferences.</p></div>
        <div className="orbit-tab tab-d"><MessageCircle /><p><b>Ask Maya</b>A calm answer, when needed.</p></div>
      </div>
    </section>
    <section className="inside" id="inside"><p>A companion for</p><div><span><Heart /> wellbeing</span><span><Salad /> nourishment</span><span><Activity /> movement</span><span><MessageCircle /> questions</span></div></section>
    <section className="care" id="care"><div><span>01 / YOUR RHYTHM</span><h2>Less information.<br /><em>More relevance.</em></h2></div><div><p>Maya turns your stage, symptoms and preferences into one considered weekly plan. No endless feed. No pressure to do everything.</p><button className="sample-link" onClick={preview}>Explore a sample week <MoveUpRight /></button></div></section>
  </main>;
}

function Onboarding({ back, done }: { back: () => void; done: (payload: OnboardingPayload) => Promise<void> }) {
  const [step, setStep] = useState(0); const [name, setName] = useState(""); const [journey, setJourney] = useState<"pregnant" | "postpartum">("pregnant");
  const [timelineMode, setTimelineMode] = useState<"due" | "week" | "month">("week"); const [timelineValue, setTimelineValue] = useState("");
  const [diet, setDiet] = useState<string[]>([]); const [feeling, setFeeling] = useState<string[]>([]); const [allergy, setAllergy] = useState<string[]>([]); const [otherAllergy, setOtherAllergy] = useState(""); const [useSampleRecord, setUseSampleRecord] = useState(false); const [submitting,setSubmitting]=useState(false); const [submitError,setSubmitError]=useState(""); const [todayMs]=useState(()=>Date.now());
  const titles = ["Let’s start with you", "Where are you in your journey?", "Your little timeline", "Make Maya feel like yours", "Keep your care close"];
  const toggle = (item: string, list: string[], set: (x: string[]) => void) => set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  const timelineWeek = (() => {
    if (journey === "postpartum" || !timelineValue) return null;
    if (timelineMode === "week") return Math.max(1, Math.min(41, Math.round(Number(timelineValue))));
    if (timelineMode === "month") return Math.max(1, Math.min(40, Math.round(Number(timelineValue) * 4.345)));
    const due = new Date(`${timelineValue}T12:00:00`); if (Number.isNaN(due.getTime())) return null;
    return Math.max(1, Math.min(42, 40 - Math.ceil((due.getTime() - todayMs) / 604800000)));
  })();
  const submit=async()=>{if(!timelineValue){setSubmitError("Please add your week, month, due date, or birth date so Maya can resolve your timeline safely.");return;}setSubmitting(true);setSubmitError("");try{await done({name:name.trim(),journey,timeline_mode:journey==="postpartum"?"birth_date":timelineMode,timeline_value:timelineValue,diets:diet,allergies:[...allergy,...(otherAllergy.trim()?[otherAllergy.trim()]:[])],symptoms:feeling,use_fictional_sample_record:useSampleRecord});}catch(error){setSubmitError(error instanceof Error?error.message:"Maya could not complete onboarding.");}finally{setSubmitting(false)}};
  const trimester = timelineWeek ? (timelineWeek < 14 ? "first" : timelineWeek < 28 ? "second" : "third") : null;
  return <main className="onboarding">
    <aside><Brand light onClick={back} /><div className="aside-copy"><span>YOUR SPACE, YOUR PACE</span><h2>Care should feel<br /><em>personal.</em></h2><p>A few details help Maya surface what matters now—and quietly leave the rest aside.</p></div><div className="flower"><i /><i /><i /><i /><span /></div><p className="private"><ShieldCheck /> Your details stay private to your Maya space.</p></aside>
    <section className="onboard-main"><header><button onClick={step ? () => setStep(step - 1) : back}><ArrowLeft /> Back</button><div className="onboard-meta"><span className="demo-badge">CONTROLLED DEMO</span><span>0{step + 1} <i /> 05</span></div></header><Progress value={(step + 1) * 20} />
      <div className="onboard-content" key={step}><span>A little about you</span><h1>{titles[step]}</h1>
        {step === 0 && <div className="field"><label htmlFor="name">What should we call you?</label><Input id="name" value={name} onChange={e => setName(e.target.value)} autoFocus /><p>We’ll use this to make your space feel a little warmer.</p></div>}
        {step === 1 && <RadioGroup value={journey} onValueChange={value => setJourney(value as "pregnant" | "postpartum")} className="journey-list">
          {[{v:"pregnant",icon:Baby,t:"I’m pregnant",d:"Follow baby’s growth and your changing body."},{v:"postpartum",icon:Heart,t:"I’m postpartum",d:"Support for recovery, feeding and your wellbeing."}].map(({v,icon:Icon,t,d}) => <label key={v} className={journey === v ? "selected" : ""}><RadioGroupItem value={v}/><i><Icon /></i><p><b>{t}</b><small>{d}</small></p><Check /></label>)}
        </RadioGroup>}
        {step === 2 && <div className="timeline-field">{journey === "postpartum" ? <><label htmlFor="birth-date">When was your baby born?</label><Input id="birth-date" type="date" value={timelineValue} onChange={e=>setTimelineValue(e.target.value)}/>{timelineValue && <article className="timeline-reveal"><div className="date-ring recovery-ring"><span><Heart/><small>your pace</small></span></div><div><span>YOUR RECOVERY RHYTHM</span><h3>Support that changes with you.</h3><p>We’ll shape gentle recovery, feeding and rest guidance around your real days.</p></div></article>}</> : <><label>How would you like to add your timeline?</label><div className="timeline-modes">{([['week','Current week'],['month','Current month'],['due','Due date']] as const).map(([value,label])=><button key={value} className={timelineMode===value?'active':''} onClick={()=>{setTimelineMode(value);setTimelineValue('')}}>{label}</button>)}</div><Input aria-label={timelineMode === "due" ? "Estimated due date" : timelineMode === "week" ? "Current pregnancy week" : "Current pregnancy month"} type={timelineMode === "due" ? "date" : "number"} min="1" max={timelineMode === "week" ? "41" : "9"} placeholder={timelineMode === "week" ? "e.g. 26" : timelineMode === "month" ? "e.g. 6" : undefined} value={timelineValue} onChange={e=>setTimelineValue(e.target.value)}/>{timelineWeek && <article className="timeline-reveal"><div className="date-ring" style={{"--timeline-progress":`${Math.min(100,Math.round((timelineWeek/40)*100))}%`} as CSSProperties}><span><b>{timelineWeek}</b><small>weeks</small></span></div><div><span>HELLO, {trimester?.toUpperCase()} TRIMESTER</span><h3>Your Maya now knows where to begin.</h3><p>You’re around {Math.min(100,Math.round((timelineWeek/40)*100))}% of the way there. We’ll shape your dashboard around week {timelineWeek}.</p></div></article>}</>}</div>}
        {step === 3 && <div className="preferences"><div><label>Food preferences</label><div className="chips">{diets.map(x => <label key={x} className={diet.includes(x) ? "selected" : ""}><Checkbox checked={diet.includes(x)} onCheckedChange={() => toggle(x,diet,setDiet)}/>{x}</label>)}</div></div><div><label>Food allergies or ingredients to avoid</label><div className="chips">{allergies.map(x => <label key={x} className={allergy.includes(x) ? "selected" : ""}><Checkbox checked={allergy.includes(x)} onCheckedChange={() => toggle(x,allergy,setAllergy)}/>{x}</label>)}</div><Input aria-label="Other allergy" value={otherAllergy} onChange={e=>setOtherAllergy(e.target.value)} placeholder="Add another allergy (optional)" /></div><div><label>Symptoms you’re noticing</label><div className="chips">{symptoms.map(x => <label key={x} className={feeling.includes(x) ? "selected" : ""}><Checkbox checked={feeling.includes(x)} onCheckedChange={() => toggle(x,feeling,setFeeling)}/>{x}</label>)}</div></div></div>}
        {step === 4 && <div className="upload"><button className={useSampleRecord?"selected":""} onClick={()=>setUseSampleRecord(value=>!value)}><i><FileHeart /></i><b>Use the fictional sample care record</b><small>Includes one sample appointment and one record-only supplement.</small><em>{useSampleRecord?<><Check/> Added</>:<><Plus/> Add sample</>}</em></button><p><ShieldCheck /> Real medical-file upload is intentionally disabled in this demo. The production upload path requires authenticated private storage, scanning, extraction, and your confirmation.</p></div>}
        {submitError&&<p className="integration-error" role="alert">{submitError}</p>}
      </div>
      <footer><button className="skip-step" onClick={() => step < 4 && setStep(step + 1)} disabled={step===4||submitting}>{step===4?"Timeline required":"Skip this step"}</button><Button disabled={submitting} onClick={() => step === 4 ? void submit() : setStep(step + 1)}>{submitting?"Connecting…":step === 4 ? "Open my Maya" : "Continue"} <ArrowRight /></Button></footer>
    </section>
  </main>;
}

function Cards({ items }: { items: readonly (readonly [LucideIcon,string,string,string,string])[] }) {
  return <div className="plan-cards">{items.map(([Icon,kicker,title,text,tone]) => { const iron=title.includes("iron"); const rest=title.includes("sleep")||title.includes("Side")||title.includes("rest"); return <Collapsible asChild key={title}><article className={tone}><i><Icon /></i><div><span>{kicker}</span><h3>{title}</h3><p>{text}</p><CollapsibleTrigger>Explore this further <ChevronDown /></CollapsibleTrigger><CollapsibleContent><div className="reason"><section><b>Why it may help</b><p>{iron ? "Iron supports red-blood-cell production as blood volume expands during pregnancy; vitamin C can help your body absorb plant-based iron." : rest ? "Supported rest can ease physical load and make it easier to respond to your body before discomfort builds." : "Small, repeatable actions can support comfort without turning care into another demanding checklist."}</p></section><section><b>A gentle way to try it</b><ul><li>Choose the smallest version that feels realistic today.</li><li>Notice comfort, energy or symptoms rather than aiming for perfection.</li></ul></section><p className="reason-note"><ShieldCheck/> General guidance only—adapt it with your clinician if you have symptoms or a care plan.</p></div></CollapsibleContent></div></article></Collapsible>})}</div>;
}

function ConnectedPlan({ sessionId }: { sessionId: string }) {
  const [result,setResult]=useState<PlanResponse|null>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const build=async()=>{setLoading(true);setError("");try{setResult(await mayaApi.plan(sessionId));}catch(reason){setError(reason instanceof Error?reason.message:"The plan could not be created.");}finally{setLoading(false)}};
  return <section className="connected-plan"><header><div><span>CONNECTED AGENT FLOW · CONTROLLED DEMO</span><h2>Your plan, assembled through Maya’s safety and validation gates.</h2></div><Button onClick={()=>void build()} disabled={loading}>{loading?"Building…":result?"Rebuild plan":"Build my connected week"}<Sparkles/></Button></header>{error&&<p className="integration-error" role="alert">{error}</p>}{result&&<div className="connected-result"><h3>{result.display.title}</h3><p>{result.display.summary}</p>{result.schedule?.items.length?<div className="schedule-grid">{result.schedule.items.map(item=><article key={item.schedule_item_id}><span>{item.day} · {item.start}</span><b>{item.domain}</b><p>{item.item}</p></article>)}</div>:<p>Maya stopped safely before producing a schedule. {result.display.uncertainties.join(" ")}</p>}<small><ShieldCheck/> Fictional controlled evidence · proposed plan only · no clinical diagnosis or persistent write.</small></div>}</section>;
}

function Dashboard({ name, week, chat, home, library, sessionId, homeData }: { name: string; week: number | null; chat: () => void; home: () => void; library: () => void; sessionId: string; homeData: HomeData | null }) {
  const progress = week ? Math.min(100, Math.round((week / 40) * 100)) : 0;
  const trimesterName = week ? (week < 14 ? "first" : week < 28 ? "second" : "third") : null;
  const growthData = week ? getBabyGrowth(week) : null;
  const comparison = growthData?.comparison ?? null;
  const hasComparison = Boolean(comparison && !comparison.startsWith("No embryo"));
  const comparisonArticle = comparison && /^[aeiou]/i.test(comparison) ? "an" : "a";
  return <main className="dashboard">
    <header className="dash-nav"><Brand onClick={home}/><div>{name && <button className="profile"><i>{name[0]}</i><b>{name}</b></button>}<button className="mobile-menu"><Menu /></button></div></header>
    <section className="welcome" aria-hidden="true" />
    <section className="metrics">
      <article className="metric-card week-kpi"><header><i><Baby/></i></header><span>YOUR WEEK</span><div><b>{week ?? "—"}</b><p>{week ? "of 40" : "add timeline"}</p></div><small>{week ? <><b>{trimesterName} trimester</b><span>{40-week} weeks to meet baby</span></> : <><b>Timeline pending</b><span>Personalise when ready</span></>}</small></article>
      <article className="metric-card appointment"><header><i><CalendarDays/></i></header><span>NEXT APPOINTMENT</span><div><b>{homeData?.kpis.upcoming_appointment?"Demo":"—"}</b><p>{homeData?.kpis.upcoming_appointment||"Not added"}</p></div><small><b>{homeData?.kpis.upcoming_appointment?"Fictional sample":"Your record"}</b><span>{homeData?.kpis.upcoming_appointment?"Not a real appointment":"Add after secure upload is enabled"}</span></small></article>
      <article className="metric-card calm-kpi"><header><i><Heart/></i></header><span>WELLBEING</span><div><b>—</b><p>not logged</p></div><small><b>Check-in pending</b><span>Maya will not invent your mood</span></small></article>
      <article className="rhythm-kpi"><span>CONFIRMED CONTEXT</span><div className="rhythm-list"><p><i className="done"><Check/></i>{homeData?.confirmed_context.diets.join(", ")||"No diet preference"}</p><p><i className={homeData?.confirmed_context.allergies.length?"done":""}><Check/></i>{homeData?.confirmed_context.allergies.join(", ")||"No allergy recorded"}</p><p><i className={homeData?.confirmed_context.symptoms.length?"done":""}><Check/></i>{homeData?.confirmed_context.symptoms.join(", ")||"No symptom recorded"}</p></div></article>
    </section>
    <section className="growth">
      <article className="trimester"><header><div><span>YOUR JOURNEY</span><h2>Growing, one week at a time</h2></div></header><div className={`track ${week ? "" : "empty"}`}><div><span><b>First trimester</b><small>Weeks 1–13</small></span><span><b>Second trimester</b><small>Weeks 14–27</small></span><span><b>Third trimester</b><small>Weeks 28–40</small></span></div><section><i style={{width:`${progress}%`}}/>{week && <b style={{left:`${progress}%`}}><span>YOU ARE HERE</span>{week}</b>}</section><footer>{Array.from({length:40},(_,i)=><i key={i} className={week && i<week?"past":week && i===week?"now":""}/>)}</footer></div><div className="trimester-note"><i><Sparkles/></i><p>{week ? <><b>{trimesterName === "second" && week >= 24 ? "Almost in your third trimester" : `Your ${trimesterName} trimester`}</b>Your plan below is tuned to the stage and symptoms you shared.</> : <><b>Your timeline starts with you</b>Choose a due date, week or month during setup to reveal your personalised journey.</>}</p></div></article>
      <article className={`baby-size ${week ? "" : "empty"}`}><header><span>{week ? `WEEK ${week}` : "YOUR SIZE STORY"}</span><button onClick={library}>VIEW ALL WEEKS <ArrowRight/></button></header>{week ? <div className="size-pair"><FetalVisual week={week}/><FruitVisual week={week}/></div> : <div className="size-placeholder"><Baby/><h2>Your comparison appears here.</h2></div>}<h2>{week ? hasComparison ? <>Baby is about the size of {comparisonArticle} <em>{comparison?.toLowerCase()}.</em></> : <>A tiny beginning—<em>no size comparison yet.</em></> : <>A gentle look at <em>baby’s growth.</em></>}</h2><footer>{growthData ? <><span><b>{growthData.length}</b> estimated length</span><i/><span><b>{growthData.weight}</b> estimated weight</span><p><Info/> Measurements can vary. Your clinician’s scan is your best personal reference.</p></> : <span>Your comparison updates with your timeline.</span>}</footer></article>
    </section>
    <ConnectedPlan sessionId={sessionId}/><section className="plan" id="plan"><Tabs defaultValue="health"><header className="plan-nav"><div><span>{week ? `WEEK ${week} EDITORIAL PREVIEW` : "EDITORIAL PREVIEW"}</span><h2>Explore the dashboard content structure.</h2></div><TabsList>{["health","nutrition","movement","symptoms","wellbeing","faq"].map((x,i)=><TabsTrigger value={x} key={x}>{["Health","Nutrition","Movement","Symptoms","Self love","FAQs"][i]}</TabsTrigger>)}</TabsList></header><div className="plan-layout"><div>
      <TabsContent value="health"><Intro n="01" title="Listen in, don’t power through." text="Your body is doing extraordinary work. Notice early cues and choose the kinder response."/><Cards items={plan.health}/></TabsContent>
      <TabsContent value="nutrition"><Intro n="02" title="Nourishment without the noise." text="Flexible ideas shaped around your vegetarian preference and this week’s changing needs."/><Cards items={plan.nutrition}/></TabsContent>
      <TabsContent value="movement"><Intro n="03" title="Move to feel more like you." text="Low-pressure movement for circulation, comfort and a little more ease in your day."/><Cards items={plan.movement}/></TabsContent>
      <TabsContent value="symptoms"><Intro n="04" title="What’s common—and what helps." text="Context for the changes you noted, with clear signals for when to call your care team."/><Cards items={plan.symptoms}/></TabsContent>
      <TabsContent value="wellbeing"><Intro n="05" title="Your inner weather matters, too." text="Small emotional check-ins for days that hold joy, uncertainty and everything between."/><Cards items={plan.wellbeing}/></TabsContent>
      <TabsContent value="faq"><Intro n="06" title="Questions are part of care." text={`Clear starting points for the things many parents wonder about${week ? ` in week ${week}` : " along the way"}.`}/><div className="faqs">{["How much movement should I notice?","Is lower back pain normal now?","Can I keep travelling?","What should I ask at my next visit?"].map((x,i)=><button key={x}><span>0{i+1}</span>{x}<Plus/></button>)}</div></TabsContent>
    </div><aside><article className="ask-card"><header><span><i><Flower2/></i> ASK MAYA</span><button onClick={chat}><MoveUpRight/></button></header><div className="maya-signal"><i/><i/><i/><span><Sparkles/></span></div><h3>What’s on your mind?</h3><p className="maya-description">A symptom, a meal idea, or simply a worry—ask in your own words, whenever you need a calm place to begin.</p><p className="prompt-label">You could ask:</p><div className="quick-prompts">{["Is this back ache normal?","Show meal options","Create a wellbeing support plan"].map(q=><button key={q} onClick={chat}>{q}<ChevronRight/></button>)}</div><button className="open-maya" onClick={chat}>Talk with Maya <ArrowRight/></button></article><article className="documents"><div><i><FileHeart/></i><p><b>Care records</b>{homeData?.kpis.care_records||0} fictional sample record{homeData?.kpis.care_records===1?"":"s"}</p></div></article><article className="dos"><div className="dos-grid"><section><b className="do-title">DO’S</b><p>Review evidence</p><p>Confirm constraints</p><p>Contact your clinician</p></section><section><b className="dont-title">DON’TS</b><p>Treat demo as diagnosis</p><p>Upload real files here</p></section></div></article></aside></div></Tabs><p className="care-disclaimer"><ShieldCheck/> Maya offers general educational support and does not replace medical or clinical advice. Contact your healthcare professional with personal or urgent concerns.</p><button className="landing-return" onClick={home}>About Maya <MoveUpRight/></button></section>
    <button className="floating-chat" onClick={chat}><i><Flower2/></i><span><b>Ask Maya</b><small>Here with you</small></span></button>
  </main>;
}

function WeekLibrary({ selectedWeek, back }: { selectedWeek: number | null; back: () => void }) {
  const [activeWeek,setActiveWeek]=useState(selectedWeek || 22);
  const active=getBabyGrowth(activeWeek);
  const hasComparison=!active.comparison.startsWith("No embryo");
  return <main className="week-library">
    <header><button onClick={back}><ArrowLeft/> Back to dashboard</button><Brand onClick={back}/><span>EDUCATIONAL GROWTH LIBRARY</span></header>
    <section className="library-hero"><div><span>WEEK BY WEEK</span><h1>One little story,<br/><em>growing with you.</em></h1><p>Choose a week to see its gentle developmental illustration, familiar size comparison and approximate measurements.</p></div><article><div className="library-pair"><FetalVisual week={activeWeek}/><FruitVisual week={activeWeek}/></div><span>WEEK {activeWeek}</span><h2>{hasComparison ? <>About the size of <em>{active.comparison.toLowerCase()}</em></> : "The earliest beginning"}</h2><p className="stage-copy">{active.developmentStage}</p><div className="library-measures"><p><small>ESTIMATED LENGTH</small><b>{active.length}</b></p><p><small>ESTIMATED WEIGHT</small><b>{active.weight}</b></p></div><footer><Info/> Measurements can vary. Your care team’s scan is the best reference for your baby.</footer></article></section>
    <section className="library-grid-section"><header><div><span>THE COMPLETE LIBRARY</span><h2>Weeks 1–41</h2></div><p>Illustrations are a warm visual guide, not clinical anatomy.</p></header><div className="library-grid">{Array.from({length:41},(_,index)=>{const item=getBabyGrowth(index+1);const available=!item.comparison.startsWith("No embryo");return <button key={item.week} className={activeWeek===item.week?"active":""} onClick={()=>{setActiveWeek(item.week);window.scrollTo({top:0,behavior:"smooth"})}}><div><FetalVisual week={item.week} compact/><FruitVisual week={item.week} compact/></div><span>WEEK {item.week}</span><h3>{available?item.comparison:"Earliest beginning"}</h3><p>{item.length}<i/> {item.weight}</p></button>})}</div></section>
    <p className="library-note"><ShieldCheck/> These approximate editorial comparisons support understanding only. They do not diagnose growth or replace ultrasound measurements and clinical care.</p>
  </main>;
}

function PostpartumDashboard({ name, chat, home, sessionId, homeData }: { name: string; chat: () => void; home: () => void; sessionId: string; homeData: HomeData | null }) {
  return <main className="dashboard postpartum">
    <header className="dash-nav"><Brand onClick={home}/><div>{name && <button className="profile"><i>{name[0]}</i><b>{name}</b></button>}<button className="mobile-menu"><Menu /></button></div></header>
    <section className="welcome"><div><span>YOUR POSTPARTUM SPACE</span><h1>{name ? `Welcome, ${name}.` : "Welcome to your Maya."}</h1><p>Care for your recovery, your rhythm and life with baby.</p></div><button onClick={home}>View landing page <MoveUpRight /></button></section>
    <section className="metrics postpartum-metrics">
      <article className="blush"><span>RECOVERY WEEK</span><div><b>{homeData?.journey.exact||"—"}</b><p>weeks<br/>postpartum</p></div><small><Heart/>Resolved from the date you entered</small><em/></article>
      <article><span>FEEDING RHYTHM</span><div><b>—</b><p>not<br/>logged</p></div><small><Baby/>Maya will not invent your data</small></article>
      <article><span>REST, NOT JUST SLEEP</span><div><b>—</b><p>not<br/>logged</p></div><small><MoonStar/>Check-in is not connected yet</small></article>
    </section>
    <section className="postpartum-overview">
      <article className="recovery-card"><header><div><span>YOUR RECOVERY</span><h2>Healing has its own pace.</h2></div><i><Flower2/></i></header><div className="recovery-line"><span className="active"><b>Now</b><small>Rest + repair</small></span><span><b>Weeks 3–6</b><small>Steady support</small></span><span><b>After 6 weeks</b><small>Care review</small></span></div><p><Sparkles/><span><b>Today’s gentle focus</b>Let someone else hold one task while you take ten uninterrupted minutes.</span></p></article>
      <article className="baby-rhythm"><header><span>BABY’S RHYTHM</span><i><Baby/></i></header><h2>No perfect schedule.<br/><em>Just patterns to notice.</em></h2><div><span><SunMedium/><b>Awake windows</b><small>Short and changing</small></span><span><MoonStar/><b>Sleep</b><small>14–17 hours can be typical</small></span></div></article>
    </section>
    <ConnectedPlan sessionId={sessionId}/><section className="plan" id="plan"><Tabs defaultValue="recovery"><header className="plan-nav"><div><span>POSTPARTUM EDITORIAL PREVIEW</span><h2>Explore the dashboard content structure.</h2></div><TabsList>{["recovery","nourishment","feeding","wellbeing","faq"].map((x,i)=><TabsTrigger value={x} key={x}>{["Recovery","Nourishment","Feeding","Wellbeing","FAQs"][i]}</TabsTrigger>)}</TabsList></header><div className="plan-layout"><div>
      <TabsContent value="recovery"><Intro n="01" title="Recovery is not a straight line." text="A calm daily view of comfort, healing and signs that deserve extra support."/><Cards items={postpartumPlan.recovery}/></TabsContent>
      <TabsContent value="nourishment"><Intro n="02" title="You deserve feeding, too." text="Low-effort nourishment and hydration ideas made for full hands and changing days."/><Cards items={postpartumPlan.nourishment}/></TabsContent>
      <TabsContent value="feeding"><Intro n="03" title="Find the rhythm that fits you both." text="Practical cues and comfort guidance for breast, bottle or combination feeding."/><Cards items={postpartumPlan.feeding}/></TabsContent>
      <TabsContent value="wellbeing"><Intro n="04" title="Your inner weather matters." text="A gentle place to notice how you’re feeling and reach for support early."/><Cards items={postpartumPlan.wellbeing}/></TabsContent>
      <TabsContent value="faq"><Intro n="05" title="New days bring new questions." text="Clear starting points for recovery, feeding, sleep and your emotional wellbeing."/><div className="faqs">{["What bleeding is expected now?","How can I make feeding more comfortable?","When should I call my doctor?","Is it normal to feel unlike myself?"].map((x,i)=><button key={x}><span>0{i+1}</span>{x}<Plus/></button>)}</div></TabsContent>
    </div><aside><article className="ask-card"><header><span><i><Flower2/></i> ASK MAYA</span><button onClick={chat}><MoveUpRight/></button></header><div className="maya-signal"><i/><i/><i/><span><Sparkles/></span></div><h3>A question is enough.</h3><p className="maya-description">Recovery can feel different from day to day. Ask about comfort, feeding, rest, or whatever feels heavy right now.</p><p className="prompt-label">You could ask:</p><div className="quick-prompts">{["Is my recovery on track?","How can I rest between feeds?","I feel overwhelmed today"].map(q=><button key={q} onClick={chat}>{q}<ChevronRight/></button>)}</div><button className="open-maya" onClick={chat}>Talk with Maya <ArrowRight/></button></article><article className="documents"><div><i><FileHeart/></i><p><b>Care records</b>{homeData?.kpis.care_records||0} fictional sample record{homeData?.kpis.care_records===1?"":"s"}</p></div></article><article className="dos"><div className="dos-grid"><section><b className="do-title">DO’S</b><p>Review evidence</p><p>Confirm constraints</p><p>Contact your clinician</p></section><section><b className="dont-title">DON’TS</b><p>Treat demo as diagnosis</p><p>Upload real files here</p></section></div></article></aside></div></Tabs><p className="care-disclaimer"><ShieldCheck/> Maya offers general educational support and does not replace medical or clinical advice. Contact your healthcare professional with personal or urgent concerns.</p></section>
    <button className="floating-chat" onClick={chat}><i><Flower2/></i><span><b>Ask Maya</b><small>Here with you</small></span></button>
  </main>;
}

function Intro({n,title,text}:{n:string;title:string;text:string}) { return <div className="plan-intro"><span>{n} / THIS WEEK</span><h2>{title}</h2><p>{text}</p></div> }

function Chat({ name, journey, week, back, sessionId }: { name: string; journey: "pregnant" | "postpartum"; week: number | null; back: () => void; sessionId: string }) {
  const contextLabel=journey === "postpartum" ? "YOUR POSTPARTUM SPACE" : week ? `WEEK ${week}` : "YOUR PREGNANCY";
  const suggestions=journey === "postpartum" ? ["I have pain after birth","Show meal options","Create a wellbeing support plan","Questions for my next appointment"] : ["Is my back ache normal?","Show meal options","Create a weekly movement plan","Questions for my next appointment"];
  const [messages,setMessages]=useState<Array<{from:"maya"|"you";text:string;display?:MayaDisplay}>>([{from:"maya",text:`Hi${name ? ` ${name}` : ""}. I’m here. What’s on your mind today?`}]); const [input,setInput]=useState(""); const [sending,setSending]=useState(false);
  const send=async(text:string)=>{if(!text.trim()||sending)return;const question=text.trim();setMessages(m=>[...m,{from:"you",text:question}]);setInput("");setSending(true);try{if(!sessionId)throw new Error("Please complete onboarding first so Maya has a trusted journey context.");const response=await mayaApi.chat(sessionId,question);setMessages(m=>[...m,{from:"maya",text:response.display.summary,display:response.display}]);}catch(reason){setMessages(m=>[...m,{from:"maya",text:reason instanceof Error?reason.message:"Maya could not answer right now."}]);}finally{setSending(false)}};
  return <main className="chat"><header><button onClick={back} aria-label="Back to dashboard"><ArrowLeft/></button><Brand onClick={back}/><button onClick={back} aria-label="Close conversation"><X/></button></header><section><div className="chat-context"><span>{contextLabel} · CONTROLLED DEMO</span><p>Maya uses the timeline and constraints you confirmed during onboarding. Responses pass through safety, specialist routing, and validation.</p></div><div className="messages">{messages.map((m,i)=><article className={m.from} key={i}><i>{m.from==="maya"?<Flower2/>:(name[0] || "Y")}</i><div><p>{m.display&&<b>{m.display.title}<br/></b>}{m.text}</p>{m.display?.applied_constraints.length?<small>Applied: {m.display.applied_constraints.join(", ")}</small>:null}</div></article>)}{messages.length===1&&<div className="suggestions">{suggestions.map(x=><button onClick={()=>void send(x)} key={x}>{x}<ArrowRight/></button>)}</div>}{sending&&<article className="maya"><i><Flower2/></i><p>Checking safety, evidence, and validation…</p></article>}</div></section><footer><div><button aria-label="Attachments are disabled in controlled demo" disabled title="Real file upload is not enabled in this demo"><Paperclip/></button><Input value={input} disabled={sending} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void send(input)}} placeholder="Ask what’s on your mind…"/><Button disabled={sending} onClick={()=>void send(input)} aria-label="Send message"><Send/></Button></div><p>Maya offers general educational support, not diagnosis. For urgent concerns, contact local emergency services or your care team.</p></footer></main>;
}

export default function Home() {
  const [view,setView]=useState<View>("landing"); const [name,setName]=useState(()=>typeof window==="undefined"?"":localStorage.getItem("maya-name")||""); const [journey,setJourney]=useState<"pregnant"|"postpartum">(()=>typeof window!=="undefined"&&localStorage.getItem("maya-journey")==="postpartum"?"postpartum":"pregnant"); const [week,setWeek]=useState<number|null>(()=>{if(typeof window==="undefined")return null;const value=localStorage.getItem("maya-week");return value?Number(value):null}); const [sessionId,setSessionId]=useState(()=>typeof window==="undefined"?"":localStorage.getItem("maya-session")||""); const [homeData,setHomeData]=useState<HomeData|null>(null); const [appError,setAppError]=useState("");
  const begin=async()=>{setAppError("");try{const session=await mayaApi.createSession();setSessionId(session.session_id);localStorage.setItem("maya-session",session.session_id);setView("onboarding");}catch(reason){setAppError(reason instanceof Error?reason.message:"The Maya API is unavailable.");}};
  const finishOnboarding=async(payload:OnboardingPayload)=>{let sid=payload.session_id||sessionId;if(!sid){sid=(await mayaApi.createSession()).session_id;setSessionId(sid);localStorage.setItem("maya-session",sid);}const resolved=await mayaApi.onboard({...payload,session_id:sid});const nextHome=await mayaApi.home(sid);setName(payload.name);setJourney(payload.journey);setWeek(payload.journey==="pregnant"?(resolved.journey.exact??resolved.journey.range_start):null);setHomeData(nextHome);localStorage.setItem("maya-name",payload.name);localStorage.setItem("maya-journey",payload.journey);if(resolved.journey.exact)localStorage.setItem("maya-week",String(resolved.journey.exact));else localStorage.removeItem("maya-week");setView("dashboard");};
  const preview=async()=>{setAppError("");try{const session=await mayaApi.createSession();setSessionId(session.session_id);localStorage.setItem("maya-session",session.session_id);await finishOnboarding({session_id:session.session_id,name:"",journey:"pregnant",timeline_mode:"week",timeline_value:"26",diets:["Vegetarian"],allergies:["Peanut"],symptoms:[],use_fictional_sample_record:true});}catch(reason){setAppError(reason instanceof Error?reason.message:"The Maya API is unavailable.");}};
  useEffect(()=>{
    const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:{signal?:AbortSignal})=>void|Promise<void>}}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    Promise.resolve(context.registerTool({
      name:"open_maya_view",title:"Open a Maya view",description:"Navigate Maya to the landing page, onboarding, weekly dashboard, or Ask Maya conversation.",
      inputSchema:{type:"object",properties:{view:{type:"string",enum:["landing","onboarding","dashboard","chat","library"]}},required:["view"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input:unknown){const next=(input as {view?:string})?.view;if(!["landing","onboarding","dashboard","chat","library"].includes(next||""))throw new Error("Choose a valid Maya view.");setView(next as View);return{view:next,status:"opened"};}
    },{signal:lifecycle.signal})).catch(()=>{});
    return()=>lifecycle.abort();
  },[]);
  if(view==="onboarding")return <Onboarding back={()=>setView("landing")} done={finishOnboarding}/>;
  if(view==="dashboard")return journey === "postpartum" ? <PostpartumDashboard name={name} chat={()=>setView("chat")} home={()=>setView("landing")} sessionId={sessionId} homeData={homeData}/> : <Dashboard name={name} week={week} chat={()=>setView("chat")} home={()=>setView("landing")} library={()=>setView("library")} sessionId={sessionId} homeData={homeData}/>;
  if(view==="library")return <WeekLibrary selectedWeek={week} back={()=>setView("dashboard")}/>;
  if(view==="chat")return <Chat name={name} journey={journey} week={week} back={()=>setView(sessionId?"dashboard":"landing")} sessionId={sessionId}/>;
  return <><Landing start={()=>void begin()} preview={()=>void preview()} chat={()=>setView("chat")}/>{appError&&<p className="app-error" role="alert">{appError}</p>}</>;
}
