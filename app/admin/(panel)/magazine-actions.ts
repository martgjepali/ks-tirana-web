"use server";

import { requireStaff } from "@/lib/admin/session";
import { AdminError, messageFor, run } from "@/lib/admin/form";
import { removeUpload, saveImage, withUploads } from "@/lib/admin/uploads";
import { transaction } from "@/lib/db/pool";

export async function uploadMagazinePage(issueId: number, form: FormData) {
  await requireStaff();
  try {
    await withUploads(async (client, undo) => {
      const issue = await client.query("SELECT 1 FROM magazine_issues WHERE id = $1 FOR UPDATE", [issueId]);
      if (!issue.rowCount) throw new AdminError("Ky numër i revistës nuk ekziston më.");
      const url = await saveImage(form.get("file"), 2200);
      if (!url) throw new AdminError("Zgjidhni një imazh.");
      undo(() => removeUpload(url));
      await client.query(
        `INSERT INTO magazine_pages (issue_id, image_url, sort_order)
         SELECT $1, $2, coalesce(max(sort_order), 0) + 1 FROM magazine_pages WHERE issue_id = $1`,
        [issueId, url],
      );
    });
    return {};
  } catch (error) {
    return { error: messageFor(error) };
  }
}

export async function editMagazinePage(issueId: number, pageId: number, action: "up" | "down" | "delete") {
  await requireStaff();
  await run(`/admin/revista/${issueId}#faqet`, async () => {
    const deletedUrl = await transaction(async (client) => {
      await client.query("SELECT id FROM magazine_issues WHERE id = $1 FOR UPDATE", [issueId]);
      const { rows } = await client.query<{ id: number }>("SELECT id FROM magazine_pages WHERE issue_id = $1 ORDER BY sort_order, id", [issueId]);
      const index = rows.findIndex((page) => page.id === pageId);
      if (index < 0) throw new AdminError("Faqja nuk ekziston më.");
      if (action === "delete") {
        const { rows: [deleted] } = await client.query<{ image_url: string }>("DELETE FROM magazine_pages WHERE issue_id = $1 AND id = $2 RETURNING image_url", [issueId, pageId]);
        return deleted.image_url;
      }
      const target = index + (action === "up" ? -1 : 1);
      if (target < 0 || target >= rows.length) return null;
      [rows[index], rows[target]] = [rows[target], rows[index]];
      await client.query(
        `UPDATE magazine_pages p SET sort_order = ordered.position
         FROM unnest($2::int[]) WITH ORDINALITY AS ordered(id, position)
         WHERE p.issue_id = $1 AND p.id = ordered.id`,
        [issueId, rows.map((page) => page.id)],
      );
      return null;
    });
    if (deletedUrl) await removeUpload(deletedUrl);
  });
}
