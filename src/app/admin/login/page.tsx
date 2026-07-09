import { redirectIfAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  await redirectIfAdminAuthenticated();
  return <AdminLoginForm />;
}
