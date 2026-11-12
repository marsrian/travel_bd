import MediaManagement from "./MediaManagement";
import ProtectedDashboard from "../ProtectedDashboard";

export const metadata = {
  title: "Media Library | Admin",
};

export default function MediaPage() {
  return (
    <ProtectedDashboard>
      <MediaManagement />
    </ProtectedDashboard>
  );
}
