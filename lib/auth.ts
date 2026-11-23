import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getPool } from "./db/pool";

/**
 * Admin login. Users and sessions live in our own Postgres (tables from
 * db/migrations), so nothing depends on a hosted auth service.
 * Public sign-up is disabled; staff accounts are created by an admin.
 */
export const auth = betterAuth({
  database: getPool(),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.AUTH_ALLOW_SIGNUP !== "true",
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day while active
  },
  plugins: [nextCookies()], // must stay last
});

export type Session = typeof auth.$Infer.Session;
