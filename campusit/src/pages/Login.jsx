import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, ShieldCheck, QrCode, MonitorCheck, LogIn, ScanLine, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { U, useApp } from "@/store";
import { CAMPUS_DEMO, lookupCampusIdentity } from "@/lib/campusIdentity";
import { useTheme } from "@/lib/hooks";
import { cn } from "@/lib/utils";

// Real QR patterns encoding fictional identifiers. They are not authentication secrets.
const PATTERNS = [
  ["111111101000001111111","100000100000001000001","101110100101101011101","101110101000101011101","101110101010101011101","100000101000101000001","111111101010101111111","000000001011100000000","100010111100111111001","001101011110111010111","011111101111010100101","011011011011000011101","100000100100100000011","000000001000001010010","111111101001010010000","100000100101010110101","101110101101111101110","101110100111100010111","101110100000110011000","100000100001110111101","111111101011111101111"],
  ["111111100110001111111","100000101001101000001","101110100111101011101","101110100000101011101","101110101110101011101","100000100011001000001","111111101010101111111","000000000101100000000","101010100100100010010","101110010011000001010","110101110010111111000","010111001111011001111","011000101100100010001","000000001110111111111","111111100000101111101","100000100101101100111","101110101110100111100","101110100111111111010","101110101111111110101","100000100010101101111","111111101101100111101"],
];
function SampleQR({ index, label }) {
  return <svg viewBox="0 0 29 29" className="mx-auto h-24 w-24 rounded-md bg-white" role="img" aria-label={label} shapeRendering="crispEdges">
    <rect width="29" height="29" fill="white" />
    {PATTERNS[index].map((row, y) => [...row].map((cell, x) => cell === "1" ? <rect key={x + "-" + y} x={x+4} y={y+4} width="1" height="1" fill="#111827" /> : null))}
  </svg>;
}

