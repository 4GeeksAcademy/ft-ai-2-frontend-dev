"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createBook } from "@/db";
import type { FormState } from "@/components/form/FormField";

/**
 * Fallback cover image when the user does not provide one.
 *
 * The `.png` extension is required: without it placehold.co serves an SVG,
 * which next/image blocks unless `dangerouslyAllowSVG` is enabled.
 */
function placeholderCover(title: string): string {
  return `https://placehold.co/200x300/1e293b/f8fafc.png?text=${encodeURIComponent(title)}`;
}

/**
 * Server action that validates the create-book form and saves the new book.
 *
 * On success it refreshes the library list and redirects there. On failure it
 * returns an error message for the form to display.
 */
export async function createBookAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cover_img = String(formData.get("cover_img") ?? "").trim();

  if (!title) {
    return { error: "Please enter a title." };
  }

  await createBook({
    title,
    description,
    cover_img: cover_img || placeholderCover(title),
  });

  revalidatePath("/library");
  redirect("/library");
}
