"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Baby, CalendarDays, Check,
  FileHeart, Flower2, Heart, Menu, MessageCircle, MoonStar, MoveUpRight,
  Paperclip, Plus, Salad, Send, ShieldCheck, Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mayaApi, type HomeData, type MayaDisplay, type OnboardingPayload, type OnboardingResult, type PlanResponse } from "@/lib/maya-api";

type View = "landing" | "onboarding" | "dashboard" | "chat" | "library";
const diets = ["Vegetarian", "Egg-friendly", "Dairy-free", "Gluten-free"];
const symptoms = ["Back ache", "Heartburn", "Low energy", "Trouble sleeping"];
const allergies = ["Nuts", "Dairy", "Soy", "Gluten"];
function Brand({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  return <button className={`brand ${light ? "light" : ""}`} onClick={onClick} aria-label="Maya home"><i><Flower2 /></i><b>maya</b></button>;
}

function Landing({ start, preview, chat }: { start: () => void; preview: () => void; chat: () => void }) {
  return <main className="landing">
    <nav className="landing-nav"><Brand /><button className="landing-maya" onClick={chat}><MessageCircle/><b>Ask Maya</b></button></nav>
    <section className="hero">
      <div className="hero-copy">
        <span className="landing-boundary" role="status"><ShieldCheck /> Controlled fictional demo · do not enter real health data</span>
        <span className="kicker"><Sparkles /> Thoughtful care, week by week</span>
        <h1><span>Feel held through</span><span>every <em>little change.</em></span></h1>
        <p>This local prototype demonstrates journey-aware safety, planning, and evidence controls with fictional information. It is not a doctor, diagnostic tool, prescriber, medical device, or emergency service.</p>
        <div className="hero-actions"><Button onClick={start}>Begin my journey <ArrowRight /></Button></div>
        <div className="trust"><div><span>K</span><span>A</span></div><p><b>Designed for the in-between moments</b><small>Guidance, never judgement.</small></p></div>
      </div>
      <div className="hero-art">
        <div className="orbital o1"><span/><span/><span/><span/><span/></div><div className="orbital o2"><span/><span/><span/></div>
        <div className="orbit-center"><Flower2/><span>care around you</span></div>
        <div className="orbit-tab tab-a"><Heart /><p><b>Safety first</b>Urgent wording bypasses ordinary generation.</p></div>
        <div className="orbit-tab tab-b"><Baby /><p><b>Journey-aware</b>Your confirmed timeline scopes the demo.</p></div>
        <div className="orbit-tab tab-c"><Salad /><p><b>Nourishment</b>Made for your preferences.</p></div>
        <div className="orbit-tab tab-d"><MessageCircle /><p><b>Ask Maya</b>A calm answer, when needed.</p></div>
      </div>
    </section>
    <section className="inside" id="inside"><p>A companion for</p><div><span><Heart /> wellbeing</span><span><Salad /> nourishment</span><span><Activity /> movement</span><span><MessageCircle /> questions</span></div></section>
    <section className="care" id="care"><div><span>01 / YOUR RHYTHM</span><h2>Less information.<br /><em>More relevance.</em></h2></div><div><p>The controlled demo can assemble a proposed weekly plan from a fictional stage, symptoms and preferences when its accepted safety and evidence checks allow it.</p><button className="sample-link" onClick={preview}>Explore a sample week <MoveUpRight /></button></div></section>
  </main>;
}

function Onboarding({ back, done }: { back: () => void; done: (payload: OnboardingPayload) => Promise<OnboardingResult> }) {
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
  const submit=async(includeRecord=useSampleRecord)=>{if(!timelineValue){setSubmitError("Please add your week, month, due date, or birth date so Maya can resolve your timeline safely.");return;}setSubmitting(true);setSubmitError("");try{const result=await done({name:name.trim(),journey,timeline_mode:journey==="postpartum"?"birth_date":timelineMode,timeline_value:timelineValue,diets:diet,allergies:[...allergy,...(otherAllergy.trim()?[otherAllergy.trim()]:[])],symptoms:feeling,use_fictional_sample_record:includeRecord});if(result.safety_blocked){setSubmitError(result.symptom_checks.filter(item=>!item.ordinary_generation_allowed).map(item=>item.message).join(" "));}}catch(error){setSubmitError(error instanceof Error?error.message:"Maya could not complete onboarding.");}finally{setSubmitting(false)}};
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
        {step === 4 && <div className="upload"><div className="record-optional" role="status"><ShieldCheck/><p><b>Care records are optional.</b><span>Continue without a record to browse product FAQs and ask supported general questions. Maya will ask for missing context or stop instead of guessing.</span></p></div><button className={useSampleRecord?"selected":""} onClick={()=>setUseSampleRecord(value=>!value)}><i><FileHeart /></i><b>Use the fictional sample care record</b><small>Includes one sample appointment and one record-only supplement.</small><em>{useSampleRecord?<><Check/> Added</>:<><Plus/> Add sample</>}</em></button><p><ShieldCheck /> Real medical-file upload is intentionally disabled in this demo. The production upload path requires authenticated private storage, scanning, extraction, and your confirmation.</p></div>}
        {submitError&&<p className="integration-error" role="alert">{submitError}</p>}
      </div>
      <footer><button className="skip-step" onClick={() => step === 4 ? void submit(false) : setStep(step + 1)} disabled={submitting}>{step===4?"Continue without records":"Skip this step"}</button><Button disabled={submitting} onClick={() => step === 4 ? void submit(useSampleRecord) : setStep(step + 1)}>{submitting?"Connecting…":step === 4 ? (useSampleRecord?"Open with sample record":"Open my Maya") : "Continue"} <ArrowRight /></Button></footer>
    </section>
  </main>;
}

function ConnectedPlan({ sessionId }: { sessionId: string }) {
  const [result,setResult]=useState<PlanResponse|null>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const build=async()=>{setLoading(true);setError("");try{setResult(await mayaApi.plan(sessionId));}catch(reason){setError(reason instanceof Error?reason.message:"The plan could not be created.");}finally{setLoading(false)}};
  return <section className="connected-plan"><header><div><span>CONNECTED AGENT FLOW · CONTROLLED DEMO</span><h2>Your plan, assembled through Maya’s safety and validation gates.</h2></div><Button onClick={()=>void build()} disabled={loading}>{loading?"Building…":result?"Rebuild plan":"Build my connected week"}<Sparkles/></Button></header>{error&&<p className="integration-error" role="alert">{error}</p>}{result&&<div className="connected-result"><h3>{result.display.title}</h3><p>{result.display.summary}</p>{result.schedule?.items.length?<div className="schedule-grid">{result.schedule.items.map(item=><article key={item.schedule_item_id}><span>{item.day} · {item.start}</span><b>{item.domain}</b><p>{item.item}</p></article>)}</div>:<p>Maya stopped safely before producing a schedule. {result.display.uncertainties.join(" ")}</p>}<small><ShieldCheck/> Fictional controlled evidence · proposed plan only · no clinical diagnosis or persistent write.</small></div>}</section>;
}

function UnreleasedEditorialPanel({ stage }: { stage: "pregnancy" | "postpartum" }) {
  return <section className="plan editorial-unavailable" id="plan" role="status">
    <div className="integration-error">
      <ShieldCheck/>
      <div><b>Reviewed {stage} guidance is not released yet.</b><p>The editorial cards and health claims in this visual concept stay hidden. Use the connected fictional-demo flow above to exercise the accepted safety, evidence, specialist, and validation controls.</p></div>
    </div>
  </section>;
}

function NoRecordNotice({ chat }: { chat: () => void }) {
  return <section className="no-record-notice" role="status"><i><FileHeart/></i><div><b>No care record connected</b><p>You can still browse product FAQs and ask supported general questions. Personalised answers stay limited until the relevant information is confirmed.</p></div><button onClick={chat}>Ask a general question <ArrowRight/></button></section>;
}

const productFaqs = [
  ["Can I use Maya without uploading a care record?", "Yes. Records are optional. You can browse these product FAQs and ask supported general questions. Maya will ask for missing context or stop instead of guessing."],
  ["Will Maya guess information that I have not provided?", "No. Missing, unconfirmed, or conflicting personal information must remain visible and cannot silently become a confirmed fact."],
  ["Can Maya diagnose me or change my medication?", "No. Maya is an educational and organisational prototype. Medication stays record-only, and diagnosis, prescribing, and treatment changes are outside its boundaries."],
  ["What happens if I describe an urgent concern?", "The deterministic Safety Gate runs before ordinary responses. An urgent route uses fixed guidance and bypasses ordinary generation."],
] as const;

function ProductFaqs() {
  return <section className="product-faqs" id="faqs"><header><span>GENERAL PRODUCT FAQS</span><h2>Browse without connecting a record.</h2><p>These answers explain how the controlled demo works; they are not health guidance.</p></header><div>{productFaqs.map(([question,answer])=><details key={question}><summary>{question}<Plus/></summary><p>{answer}</p></details>)}</div></section>;
}

function Dashboard({ name, week, chat, home, library, sessionId, homeData }: { name: string; week: number | null; chat: () => void; home: () => void; library: () => void; sessionId: string; homeData: HomeData | null }) {
  const trimesterName = week ? (week < 14 ? "first" : week < 28 ? "second" : "third") : null;
  return <main className="dashboard">
    <header className="dash-nav"><Brand onClick={home}/><div>{name && <button className="profile"><i>{name[0]}</i><b>{name}</b></button>}<button className="mobile-menu"><Menu /></button></div></header>
    <section className="welcome" aria-hidden="true" />
    {homeData?.kpis.care_records===0&&<NoRecordNotice chat={chat}/>}
    <section className="metrics">
      <article className="metric-card week-kpi"><header><i><Baby/></i></header><span>YOUR WEEK</span><div><b>{week ?? "—"}</b><p>{week ? "of 40" : "add timeline"}</p></div><small>{week ? <><b>{trimesterName} trimester</b><span>{40-week} weeks to meet baby</span></> : <><b>Timeline pending</b><span>Personalise when ready</span></>}</small></article>
      <article className="metric-card appointment"><header><i><CalendarDays/></i></header><span>NEXT APPOINTMENT</span><div><b>{homeData?.kpis.upcoming_appointment?"Demo":"—"}</b><p>{homeData?.kpis.upcoming_appointment||"Not added"}</p></div><small><b>{homeData?.kpis.upcoming_appointment?"Fictional sample":"Your record"}</b><span>{homeData?.kpis.upcoming_appointment?"Not a real appointment":"Add after secure upload is enabled"}</span></small></article>
      <article className="metric-card calm-kpi"><header><i><Heart/></i></header><span>WELLBEING</span><div><b>—</b><p>not logged</p></div><small><b>Check-in pending</b><span>Maya will not invent your mood</span></small></article>
      <article className="rhythm-kpi"><span>CONFIRMED CONTEXT</span><div className="rhythm-list"><p><i className="done"><Check/></i>{homeData?.confirmed_context.diets.join(", ")||"No diet preference"}</p><p><i className={homeData?.confirmed_context.allergies.length?"done":""}><Check/></i>{homeData?.confirmed_context.allergies.join(", ")||"No allergy recorded"}</p><p><i className={homeData?.confirmed_context.symptoms.length?"done":""}><Check/></i>{homeData?.confirmed_context.symptoms.join(", ")||"No symptom recorded"}</p></div></article>
    </section>
    <section className="growth">
      <article className="trimester"><header><div><span>YOUR JOURNEY</span><h2>{week ? "Your confirmed timeline" : "Timeline pending"}</h2></div></header><p>{week ? "Pregnancy week " + week + " is the timeline resolved from the information entered in this fictional demo." : "Add a timeline during onboarding."}</p></article>
      <article className="baby-size empty" role="status"><header><span>WEEKLY DEVELOPMENT CONTENT</span><button onClick={library}>REVIEW STATUS <ArrowRight/></button></header><div className="size-placeholder"><ShieldCheck/><h2>Size comparisons and measurements are hidden.</h2><p>No weekly profile is publicly released. Unreviewed draft measurements and object comparisons are never shown as guidance.</p></div></article>
    </section>
    <ConnectedPlan sessionId={sessionId}/><UnreleasedEditorialPanel stage="pregnancy"/><ProductFaqs/>
    <button className="floating-chat" onClick={chat}><i><Flower2/></i><span><b>Ask Maya</b><small>Here with you</small></span></button>
  </main>;
}

function WeekLibrary({ selectedWeek, back }: { selectedWeek: number | null; back: () => void }) {
  return <main className="week-library">
    <header><button onClick={back}><ArrowLeft/> Back to dashboard</button><Brand onClick={back}/><span>WEEKLY CONTENT REVIEW STATUS</span></header>
    <section className="library-hero"><div><span>CONTROLLED DEMO</span><h1>Weekly comparisons are <em>not released.</em></h1><p>{selectedWeek ? "The fictional journey is at week " + selectedWeek + ", but no unapproved size, weight, length, or developmental claim is displayed." : "Confirm a fictional journey timeline first."}</p></div><article role="status"><ShieldCheck/><h2>Content remains fail-closed</h2><p>The repository currently has zero publicly released weekly profiles. Qualified clinical, India-localisation, product, and licence review remain external gates.</p><button onClick={back}>Return to dashboard</button></article></section>
  </main>;
}

function PostpartumDashboard({ name, chat, home, sessionId, homeData }: { name: string; chat: () => void; home: () => void; sessionId: string; homeData: HomeData | null }) {
  return <main className="dashboard postpartum">
    <header className="dash-nav"><Brand onClick={home}/><div>{name && <button className="profile"><i>{name[0]}</i><b>{name}</b></button>}<button className="mobile-menu"><Menu /></button></div></header>
    <section className="welcome"><div><span>YOUR POSTPARTUM SPACE</span><h1>{name ? `Welcome, ${name}.` : "Welcome to your Maya."}</h1><p>Care for your recovery, your rhythm and life with baby.</p></div><button onClick={home}>View landing page <MoveUpRight /></button></section>
    {homeData?.kpis.care_records===0&&<NoRecordNotice chat={chat}/>}
    <section className="metrics postpartum-metrics">
      <article className="blush"><span>RECOVERY WEEK</span><div><b>{homeData?.journey.exact||"—"}</b><p>weeks<br/>postpartum</p></div><small><Heart/>Resolved from the date you entered</small><em/></article>
      <article><span>FEEDING RHYTHM</span><div><b>—</b><p>not<br/>logged</p></div><small><Baby/>Maya will not invent your data</small></article>
      <article><span>REST, NOT JUST SLEEP</span><div><b>—</b><p>not<br/>logged</p></div><small><MoonStar/>Check-in is not connected yet</small></article>
    </section>
    <section className="postpartum-overview"><article className="recovery-card" role="status"><header><div><span>POSTPARTUM CONTENT STATUS</span><h2>Reviewed guidance is not released yet.</h2></div><i><ShieldCheck/></i></header><p>The current fictional timeline can be shown, while unreviewed recovery, feeding, sleep, and well-being claims remain hidden.</p></article></section>
    <ConnectedPlan sessionId={sessionId}/><UnreleasedEditorialPanel stage="postpartum"/><ProductFaqs/>
    <button className="floating-chat" onClick={chat}><i><Flower2/></i><span><b>Ask Maya</b><small>Here with you</small></span></button>
  </main>;
}

function Chat({ name, journey, week, back, sessionId, hasCareRecord }: { name: string; journey: "pregnant" | "postpartum"; week: number | null; back: () => void; sessionId: string; hasCareRecord: boolean }) {
  const contextLabel=journey === "postpartum" ? "YOUR POSTPARTUM SPACE" : week ? `WEEK ${week}` : "YOUR PREGNANCY";
  const suggestions=journey === "postpartum" ? ["I have pain after birth","Show meal options","Create a wellbeing support plan","Questions for my next appointment"] : ["Is my back ache normal?","Show meal options","Create a weekly movement plan","Questions for my next appointment"];
  const [messages,setMessages]=useState<Array<{from:"maya"|"you";text:string;display?:MayaDisplay}>>([{from:"maya",text:`Hi${name ? ` ${name}` : ""}. I’m here. What’s on your mind today?`}]); const [input,setInput]=useState(""); const [sending,setSending]=useState(false);
  const send=async(text:string)=>{if(!text.trim()||sending)return;const question=text.trim();setMessages(m=>[...m,{from:"you",text:question}]);setInput("");setSending(true);try{if(!sessionId)throw new Error("Please complete onboarding first so Maya has a trusted journey context.");const response=await mayaApi.chat(sessionId,question);setMessages(m=>[...m,{from:"maya",text:response.display.summary,display:response.display}]);}catch(reason){setMessages(m=>[...m,{from:"maya",text:reason instanceof Error?reason.message:"Maya could not answer right now."}]);}finally{setSending(false)}};
  return <main className="chat"><header><button onClick={back} aria-label="Back to dashboard"><ArrowLeft/></button><Brand onClick={back}/><button onClick={back} aria-label="Close conversation"><X/></button></header><section><div className="chat-context"><span>{contextLabel} · CONTROLLED DEMO</span><p>{hasCareRecord?"Maya uses the timeline and constraints you confirmed during onboarding. Responses pass through safety, specialist routing, and validation.":"No care record is connected. You can ask supported general questions. If a question needs personal context, Maya will ask for it or stop instead of guessing."}</p></div><div className="messages">{messages.map((m,i)=><article className={m.from} key={i}><i>{m.from==="maya"?<Flower2/>:(name[0] || "Y")}</i><div><p>{m.display&&<b>{m.display.title}<br/></b>}{m.text}</p>{m.display?.applied_constraints.length?<small>Applied: {m.display.applied_constraints.join(", ")}</small>:null}{m.display?.uncertainties.length?<small className="chat-uncertainty">Needs confirmation: {m.display.uncertainties.join(" ")}</small>:null}</div></article>)}{messages.length===1&&<div className="suggestions">{suggestions.map(x=><button onClick={()=>void send(x)} key={x}>{x}<ArrowRight/></button>)}</div>}{sending&&<article className="maya"><i><Flower2/></i><p>Checking safety, evidence, and validation…</p></article>}</div></section><footer><div><button aria-label="Attachments are disabled in controlled demo" disabled title="Real file upload is not enabled in this demo"><Paperclip/></button><Input value={input} disabled={sending} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void send(input)}} placeholder="Ask what’s on your mind…"/><Button disabled={sending} onClick={()=>void send(input)} aria-label="Send message"><Send/></Button></div><p>Maya offers general educational support, not diagnosis. For urgent concerns, contact local emergency services or your care team.</p></footer></main>;
}

