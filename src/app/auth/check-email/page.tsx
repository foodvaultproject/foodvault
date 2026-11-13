import type { Metadata } from "next";
import { CheckEmailPage } from "@/components/auth/CheckEmailPage";

type CheckEmailSearch = Promise<{ brand?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: CheckEmailSearch;
}): Promise<Metadata> {
  const { brand } = await searchParams;
  if (brand === "stockup") {
    return {
      title: "Verify your email",
      description: "Confirm your StockUp email address to continue.",
    };
  }

  return {
    title: "Verify your email",
    description: "Confirm your FoodVault email address to continue.",
  };
}

export default function AuthCheckEmailPage() {
  return <CheckEmailPage />;
}
