import type { Metadata } from "next";
import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your FoodVault account.",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
