/**
 * Creates (or resets the password of) a staff account for /admin.
 *
 *   npm run admin:create -- staff@example.com "Full Name"
 *
 * Prints a generated password once; the person changes it after first login.
 * Public sign-up stays disabled, so this is the only way accounts are made.
 */
import { randomBytes } from "node:crypto";

try {
  process.loadEnvFile();
} catch {}

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(" ").trim();
  if (!email || !email.includes("@") || !name) {
    console.error('Usage: npm run admin:create -- <email> "<full name>"');
    process.exit(1);
  }

  const { auth } = await import("../lib/auth");
  const { getPool } = await import("../lib/db/pool");
  const ctx = await auth.$context;
  const password = randomBytes(12).toString("base64url");
  const hash = await ctx.password.hash(password);

  const existing = await ctx.internalAdapter.findUserByEmail(email.toLowerCase());
  if (existing) {
    await ctx.internalAdapter.updatePassword(existing.user.id, hash);
    console.log(`Password reset for ${email}`);
  } else {
    const user = await ctx.internalAdapter.createUser({
      email: email.toLowerCase(),
      name,
      emailVerified: true,
    }, { method: "admin" });
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
    console.log(`Created admin ${name} <${email}>`);
  }
  console.log(`Temporary password: ${password}`);
  await getPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
