"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createFriend } from "@/db";
import type { FormState } from "@/components/form/FormField";

/**
 * Strip a phone number down to just its digits (plus a leading "+") so it is
 * easy to format later and safe to drop into `tel:` links.
 */
function normalizePhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

/**
 * Server action that validates the create-friend form and saves the new friend.
 *
 * On success it refreshes the friends list and redirects there. On failure it
 * returns an error message for the form to display.
 */
export async function createFriendAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone_number = normalizePhoneNumber(
    String(formData.get("phone_number") ?? ""),
  );

  if (!name) {
    return { error: "Please enter a name." };
  }

  await createFriend({ name, phone_number, email });

  revalidatePath("/friends");
  redirect("/friends");
}
