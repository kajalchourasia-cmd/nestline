"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Flower2, Paperclip, Send, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EvidenceCitation, JourneyKind, MayaDisplay } from "@/lib/maya-api";
import { Brand, PreviewFooter, StatusPanel } from "./visuals";

const provenanceLabels = [
  "Your confirmed information",
  "Your uploaded record says",
  "You reported",
  "Public guidance says",
  "Needs confirmation",
];

export function Chat({
  name,
  journey,
  journeyLabel,
  back,
  runChat,
  initialQuestion,
}: {
  name: string;
  journey: JourneyKind;
  journeyLabel: string;
  back: () => void;
  runChat: (text: string) => Promise<MayaDisplay>;
  initialQuestion?: string;
}) {
  const suggestions = journey === "postpartum"
    ? ["Show easy nourishment options", "Create a wellbeing support plan", "Questions for my next appointment"]
    : ["Show meal options", "Create a weekly movement plan", "Questions for my next appointment"];
  const [messages, setMessages] = useState<Array<{ from: "maya" | "you"; text: string; display?: MayaDisplay }>>([
    { from: "maya", text: `Hi${name ? ` ${name}` : ""}. I’m here. What’s on your mind today?` },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastFailed, setLastFailed] = useState("");
  const [drawer, setDrawer] = useState<EvidenceCitation | null>(null);
  const initialSent = useRef(false);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    const question = text.trim();
    setMessages(current => [...current, { from: "you", text: question }]);
    setInput("");
    setLastFailed("");
    setSending(true);
    try {
      const display = await runChat(question);
      setMessages(current => [...current, { from: "maya", text: display.summary, display }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Maya could not answer right now.";
      setMessages(current => [...current, { from: "maya", text: message }]);
      setLastFailed(question);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (initialQuestion && !initialSent.current) {
      initialSent.current = true;
      void send(initialQuestion);
    }
  // The first displayed suggestion is intentionally submitted once on entry.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  return <main className="chat">
    <header><button onClick={back} aria-label="Back to dashboard"><ArrowLeft /></button><Brand onClick={back} /><button onClick={back} aria-label="Close conversation"><X /></button></header>
    <section>
      <div className="chat-context"><span>{journeyLabel.toUpperCase()}</span><p>Maya uses only the sample timeline and constraints selected during onboarding. Safety runs before ordinary response generation.</p></div>
      <div className="messages" aria-live="polite">
        {messages.map((message, index) => <article className={`${message.from} ${message.display?.route === "urgent" ? "urgent-message" : ""}`} key={`${index}-${message.text.slice(0, 20)}`}>
          <i>{message.from === "maya" ? <Flower2 /> : (name[0] || "Y")}</i>
          <div>
            <p>{message.display ? <b>{message.display.title}<br /></b> : null}{message.text}</p>
            {message.display?.provenance_sections ? <div className="provenance-groups">{provenanceLabels.map(label => {
              const values = message.display?.provenance_sections[label] || [];
              return values.length ? <section key={label}><b>{label}</b>{values.map(value => <p key={value}>{value}</p>)}</section> : null;
            })}</div> : null}
            {message.display?.applied_constraints.length ? <small>Applied sample context: {message.display.applied_constraints.join(", ")}</small> : null}
            {message.display?.uncertainties.length ? <div className="chat-uncertainty"><b>Needs confirmation</b><p>{message.display.uncertainties.join(" ")}</p></div> : null}
            {message.display?.citations.length ? <div className="citation-row">{message.display.citations.map(citation => <button onClick={() => setDrawer(citation)} key={`${citation.evidence_id}-${citation.locator}`}><FileText /> {citation.evidence_id}</button>)}</div> : null}
            {message.display?.route === "urgent" ? <small><ShieldCheck /> Ordinary generation calls: {message.display.ordinary_generation_calls}</small> : null}
          </div>
        </article>)}
        {messages.length === 1 ? <div className="suggestions">{suggestions.map(question => <button onClick={() => void send(question)} key={question}>{question}<ArrowRight /></button>)}</div> : null}
        {sending ? <article className="maya loading-chat"><i><Flower2 /></i><p>Checking safety, evidence and display validation…</p></article> : null}
        {lastFailed ? <StatusPanel tone="error" title="Message not completed" message="Your question was not processed. Check the local API and retry." action={() => void send(lastFailed)} actionLabel="Retry question" /> : null}
      </div>
    </section>
    <footer><div><button aria-label="Real attachments are unavailable in Product Preview" disabled title="Real file upload is not enabled"><Paperclip /></button><Input value={input} disabled={sending} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void send(input); }} placeholder="Ask what’s on your mind…" /><Button disabled={sending || !input.trim()} onClick={() => void send(input)} aria-label="Send message"><Send /></Button></div><PreviewFooter /></footer>
    {drawer ? <aside className="evidence-drawer" aria-label="Evidence details">
      <header><div><span>{drawer.source_type === "public_fixture" ? "PUBLIC GUIDANCE" : "SAMPLE RECORD"}</span><h2>{drawer.source_title}</h2></div><button onClick={() => setDrawer(null)} aria-label="Close evidence details"><X /></button></header>
      <dl><div><dt>Publisher</dt><dd>{drawer.publisher}</dd></div><div><dt>Evidence ID</dt><dd>{drawer.evidence_id}</dd></div><div><dt>Locator</dt><dd>{drawer.locator}</dd></div><div><dt>Review status</dt><dd>{drawer.review_status}</dd></div><div><dt>Supports this claim</dt><dd>{drawer.supports_claim ? "Yes" : "No—shown as insufficient evidence"}</dd></div></dl>
      <blockquote>{drawer.supporting_passage}</blockquote>
      <p><ShieldCheck /> Product Preview evidence. Source eligibility and exact span were checked before display.</p>
    </aside> : null}
  </main>;
}
