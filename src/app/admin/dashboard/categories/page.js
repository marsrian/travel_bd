import CategoriesManagement from "./CategoriesManagement";
import ProtectedDashboard from "../ProtectedDashboard";
export const metadata = {
  title: "Categories Management | Admin",
};

export default function CategoriesPage() {
  return (
    <ProtectedDashboard>
      <CategoriesManagement />
    </ProtectedDashboard>
  );
}
