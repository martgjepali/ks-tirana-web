import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getPool } from "./db/pool";

/**
 * Admin login. Users and sessions live in our own Postgres (tables from
 * db/migrations), so nothing depends on a hosted auth service.
 * Public sign-up is disabled; staff accounts are created by an admin
 * (/admin/perdoruesit or `npm run admin:create`).
 */

/** Addresses the site is served from: BETTER_AUTH_URL plus Vercel's deployment, branch and production domains. */
const origins = [
  process.env.BETTER_AUTH_URL,
  process.env.APP_URL,
  ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`),
].filter((o): o is string => Boolean(o));

export const auth = betterAuth({
  database: getPool(),
  baseURL: process.env.BETTER_AUTH_URL ?? origins[0],
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [...new Set(origins)],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day while active
  },
  plugins: [nextCookies()], // must stay last
});

export type Session = typeof auth.$Infer.Session;
