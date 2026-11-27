import { Section, Body } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Chip } from "@/components/Badges";
import { Metrics } from "@/components/Metrics";
import { RPA_STEPS } from "@/lib/data";
import { useApp } from "@/store";
import { cn } from "@/lib/utils";

const RULES = ["Trigger: ticket category is Account & Password and the ticket is not resolved", "Check 1: student ID and registered phone match the account record", "Check 2: no more than 2 resets in the last 24 hours; account not suspended", "Human control: an agent must approve before any credential is changed", "Exception: any failed check stops the bot, changes nothing and returns the ticket to the agent"];

/** Simulated, rules-based RPA workflow (password reset). No real systems are touched. */
export default function Rpa() {
  const { rpa: r, rpaId, runRpa, setRpaFail } = useApp();
  const done = Math.round((r.pct * 6) / 100), failed = r.state === "Needs human review", idle = !rpaId;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1>Automation</h1><p className="text-mu">Password-reset bot: removes a repetitive Tier 1 task.</p></div>
        <Chip c="#D97706">Simulated RPA workflow · demo data</Chip>
      </div>
      <Section title="Why automate this">
        <Body className="gap-1"><p>Password resets are high-volume, rules-based and identical every time. Manual handling takes about 6 minutes of agent time; the bot takes about 40 seconds, with the agent only approving.</p></Body>
      </Section>
      <Section title="Bot rules">
        <Body className="gap-1">{RULES.map((x) => <p key={x} className="text-mu">• {x}</p>)}</Body>
      </Section>
      {idle ? (
        <Section><Body><p className="text-mu">No run yet. Open a password-reset ticket (for example CIT-2026-1039) in the Agent Workspace and select “Trigger password-reset bot”.</p></Body></Section>
      ) : (
        <>
          <Section title="Password reset">
            <div className="flex flex-wrap items-center gap-1 px-4 py-3">
              {RPA_STEPS.map((n, i) => (
                <span key={n} className="flex items-center gap-1">
                  <span className={cn("rounded-md border border-bd2 bg-sf px-2.5 py-1 text-xs", i < done && "border-ok text-ok", failed && i === done && "border-er text-er", r.state === "Running" && i === done && "border-ac bg-acs text-acx")}>{n}</span>
                  {i < 5 && <i className="h-px w-4 bg-bd2" />}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 px-4 pb-3">
              <Button variant="primary" disabled={r.state !== "Awaiting approval"} onClick={runRpa}>Approve &amp; run bot</Button>
              <label className="flex items-center gap-2 text-xs text-mu"><Switch checked={r.fail} disabled={r.state !== "Awaiting approval"} onCheckedChange={setRpaFail} aria-label="Simulate identity mismatch" />Demo control: simulate identity mismatch</label>
            </div>
            {failed && <p className="px-4 pb-3 text-er">Bot stopped at identity verification. No changes were made. The ticket is back with the agent for manual verification.</p>}
          </Section>
          <Metrics items={[["Bot status", <span key="s" className={failed ? "text-er" : r.state === "Completed" ? "text-ok" : ""}>{r.state}</span>], ["Ticket", rpaId], ["Progress", r.pct + "%"], ["Manual vs bot", "6 min vs 40 s"]]} />
          <Section title="Execution log">
            <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Time</th><th>Step</th><th>Detail</th><th>Result</th></tr></thead>
              <tbody>{r.log.map((l, i) => <tr key={i}><td>{l[0]}</td><td>{l[1]}</td><td className="text-mu">{l[2]}</td><td className={l[3] === "Failed" ? "text-er" : "text-ok"}>{l[3]}</td></tr>)}</tbody></table></div>
          </Section>
        </>
      )}
    </>
  );
}
