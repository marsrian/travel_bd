import GuidesManagement from "./GuidesManagement";
import ProtectedDashboard from "../ProtectedDashboard";

export const metadata = {
  title: "Travel Guides Management | Admin",
};

export default function GuidesPage() {
  return (
    <ProtectedDashboard>
      <GuidesManagement />
    </ProtectedDashboard>
  );
}
