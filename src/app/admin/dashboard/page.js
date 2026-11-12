import ProtectedDashboard from "./ProtectedDashboard";
import DashboardContent from "./DashboardContent";

export default function AdminDashboardPage() {
  return (
    <ProtectedDashboard>
      <DashboardContent />
    </ProtectedDashboard>
  );
}