import type { Metadata } from "next";
import { CheckEmailPage } from "@/components/auth/CheckEmailPage";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your FoodVault email address to continue.",
};

export default function AuthCheckEmailPage() {
  return <CheckEmailPage />;
}
