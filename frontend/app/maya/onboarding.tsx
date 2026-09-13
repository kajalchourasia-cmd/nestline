"use client";

import { useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Baby, Check, FileHeart, Flower2, Heart, MessageCircle, MoveUpRight, Plus, Salad, ShieldCheck, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OnboardingPayload, OnboardingResult } from "@/lib/maya-api";
import { Brand, ProductPreviewBadge, StatusPanel } from "./visuals";

const diets = ["Vegetarian", "Egg-friendly", "Dairy-free", "Gluten-free"];
const symptoms = ["Back ache", "Heartburn", "Low energy", "Trouble sleeping"];
const allergies = ["Peanut", "Dairy", "Soy", "Gluten"];

export function Landing({
  start,
  preview,
  chat,
  busy,
  error,
  retry,
}: {
  start: () => void;
  preview: () => void;
  chat: () => void;
  busy: boolean;
  error: string;
  retry: () => void;
}) {

  return <main className="landing">
    <nav className="landing-nav"><Brand /><div><ProductPreviewBadge /><button className="landing-maya" onClick={chat}><MessageCircle /><b>Ask Maya</b></button></div></nav>
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker"><Sparkles /> Thoughtful care, week by week</span>
        <h1><span>Feel held through</span><span>every <em>little change.</em></span></h1>
        <p>Bring your journey, preferences and questions into one calm space. Maya shows what is available now and stays clear about what still needs review.</p>
        <div className="hero-actions"><Button onClick={start} disabled={busy}>{busy ? "Opening…" : "Begin my journey"} <ArrowRight /></Button></div>
        <div className="trust"><div><span>K</span><span>A</span></div><p><b>Designed for the in-between moments</b><small>Guidance, never judgement.</small></p></div>
        {error ? <StatusPanel tone="error" title="Maya could not connect" message={error} action={retry} actionLabel="Retry" /> : null}
      </div>
      <div className="hero-art" aria-label="Maya care illustration">
        <div className="orbital o1"><span /><span /><span /><span /><span /></div><div className="orbital o2"><span /><span /><span /></div>
        <div className="orbit-center"><Flower2 /><span>care around you</span></div>
        <div className="orbit-tab tab-a"><Heart /><p><b>Safety first</b>Urgent concerns stop ordinary responses.</p></div>
        <div className="orbit-tab tab-b"><Baby /><p><b>Journey-aware</b>Your timeline shapes the preview.</p></div>
        <div className="orbit-tab tab-c"><Salad /><p><b>Nourishment</b>Made for your preferences.</p></div>
        <div className="orbit-tab tab-d"><MessageCircle /><p><b>Ask Maya</b>A calm place to begin.</p></div>
      </div>
    </section>
    <section className="inside" id="inside"><p>A companion for</p><div><span><Heart /> wellbeing</span><span><Salad /> nourishment</span><span><Activity /> movement</span><span><MessageCircle /> questions</span></div></section>
    <section className="care" id="care"><div><span>01 / YOUR RHYTHM</span><h2>Less information.<br /><em>More relevance.</em></h2></div><div><p>See the complete Maya experience with sample information, including a journey-aware dashboard, plans and Ask Maya.</p><button className="sample-link" onClick={preview} disabled={busy}>Explore a sample week <MoveUpRight /></button></div></section>
  </main>;
}

