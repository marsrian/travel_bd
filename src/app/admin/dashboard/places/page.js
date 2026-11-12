import ProtectedDashboard from "../ProtectedDashboard";
import PlacesManagement from "./PlacesManagement";

export default function PlacesPage() {
  return (
    <ProtectedDashboard>
      <PlacesManagement />
    </ProtectedDashboard>
  );
}