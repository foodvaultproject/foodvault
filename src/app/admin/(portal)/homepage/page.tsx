import { HomepageManagerClient } from "@/components/admin/HomepageManagerClient";
import {
  getHomepageFeatured,
  getLivePartnersForHomepage,
  getSystemSettings,
} from "@/lib/admin/queries";

export default async function HomepagePage() {
  const [settings, livePartners, featured, newThisWeek] = await Promise.all([
    getSystemSettings(),
    getLivePartnersForHomepage(),
    getHomepageFeatured("FEATURED_PARTNERS"),
    getHomepageFeatured("NEW_THIS_WEEK"),
  ]);

  const featuredIds = featured.map((row) => row.partner_id);
  const newWeekIds = newThisWeek.map((row) => row.partner_id);

  return (
    <HomepageManagerClient
      headline={settings.homepage_headline ?? ""}
      subheading={settings.homepage_subheading ?? ""}
      livePartners={livePartners}
      featuredPartnerIds={featuredIds}
      newThisWeekIds={newWeekIds}
    />
  );
}
