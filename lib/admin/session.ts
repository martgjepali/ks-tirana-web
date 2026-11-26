import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * The signed-in staff member, or a redirect to the login page.
 * Every admin page and every admin Server Action calls this first:
 * the check happens on the server, never only in the UI.
 */
export const requireStaff = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/hyrje");
  return session.user;
});

/** Same check without redirecting (login page). */
export const currentStaff = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});
