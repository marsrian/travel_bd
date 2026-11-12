
import ProtectedDashboard from "../ProtectedDashboard";
import EventsManagement from "./EventsManagement";

export default function EventsPage() {
  return (
    <ProtectedDashboard>
      <EventsManagement />
    </ProtectedDashboard>
  );
}
