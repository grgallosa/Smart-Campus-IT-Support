import { Section } from "@/components/ui/card";
import TicketsTable from "@/components/TicketsTable";
import { useApp } from "@/store";
import { WHO_ME } from "@/lib/data";

export default function MyTickets() {
  const { tickets, role } = useApp();
  return (
    <>
      <div><h1>My tickets</h1><p className="text-mu">Open one to see its status, conversation and SLA.</p></div>
      <Section><TicketsTable rows={tickets.filter((t) => t.who === WHO_ME[role])} /></Section>
    </>
  );
}
