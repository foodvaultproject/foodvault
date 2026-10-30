"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import { getAdminWorkspace } from "@/lib/admin/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

const CUSTOMER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanName(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().slice(0, 80);
}

export async function updateStockUpCustomerAction(formData: FormData) {
  await requireAdminUser();
  if ((await getAdminWorkspace()) !== "stockup") {
    redirect("/admin");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!CUSTOMER_ID.test(id)) redirect("/admin/customers");
  const firstName = cleanName(formData.get("firstName"));
  const lastName = cleanName(formData.get("lastName"));
  const country = cleanName(formData.get("country")) || "New Zealand";
  if (!firstName || !lastName) {
    redirect(`/admin/customers/${id}?error=name`);
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(`/admin/customers/${id}?error=config`);
  }

  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error || !data.user || data.user.user_metadata?.signup_mode !== "stockup") {
    redirect("/admin/customers");
  }

  const metadata = {
    ...(data.user.user_metadata ?? {}),
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    country,
    signup_mode: "stockup",
  };

  const { error: updateError } = await admin.auth.admin.updateUserById(id, {
    user_metadata: metadata,
  });
  if (updateError) {
    redirect(`/admin/customers/${id}?error=save`);
  }

  await admin
    .from("members")
    .update({
      first_name: firstName,
      last_name: lastName,
      full_name: metadata.full_name,
      country,
      location: country,
    })
    .or(`auth_user_id.eq.${id},id.eq.${id}`);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect(`/admin/customers/${id}?saved=1`);
}
