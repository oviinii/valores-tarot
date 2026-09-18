import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid lg:grid-cols-2">
      {/* branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-tarot relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 grid place-items-center font-black text-lg">✦</div>
            <span className="font-bold tracking-widest text-sm">VALORES TAROT</span>
          </div>
        </div>
        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 text-xs tracking-widest text-amber-200/80 border border-amber-400/20 px-3 py-1.5 rounded-full bg-amber-400/10">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> SISTEMA ONLINE • SQLITE • VPS
          </div>
          <h1 className="text-4xl font-black leading-tight">
            Suas lives, <br />
            <span className="text-gradient">organizadas</span> <br />
            como magia.
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Replica fiel da planilha Lives R$ — com cálculo automático de totais por semana, total do mês e pessoas atendidas. Dados persistem na sua VPS.
          </p>
          <div className="flex gap-3 pt-2">
            <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl p-4">
              <p className="text-2xl font-black">11</p>
              <p className="text-xs text-zinc-400">meses importados</p>
            </div>
            <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl p-4">
              <p className="text-2xl font-black">1.4k+</p>
              <p className="text-xs text-zinc-400">lançamentos</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-zinc-500">© 2026 Valores Tarot • Feito para VPS • SQLite leve</p>
      </div>

      {/* form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-zinc-950">
        <form action={loginAction} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-purple-600 grid place-items-center font-black">✦</div>
            <span className="font-bold tracking-widest text-xs">VALORES TAROT</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Bem-vinda de volta</h2>
            <p className="text-sm text-zinc-400 mt-2">Entre com seu email e senha para ver seus meses.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-400">EMAIL</label>
              <input
                name="email"
                type="email"
                placeholder="vinicius9141@gmail.com"
                defaultValue="vinicius9141@gmail.com"
                required
                className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-sm outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-400">SENHA</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-sm outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition placeholder:text-zinc-600"
              />
              <p className="text-xs text-zinc-500 mt-2">Senha atual: <code className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">123456</code> — troque depois no perfil.</p>
            </div>
          </div>

          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black py-3.5 hover:from-amber-300 hover:to-amber-400 transition shadow-[0_8px_24px_rgba(251,191,36,0.3)]">
            Entrar no sistema →
          </button>

          <p className="text-center text-sm text-zinc-400">
            Primeiro acesso? <a href="/register" className="text-white font-semibold underline decoration-amber-400/50 underline-offset-4 hover:decoration-amber-400">Criar conta</a>
          </p>

          <div className="pt-4 border-t border-zinc-900 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" /> SQLite leve • sem custos de BD externo
          </div>
        </form>
      </div>
    </div>
  );
}
