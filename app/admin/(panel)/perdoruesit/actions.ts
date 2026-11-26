"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { runWithTransaction } from "@better-auth/core/context";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/session";
import { AdminError, messageFor, required, run, str } from "@/lib/admin/form";
import { auth } from "@/lib/auth";
import { query, transaction } from "@/lib/db/pool";

export type PasswordResult = { password?: string; error?: string };
const base = "/admin/perdoruesit";
const temporaryPassword = () => randomBytes(15).toString("base64url");
const passwordField = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

export async function createStaff(_: PasswordResult, form: FormData): Promise<PasswordResult> {
  await requireStaff();
  try {
    const name = required(form, "name", "Emri");
    const email = str(form, "email").toLowerCase();
    if (name.length > 120 || email.length > 254 || !z.email().safeParse(email).success) {
      throw new AdminError("Kontrolloni emrin dhe adresën e emailit.");
    }
    const ctx = await auth.$context;
    const password = temporaryPassword();
    const hash = await ctx.password.hash(password);
    await runWithTransaction(ctx.adapter, async () => {
      const existing = await ctx.internalAdapter.findUserByEmail(email);
      if (existing) throw new AdminError("Ky email është në përdorim.");
      const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true }, { method: "admin" });
      await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: hash });
    });
    revalidatePath(base);
    return { password };
  } catch (error) {
    return { error: messageFor(error) };
  }
}

export async function resetStaff(id: string, _: PasswordResult, form: FormData): Promise<PasswordResult> {
  const current = await requireStaff();
  try {
    if (id === current.id) throw new AdminError("Përdorni faqen e fjalëkalimit tuaj.");
    if (form.get("confirm") !== "on") throw new AdminError("Konfirmoni rivendosjen e fjalëkalimit.");
    const ctx = await auth.$context;
    const password = temporaryPassword();
    const hash = await ctx.password.hash(password);
    await transaction(async (client) => {
      const { rowCount } = await client.query('SELECT id FROM "user" WHERE id = $1 FOR UPDATE', [id]);
      if (!rowCount) throw new AdminError("Përdoruesi nuk ekziston më.");
      const update = await client.query(
        `UPDATE account SET password = $2, "updatedAt" = now() WHERE "userId" = $1 AND "providerId" = 'credential'`,
        [id, hash],
      );
      if (!update.rowCount) throw new AdminError("Përdoruesi nuk ka hyrje me fjalëkalim.");
      await client.query('DELETE FROM session WHERE "userId" = $1', [id]);
    });
    return { password };
  } catch (error) {
    return { error: messageFor(error) };
  }
}

export async function deleteStaff(id: string) {
  const current = await requireStaff();
  await run(`${base}/${encodeURIComponent(id)}`, async () => {
    if (id === current.id) throw new AdminError("Nuk mund të fshini llogarinë tuaj.");
    const rows = await query('DELETE FROM "user" WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) throw new AdminError("Përdoruesi nuk ekziston më.");
  }, () => base, "Përdoruesi u fshi.");
}

export async function changeOwnPassword(form: FormData) {
  await requireStaff();
  await run(`${base}/une`, async () => {
    const currentPassword = passwordField(form, "current_password");
    const newPassword = passwordField(form, "new_password");
    if (!currentPassword || newPassword.length < 10 || newPassword.length > 128 || newPassword === currentPassword) {
      throw new AdminError("Zgjidhni një fjalëkalim të ri me 10 deri në 128 karaktere.");
    }
    if (newPassword !== passwordField(form, "confirm_password")) throw new AdminError("Fjalëkalimet e reja nuk përputhen.");
    try {
      await auth.api.changePassword({ headers: await headers(), body: { currentPassword, newPassword, revokeOtherSessions: true } });
    } catch {
      throw new AdminError("Fjalëkalimi aktual nuk mund të verifikohej. Kontrollojeni dhe provoni përsëri.");
    }
  }, undefined, "Fjalëkalimi u ndryshua.");
}
