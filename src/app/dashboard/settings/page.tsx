import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { changePasswordAction } from "./actions";
import Link from "next/link";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const sp = await searchParams;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06] px-4 lg:px-6 h-[64px] flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 grid place-items-center font-black">✦</div>
          <span className="font-black tracking-tight">VALORES TAROT</span>
        </Link>
        <Link href="/dashboard" className="ml-auto text-sm font-semibold border border-white/10 rounded-xl px-4 py-2 hover:bg-white/5">← Voltar ao dashboard</Link>
      </header>

      <main className="max-w-xl mx-auto px-4 lg:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Configurações</h1>
          <p className="text-sm text-zinc-400 mt-1">Altere sua senha de acesso. Logado como <b className="text-white">{session.user.email}</b></p>
        </div>

        {sp.error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-sm">{decodeURIComponent(sp.error)}</div>}
        {sp.success && <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 text-sm">{decodeURIComponent(sp.success)}</div>}

        <form action={changePasswordAction} className="rounded-2xl bg-zinc-900 border border-white/[0.06] p-6 space-y-4">
          <h2 className="font-black">Alterar senha</h2>
          <div>
            <label className="text-xs font-bold tracking-widest text-zinc-500">SENHA ATUAL</label>
            <input name="current" type="password" required placeholder="••••••••" className="mt-1 w-full rounded-xl bg-zinc-950 border border-white/10 px-4 py-3 text-sm outline-none focus:border-amber-400/50" />
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest text-zinc-500">NOVA SENHA</label>
            <input name="next" type="password" required placeholder="Mínimo 6 caracteres" className="mt-1 w-full rounded-xl bg-zinc-950 border border-white/10 px-4 py-3 text-sm outline-none focus:border-amber-400/50" />
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest text-zinc-500">CONFIRMAR NOVA SENHA</label>
            <input name="confirm" type="password" required placeholder="Repita a nova senha" className="mt-1 w-full rounded-xl bg-zinc-950 border border-white/10 px-4 py-3 text-sm outline-none focus:border-amber-400/50" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-900 font-black py-3.5 hover:from-amber-300 hover:to-amber-400">Alterar senha</button>
          <p className="text-xs text-zinc-500 text-center">Após alterar, use a nova senha no próximo login.</p>
        </form>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-300">Dica de segurança</p>
          <p className="mt-1">Use uma senha forte e não compartilhe. O sistema usa bcrypt e armazena apenas hash.</p>
        </div>
      </main>
    </div>
  );
}