export function Onboarding({
  back,
  done,
  initialError = "",
}: {
  back: () => void;
  done: (payload: OnboardingPayload) => Promise<OnboardingResult>;
  initialError?: string;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [journey, setJourney] = useState<"pregnant" | "postpartum">("pregnant");
  const [timelineMode, setTimelineMode] = useState<"due" | "week" | "month">("week");
  const [timelineValue, setTimelineValue] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [feeling, setFeeling] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [allergy, setAllergy] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [useSampleRecord, setUseSampleRecord] = useState(false);
  const [recordChoiceMade, setRecordChoiceMade] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(initialError);
  const [safetyResult, setSafetyResult] = useState<OnboardingResult | null>(null);
  const titles = ["Let’s start with you", "Where are you in your journey?", "Your little timeline", "Make Maya feel like yours", "Keep your care close"];
  const toggle = (item: string, list: string[], set: (x: string[]) => void) => set(list.includes(item) ? list.filter(value => value !== item) : [...list, item]);

  const timelineHint = () => {
    if (!timelineValue) return null;
    if (journey === "postpartum") return "Maya will resolve your supported postpartum week from this date.";
    if (timelineMode === "month") return `Month ${timelineValue} will remain an approximate week range. Maya will not guess a single week.`;
    if (timelineMode === "due") return "Maya will calculate the exact journey week from this due date.";
    return `Maya will use pregnancy week ${timelineValue}.`;
  };

  const submit = async () => {
    if (!timelineValue) {
      setSubmitError("Please add your week, month, due date, or birth date so Maya can resolve your timeline safely.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSafetyResult(null);
    try {
      const result = await done({
        name: name.trim(),
        journey,
        timeline_mode: journey === "postpartum" ? "birth_date" : timelineMode,
        timeline_value: timelineValue,
        diets: diet,
        allergies: [...allergy, ...(otherAllergy.trim() ? [otherAllergy.trim()] : [])],
        symptoms: [...feeling, ...(otherSymptom.trim() ? [otherSymptom.trim()] : [])],
        use_fictional_sample_record: useSampleRecord,
      });
      if (result.safety_blocked) setSafetyResult(result);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Maya could not complete onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="onboarding">
    <aside>
      <Brand light onClick={back} />
      <div className="aside-copy"><span>YOUR SPACE, YOUR PACE</span><h2>Care should feel<br /><em>personal.</em></h2><p>A few sample details help Maya surface what matters now—and quietly leave the rest aside.</p></div>
      <div className="flower"><i /><i /><i /><i /><span /></div>
      <p className="private"><ShieldCheck /> Use sample information in this preview. Do not upload personal medical records.</p>
    </aside>
    <section className="onboard-main">
      <header><button onClick={step ? () => { setSubmitError(""); setStep(step - 1); } : back}><ArrowLeft /> Back</button><div className="onboard-meta"><ProductPreviewBadge /><span>0{step + 1} <i /> 05</span></div></header>
      <Progress value={(step + 1) * 20} />
      <div className="onboard-content" key={step}>
        <span>A little about you</span><h1>{titles[step]}</h1>
        {step === 0 ? <div className="field"><label htmlFor="name">What should we call you? <small>(optional)</small></label><Input id="name" value={name} onChange={event => setName(event.target.value)} autoFocus /><p>You can continue without adding a name.</p></div> : null}
        {step === 1 ? <RadioGroup value={journey} onValueChange={value => { setJourney(value as "pregnant" | "postpartum"); setTimelineValue(""); }} className="journey-list">
          {[
            { v: "pregnant", icon: Baby, t: "I’m pregnant", d: "Explore weekly growth, nutrition, movement and wellbeing." },
            { v: "postpartum", icon: Heart, t: "I’m postpartum", d: "Explore recovery, feeding, nourishment and wellbeing." },
          ].map(({ v, icon: Icon, t, d }) => <label key={v} className={journey === v ? "selected" : ""}><RadioGroupItem value={v} /><i><Icon /></i><p><b>{t}</b><small>{d}</small></p><Check /></label>)}
        </RadioGroup> : null}
        {step === 2 ? <div className="timeline-field">
          {journey === "postpartum" ? <>
            <label htmlFor="birth-date">When was your baby born?</label>
            <Input id="birth-date" type="date" value={timelineValue} onChange={event => setTimelineValue(event.target.value)} />
          </> : <>
            <label>How would you like to add your timeline?</label>
            <div className="timeline-modes">{([["week", "Current week"], ["month", "Current month"], ["due", "Due date"]] as const).map(([value, label]) => <button type="button" key={value} className={timelineMode === value ? "active" : ""} onClick={() => { setTimelineMode(value); setTimelineValue(""); }}>{label}</button>)}</div>
            <Input
              aria-label={timelineMode === "due" ? "Estimated due date" : timelineMode === "week" ? "Current pregnancy week" : "Current pregnancy month"}
              type={timelineMode === "due" ? "date" : "number"}
              min="1"
              max={timelineMode === "week" ? "41" : "9"}
              placeholder={timelineMode === "week" ? "e.g. 26" : timelineMode === "month" ? "e.g. 6" : undefined}
              value={timelineValue}
              onChange={event => setTimelineValue(event.target.value)}
            />
          </>}
          {timelineHint() ? <article className="timeline-reveal range-reveal"><div className="date-ring"><span>{journey === "postpartum" ? <Heart /> : <Baby />}<small>{timelineMode === "month" ? "range" : "timeline"}</small></span></div><div><span>JOURNEY RESOLVER</span><h3>{timelineMode === "month" ? "A range, never a guessed week." : "Your timing stays explicit."}</h3><p>{timelineHint()}</p></div></article> : null}
        </div> : null}
        {step === 3 ? <div className="preferences">
          <div><label>Food preferences <small>(optional)</small></label><div className="chips">{diets.map(item => <label key={item} className={diet.includes(item) ? "selected" : ""}><Checkbox checked={diet.includes(item)} onCheckedChange={() => toggle(item, diet, setDiet)} />{item}</label>)}</div></div>
          <div><label>Food allergies or ingredients to avoid <small>(optional)</small></label><div className="chips">{allergies.map(item => <label key={item} className={allergy.includes(item) ? "selected" : ""}><Checkbox checked={allergy.includes(item)} onCheckedChange={() => toggle(item, allergy, setAllergy)} />{item}</label>)}</div><Input aria-label="Other allergy" value={otherAllergy} onChange={event => setOtherAllergy(event.target.value)} placeholder="Add another sample allergy (optional)" /></div>
          <div><label>Symptoms you’re noticing <small>(optional; checked before continuing)</small></label><div className="chips">{symptoms.map(item => <label key={item} className={feeling.includes(item) ? "selected" : ""}><Checkbox checked={feeling.includes(item)} onCheckedChange={() => toggle(item, feeling, setFeeling)} />{item}</label>)}</div><Input aria-label="Other symptom" value={otherSymptom} onChange={event => setOtherSymptom(event.target.value)} placeholder="Describe another sample symptom (optional)" /></div>
        </div> : null}
        {step === 4 ? <div className="upload">
          <button type="button" className={recordChoiceMade && useSampleRecord ? "selected" : ""} onClick={() => { setUseSampleRecord(true); setRecordChoiceMade(true); }}><i><FileHeart /></i><b>Use the fictional sample care record</b><small>Includes one sample appointment and one record-only supplement.</small><em>{recordChoiceMade && useSampleRecord ? <><Check /> Added</> : <><Plus /> Add sample</>}</em></button>
          <button type="button" className={recordChoiceMade && !useSampleRecord ? "selected no-record-choice" : "no-record-choice"} onClick={() => { setUseSampleRecord(false); setRecordChoiceMade(true); }}><i><ArrowRight /></i><b>Continue without a care record</b><small>General questions and Ask Maya remain available. Maya will say when context is missing.</small><em>{recordChoiceMade && !useSampleRecord ? <><Check /> Selected</> : "Choose"}</em></button>
          <p><ShieldCheck /> Real medical-file upload is unavailable until authenticated private storage, scanning, extraction and confirmation are implemented.</p>
        </div> : null}
        {submitError || initialError ? <StatusPanel tone="error" title="Please check this step" message={submitError || initialError} action={() => void submit()} actionLabel="Retry" /> : null}
        {safetyResult ? <StatusPanel
          tone="safety"
          title={safetyResult.symptom_checks.some(item => item.route === "urgent") ? "Please act on this now" : "Maya needs one safety detail first"}
          message={safetyResult.symptom_checks.filter(item => !item.ordinary_generation_allowed).map(item => item.message).join(" ")}
        /> : null}
      </div>
      <footer>
        <span>Sample information only</span>
        <Button disabled={submitting} onClick={() => step === 4 ? void submit() : setStep(step + 1)}>{submitting ? "Checking safety…" : step === 4 ? "Open my Maya" : "Continue"} <ArrowRight /></Button>
      </footer>
    </section>
  </main>;
}
