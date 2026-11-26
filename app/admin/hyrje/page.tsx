import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { currentStaff } from "@/lib/admin/session";
import { Notice, one } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";

export const metadata = { title: "Hyrje" };

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch {
    redirect(`/admin/hyrje?gabim=${encodeURIComponent("Email-i ose fjalëkalimi nuk është i saktë.")}`);
  }
  redirect("/admin");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await currentStaff()) redirect("/admin");
  const sp = await searchParams;

  return (
    <main className="admin-login flex min-h-svh items-center justify-center bg-navy-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/images/ks-tirana-crest.png" alt="" width={39} height={48} className="h-12 w-auto" priority />
          <div>
            <p className="text-xl font-extrabold text-strong">KS TIRANA</p>
            <p className="text-sm text-ink/60">Paneli i stafit</p>
          </div>
        </div>
        <div className="mt-6">
          <Notice error={one(sp.gabim)} ok={one(sp.ok)} />
        </div>
        <form action={signIn} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-strong">Email</span>
            <input name="email" type="email" required autoComplete="username" autoCapitalize="none" spellCheck={false} className="field mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-strong">Fjalëkalimi</span>
            <input name="password" type="password" required autoComplete="current-password" enterKeyHint="go" className="field mt-1.5" />
          </label>
          <div className="pt-2">
            <SubmitButton icon="arrowRight">Hyr</SubmitButton>
          </div>
        </form>
      </div>
    </main>
  );
}
