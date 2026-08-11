import { HomePageClientRouter } from "@/components/home/HomePageClientRouter";
import { getStaticHomepageData } from "@/lib/homepage/static-data";

export const revalidate = 86400;

export default async function Home() {
  const data = await getStaticHomepageData({});

  return <HomePageClientRouter data={data} />;
}
