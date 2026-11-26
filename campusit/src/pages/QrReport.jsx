import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Camera, CheckCircle2, ClipboardPlus, Monitor, QrCode, ShieldCheck, StopCircle } from "lucide-react";
import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { CATS, HOW, IMP, MX, URG, WHO } from "@/lib/data";
import { useApp } from "@/store";

/* Demonstration asset register. Production implementation would query a validated asset service. */
export const ASSETS = [
  { id: "PC-024", type: "Desktop Computer", room: "CSS Laboratory 2", condition: "Operational", repairs: 1, cost: 1250 },
  { id: "PC-031", type: "Desktop Computer", room: "CSS Laboratory 1", condition: "Needs Inspection", repairs: 3, cost: 3100 },
  { id: "PROJ-04", type: "Projector", room: "Room 204", condition: "Under Repair", repairs: 2, cost: 4200 },
  { id: "PRN-02", type: "Printer", room: "Library 2F", condition: "Operational", repairs: 1, cost: 450 },
];

export function extractAssetId(value) {
  const txt = String(value || "").trim();
  try {
    const uri = new URL(txt);
    const fromSearch = uri.searchParams.get("asset");
    const fromHash = new URLSearchParams((uri.hash.split("?")[1] || "")).get("asset");
    return (fromSearch || fromHash || "").toUpperCase();
  } catch { return txt.toUpperCase(); }
}