export default function Login() {
  const [identity, setIdentity] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [staff, setStaff] = useState("t");
  const [showStaff, setShowStaff] = useState(false);
  const { signInCampus, signInStaff, recordCampusDenial } = useApp();
  const location = useLocation(), navigate = useNavigate();
  useTheme();
  const assetLink = location.pathname === "/report";
  const videoRef = useRef(null), streamRef = useRef(null), frameRef = useRef(null), runRef = useRef(0);
  const stop = () => {
    runRef.current++;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stop(), []);
  const stopCamera = () => { stop(); setScanning(false); };
  const readToken = raw => {
    stopCamera(); setError(""); setIdentity(null); setManual("");
    const result = lookupCampusIdentity(raw);
    if (!result.ok) {
      recordCampusDenial();
      setError(result.reason === "inactive" ? "This sample campus membership is inactive. Contact university IT." : "Campus identity not recognized. Use an authorized demo ID; equipment QR tags cannot sign you in.");
      return;
    }
    setIdentity(result.record);
  };
  const startCamera = async () => {
    stopCamera(); setIdentity(null); setError("");
    if (!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera QR scanning is unavailable in this browser. Use a sample ID or enter its demo code below.");
      return;
    }
    const run = ++runRef.current;
    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (run !== runRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream; setScanning(true);
      const tick = async () => {
        if (run !== runRef.current) return;
        const video = videoRef.current;
        if (video && video.srcObject !== stream) { video.srcObject = stream; await video.play().catch(() => {}); }
        if (run !== runRef.current) return;
        if (video?.readyState >= 2) {
          try {
            const codes = await detector.detect(video);
            if (run !== runRef.current) return;
            if (codes.length) { readToken(codes[0].rawValue); return; }
          } catch { /* retry the next frame */ }
        }
        if (run === runRef.current) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch {
      if (run === runRef.current) { stopCamera(); setError("Camera access unavailable. Use a sample ID or enter its demo code."); }
    }
  };
  const verify = () => {
    if (identity && signInCampus(identity.token, true)) navigate(assetLink ? location.pathname + location.search : "/", { replace: true });
  };
  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-tx sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="rounded-xl bg-acs p-3"><MonitorCheck className="size-7 text-acx" /></div>
          <div><h1 className="text-xl font-semibold">CampusCare AI</h1><p className="text-xs text-mu">Smart campus IT support</p></div>
        </div>
        <section className="space-y-4 rounded-xl border border-bd bg-sf p-5 shadow-lg sm:p-7">
          <div><h2 className="text-xl font-semibold">Scan your campus ID</h2><p className="mt-1 text-sm text-mu">Enrolled students and authorized faculty. No separate registration required.</p></div>
          {assetLink && <div className="flex items-start gap-2 rounded-lg border border-ac/40 bg-acs p-3 text-sm"><QrCode className="size-5 shrink-0 text-acx" /><span>Your equipment report link is ready. Verify your campus identity to continue.</span></div>}
          {identity ? <div className="space-y-3 rounded-lg border border-ok bg-b2 p-4">
            <div className="flex items-center gap-2 text-ok"><ShieldCheck className="size-5" /><b>Active demo campus record matched</b></div>
            <div><b>{identity.name}</b><p className="text-sm text-mu">Role assigned automatically: {U[identity.role][1]}</p></div>
            <p className="text-xs text-mu">This simulates confirmation of a trusted campus sign-in. A real static ID QR is not proof of identity.</p>
            <Button variant="primary" className="h-11 w-full justify-center" onClick={verify}><LogIn className="size-4" /> Simulate verification &amp; continue</Button>
            <Button className="w-full justify-center" onClick={() => setIdentity(null)}>Scan another ID</Button>
          </div> : <>
            <div className="rounded-xl border border-bd bg-b2 p-4 text-center">
              {scanning ? <video ref={videoRef} autoPlay muted playsInline className="mx-auto max-h-64 w-full rounded-lg object-cover" aria-label="Campus ID camera preview" /> : <ScanLine className="mx-auto mb-3 size-12 text-acx" aria-hidden="true" />}
              <Button variant="primary" className="mt-2 h-12 w-full justify-center" onClick={scanning ? stopCamera : startCamera}>{scanning ? <StopCircle className="size-5" /> : <Camera className="size-5" />}{scanning ? "Stop camera" : "Scan university ID QR"}</Button>
              <p className="mt-2 text-xs text-mu">Use fictional demo IDs only, not your real university card.</p>
            </div>
            {error && <div role="alert" className="rounded-lg border border-er p-3 text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              {CAMPUS_DEMO.slice(0,2).map((record, index) => <div key={record.token} className="rounded-lg border border-bd p-3 text-center">
                <SampleQR index={index} label={"Sample " + U[record.role][1] + " identity QR"} />
                <p className="my-2 text-xs font-medium">{U[record.role][1]} demo ID</p>
                <Button className="w-full justify-center" onClick={() => readToken(record.token)}>Use sample ID</Button>
              </div>)}
            </div>
            <details className="rounded-lg border border-bd p-3">
              <summary className="cursor-pointer text-sm font-medium">Camera unavailable? Enter a demo code</summary>
              <form className="mt-3 flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); readToken(manual); }}>
                <Input aria-label="Fictional campus demo code" className="min-w-36 flex-1" value={manual} onChange={e => setManual(e.target.value)} placeholder="CCAI-DEMO-STUDENT-01" autoComplete="off" maxLength={80} />
                <Button type="submit">Check code</Button>
              </form>
              <p className="mt-2 text-xs text-mu">Sample: CCAI-DEMO-STUDENT-01 or CCAI-DEMO-FACULTY-01.</p>
              <Button variant="link" className="mt-2" onClick={() => readToken(CAMPUS_DEMO[2].token)}>Test inactive account</Button>
            </details>
          </>}
          <div className="border-t border-bd pt-3">
            <Button variant="link" onClick={() => { stopCamera(); setIdentity(null); setError(""); setShowStaff(!showStaff); }} aria-expanded={showStaff}>IT personnel · Staff demo sign-in</Button>
            {showStaff && <div className="mt-3 space-y-3 rounded-lg border border-bd p-3">
              <p className="text-xs text-mu">For the presentation only. Production staff accounts require separate administrator-controlled authentication.</p>
              {["t","u","a"].map(key => <label key={key} className={cn("flex cursor-pointer items-center gap-2 rounded-md border border-bd p-2", staff === key && "bg-acs border-ac")}><input type="radio" name="staff-demo" checked={staff === key} onChange={() => setStaff(key)} />{U[key][1]} · {U[key][0]}</label>)}
              <Button className="w-full justify-center" onClick={() => { if (signInStaff(staff)) navigate("/", { replace: true }); }}>Enter staff demo</Button>
            </div>}
          </div>
          <p className="flex items-start gap-2 text-xs text-mu"><ShieldCheck className="size-4 shrink-0 text-ok" />Prototype only: fictional records, simulated verification, no real credentials, no campus database. A production service must verify identity and enforce permissions on the server.</p>
          <p className="text-xs text-mu">Immediate electrical danger? Stop using the equipment, move away, and alert campus personnel directly. Do not wait to sign in.</p>
        </section>
      </div>
    </main>
  );
}
