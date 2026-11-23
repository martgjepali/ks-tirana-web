import "server-only";

/**
 * What the public may see. The database already refuses to publish a person
 * without consent; these rules make sure nothing leaks through photos either:
 *
 *   person  visible = published (which requires consent)
 *   photo   visible = published, in a published discipline, and every person
 *                     tagged in it is visible — so a group shot with even one
 *                     person without consent stays hidden.
 *
 * CONTENT_PREVIEW=true shows unpublished people while developing locally
 * (before the client's consent list arrives). It is ignored in production builds.
 */
export function isPreview() {
  return process.env.NODE_ENV === "development" && process.env.CONTENT_PREVIEW === "true";
}

/** SQL condition for a visible person row aliased `a`. */
export const personVisible = (a: string) => (isPreview() ? "true" : `${a}.is_published`);

/** SQL condition for a visible photo row aliased `a`. */
export const photoVisible = (a: string) =>
  isPreview()
    ? `${a}.is_published`
    : `${a}.is_published AND NOT EXISTS (
        SELECT 1 FROM photo_people vpp JOIN people vp ON vp.id = vpp.person_id
        WHERE vpp.photo_id = ${a}.id AND NOT vp.is_published)`;