export default function Home() {
  const [view,setView]=useState<View>("landing"); const [name,setName]=useState(()=>typeof window==="undefined"?"":localStorage.getItem("maya-name")||""); const [journey,setJourney]=useState<"pregnant"|"postpartum">(()=>typeof window!=="undefined"&&localStorage.getItem("maya-journey")==="postpartum"?"postpartum":"pregnant"); const [week,setWeek]=useState<number|null>(()=>{if(typeof window==="undefined")return null;const value=localStorage.getItem("maya-week");return value?Number(value):null}); const [sessionId,setSessionId]=useState(()=>typeof window==="undefined"?"":localStorage.getItem("maya-session")||""); const [homeData,setHomeData]=useState<HomeData|null>(null); const [appError,setAppError]=useState("");
  const begin=()=>{setAppError("");setView("onboarding");};
  const finishOnboarding=async(payload:OnboardingPayload):Promise<OnboardingResult>=>{let sid=payload.session_id||sessionId;if(!sid){sid=(await mayaApi.createSession()).session_id;setSessionId(sid);localStorage.setItem("maya-session",sid);}const resolved=await mayaApi.onboard({...payload,session_id:sid});if(resolved.safety_blocked)return resolved;const nextHome=await mayaApi.home(sid);setName(payload.name);setJourney(payload.journey);setWeek(payload.journey==="pregnant"?(resolved.journey.exact??resolved.journey.range_start):null);setHomeData(nextHome);localStorage.setItem("maya-name",payload.name);localStorage.setItem("maya-journey",payload.journey);if(resolved.journey.exact)localStorage.setItem("maya-week",String(resolved.journey.exact));else localStorage.removeItem("maya-week");setView("dashboard");return resolved;};
  const preview=async(target: "dashboard" | "chat" = "dashboard")=>{setAppError("");try{const session=await mayaApi.createSession();setSessionId(session.session_id);localStorage.setItem("maya-session",session.session_id);await finishOnboarding({session_id:session.session_id,name:"",journey:"pregnant",timeline_mode:"week",timeline_value:"26",diets:["Vegetarian"],allergies:["Peanut"],symptoms:[],use_fictional_sample_record:true});if(target==="chat")setView("chat");}catch(reason){setAppError(reason instanceof Error?reason.message:"The Maya API is unavailable.");}};
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
  if(view==="chat")return <Chat name={name} journey={journey} week={week} back={()=>setView(sessionId?"dashboard":"landing")} sessionId={sessionId} hasCareRecord={Boolean(homeData?.kpis.care_records)}/>;
  return <><Landing start={()=>void begin()} preview={()=>void preview()} chat={()=>void preview("chat")}/>{appError&&<p className="app-error" role="alert">{appError}</p>}</>;
}
