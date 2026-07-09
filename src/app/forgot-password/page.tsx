import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your FoodVault member or partner account password.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
