import ProtectedDashboard from "../ProtectedDashboard";
import DistrictsManagement from "./DistrictsManagement";

export default function DistrictsPage() {
  return (
    <ProtectedDashboard>
      <DistrictsManagement />
    </ProtectedDashboard>
  );
}