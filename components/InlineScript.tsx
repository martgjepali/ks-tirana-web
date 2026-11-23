"use client";

/**
 * A <script> that runs once, during the initial HTML parse.
 *
 * On the server it is emitted as type="text/javascript" so the browser runs it
 * before first paint. When React renders it in the browser (hydration, or a
 * client navigation that re-renders the root layout, e.g. switching language)
 * it becomes type="text/plain": inert, and React no longer warns about
 * "Encountered a script tag while rendering React component".
 * Must be a Client Component so `typeof window` differs between the two.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