export default function QrReport() {
  const [search] = useSearchParams();
  const nav = useNavigate();
  const { createTicket } = useApp();
  const [assetId, setAssetId] = useState(() => extractAssetId(search.get("asset") || ""));
  const [manual, setManual] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("Computer & Hardware");
  const [imp, setImp] = useState(2);
  const [urg, setUrg] = useState(0);
  const [exam, setExam] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [quickFixes, setQuickFixes] = useState(false);
  const [triedFixes, setTriedFixes] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const activeRef = useRef(false);
  const reqRef = useRef(null);
  const asset = ASSETS.find((x) => x.id === assetId);

  const stopCamera = () => {
    activeRef.current = false;
    if (reqRef.current != null) cancelAnimationFrame(reqRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };
  useEffect(() => () => {
    activeRef.current = false;
    if (reqRef.current != null) cancelAnimationFrame(reqRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const scan = async () => {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera QR scanning is not supported here. Enter an asset ID or use the demonstration asset below.");
      return;
    }
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      activeRef.current = true;
      setScanning(true);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      // React attaches the video after setScanning; wait for the next frame.
      const tick = async () => {
        if (!activeRef.current) return;
        const video = videoRef.current;
        if (video && video.srcObject !== stream) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        if (video?.readyState >= 2) {
          try {
            const codes = await detector.detect(video);
            if (codes.length) {
              const id = extractAssetId(codes[0].rawValue);
              if (ASSETS.some((x) => x.id === id)) { setAssetId(id); stopCamera(); return; }
              setError(`The scanned asset (${id || "unknown"}) is not in the demonstration register.`);
            }
          } catch { /* Camera frame may not be ready yet. */ }
        }
        reqRef.current = requestAnimationFrame(tick);
      };
      reqRef.current = requestAnimationFrame(tick);
    } catch { stopCamera(); setError("Camera permission unavailable. Use manual entry or the demo asset."); }
  };

  const submit = () => {
    if (!asset || !subject.trim() || !desc.trim()) { setError("Choose a registered asset and enter the issue title and description."); return; }
    const item = createTicket({
      subject: subject.trim(), desc: desc.trim(), cat, imp, urg,
      loc: asset.room, dev: asset.type, assetId: asset.id, assetType: asset.type,
      source: "QR equipment report", exam,
    });
    stopCamera();
    setCreated(item);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1>Report equipment issue</h1><p className="text-mu">Scan the asset label, confirm the problem, and send a ticket to campus IT.</p></div>
        <Link className="text-acx hover:underline" to="/tickets">View my tickets</Link>
      </div>
      {created ? (
        <Section title="Report submitted"><Body className="gap-3">
          <div className="flex items-center gap-2 text-ok"><CheckCircle2 className="size-5" /><b>Ticket {created.id} created and sent to the IT work queue.</b></div>
          <p>Asset: <b>{created.assetId}</b> · Location: <b>{created.loc}</b> · Priority: <b>P{created.p}</b> · Team: <b>{created.tier}</b></p>
          <p className="text-mu">The administrator receives a new-ticket notification through the existing in-memory workflow. Switch the demo role to Tier 1 or Tier 2 to inspect it.</p>
          <div className="flex flex-wrap gap-2"><Button variant="primary" onClick={() => nav(`/tickets/${created.id}`)}>Track ticket progress</Button><Button onClick={() => { setCreated(null); setSubject(""); setDesc(""); setQuickFixes(false); setTriedFixes(false); }}>Report another issue</Button></div>
        </Body></Section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
          <Section title="1 · Identify equipment"><Body className="gap-3">
            <div className="flex flex-wrap gap-2"><Button variant="primary" onClick={scanning ? stopCamera : scan}>{scanning ? <StopCircle className="size-4" /> : <Camera className="size-4" />}{scanning ? "Stop camera" : "Scan QR code"}</Button><Button onClick={() => { stopCamera(); setAssetId("PC-024"); setError(""); }}><QrCode className="size-4" /> Use demo: PC-024</Button></div>
            {scanning && <video ref={videoRef} className="max-h-60 w-full rounded-lg border border-bd object-cover" autoPlay muted playsInline aria-label="QR scanner camera preview" />}
            <img className="mx-auto h-36 w-36 rounded-md bg-white p-2" src="/assets/pc-024-qr.png" alt="Scannable sample equipment QR code for PC-024" />
            <p className="text-center text-xs text-mu">Sample printed equipment tag: PC-024</p>
            <Field label="Enter asset ID or QR link"><div className="flex gap-2"><Input value={manual} onChange={e => setManual(e.target.value)} placeholder="PC-024 or QR URL" /><Button onClick={() => { const id = extractAssetId(manual); setAssetId(id); setError(""); }}>Find</Button></div></Field>
            {asset ? <div className="rounded-lg border border-bd bg-b2 p-3"><div className="flex items-center gap-2 font-semibold"><Monitor className="size-4 text-acx" />{asset.id} · {asset.type}</div><div className="mt-1 text-mu">{asset.room} · {asset.condition}</div><div className="mt-2 flex items-center gap-1 text-xs text-ok"><ShieldCheck className="size-4" />Matched demo asset register</div></div> : <p className="text-mu">Choose or scan an equipment tag to load its location automatically.</p>}
            {error && <p role="alert" className="text-err">{error}</p>}
          </Body></Section>
          <Section title="2 · Describe the issue"><Body className="gap-3">
            <Field label="Asset ID"><Input value={asset?.id || "No asset selected"} disabled /></Field>
            <Field label="Building / room"><Input value={asset?.room || "Select asset first"} disabled /></Field>
            <Field label="Equipment type"><Input value={asset?.type || "Select asset first"} disabled /></Field>
            <Field label="Issue category"><Select value={cat} onChange={e => setCat(e.target.value)}>{CATS.map(x => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Issue title"><Input value={subject} maxLength={120} onChange={e => setSubject(e.target.value)} placeholder="Example: Computer will not turn on" /></Field>
            <Field label="Description"><Textarea value={desc} rows={3} onChange={e => setDesc(e.target.value)} placeholder="Explain what happened and what you already tried" /></Field>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Who is affected?"><Select value={imp} onChange={e => setImp(+e.target.value)}>{WHO.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select></Field><Field label="How urgent?"><Select value={urg} onChange={e => setUrg(+e.target.value)}>{HOW.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select></Field></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={exam} onChange={e => setExam(e.target.checked)} /> Exam or thesis defense in progress</label>
            <p className="text-xs text-mu">Preview: P{MX[imp][urg]} · {IMP[imp]} impact × {URG[urg]} urgency. Exam flag is recorded for IT review; it does not silently change Glen's approved SLA rules.</p>
            {!exam && !quickFixes && <Button variant="primary" disabled={!asset || !subject.trim() || !desc.trim()} onClick={() => setQuickFixes(true)}>Review Tier 0 quick fixes</Button>}
            {quickFixes && !exam && <div className="rounded-lg border border-ac/40 bg-b2 p-3">
              <b>Tier 0 · Try these safe checks first</b>
              <ol className="mt-2 ml-5 list-decimal space-y-1 text-mu">
                <li>Confirm the equipment is safely plugged in and switched on, without opening or repairing it.</li>
                <li>Check for a visible error message and record exactly what it says.</li>
                <li>If safe and permitted, reconnect the display or peripheral cable once. Do not attempt electrical repairs.</li>
              </ol>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => { setTriedFixes(false); setQuickFixes(false); setError("Issue resolved through Tier 0. No ticket is necessary."); }}>Problem resolved</Button>
                <Button variant="primary" onClick={() => setTriedFixes(true)}>Still need IT help</Button>
              </div>
            </div>}
            {(exam || triedFixes) && <Button variant="primary" disabled={!asset || !subject.trim() || !desc.trim()} onClick={submit}><ClipboardPlus className="size-4" /> Submit ticket to IT</Button>}
            {exam && <p className="text-xs text-wr">Exam/defense context: self-service is bypassed for timely IT review. Staff will verify the appropriate priority.</p>}
          </Body></Section>
        </div>
      )}
      <p className="text-xs text-mu">Prototype only: QR camera access depends on browser support and permission. Tickets are stored in memory and reset on reload. No real university systems are modified.</p>
    </>
  );
}
