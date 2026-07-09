import { SettingsForm } from "@/components/admin/SettingsForm";
import { getRecentAuditLogs, getSystemSettings } from "@/lib/admin/queries";

export default async function SettingsPage() {
  const [settings, auditLogs] = await Promise.all([getSystemSettings(), getRecentAuditLogs()]);

  return <SettingsForm settings={settings} auditLogs={auditLogs} />;
}
