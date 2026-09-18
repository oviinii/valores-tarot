import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-tarot relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 grid place-items-center font-black text-lg">✦</div>
          <span className="font-bold tracking-widest text-sm">VALORES TAROT</span>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h1 className="text-4xl font-black leading-tight">
            Crie sua <span className="text-gradient">conta</span> <br />
            em segundos.
          </h1>
          <p className="text-zinc-400">Cada usuário tem seus próprios meses e lançamentos isolados. Ideal para VPS com SQLite — leve e privado.</p>
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 text-sm text-zinc-300">✨ Dica: use <b className="text-white">vinicius9141@gmail.com</b> se quiser ver o histórico já importado.</div>
        </div>
        <p className="relative text-xs text-zinc-500">SQLite • VPS ready • sem dependência externa</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-zinc-950">
        <form action={registerAction} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-purple-600 grid place-items-center font-black">✦</div>
            <span className="font-bold tracking-widest text-xs">VALORES TAROT</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Criar conta</h2>
            <p className="text-sm text-zinc-400 mt-2">Leva 10 segundos. Seus dados ficam na sua VPS.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-400">NOME</label>
              <input name="name" placeholder="Vinicius" className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-sm outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-400">EMAIL</label>
              <input name="email" type="email" placeholder="seu@email.com" required className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-sm outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-400">SENHA</label>
              <input name="password" type="password" placeholder="Mínimo 6 caracteres" required className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-sm outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition placeholder:text-zinc-600" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black py-3.5 hover:from-amber-300 hover:to-amber-400 transition shadow-[0_8px_24px_rgba(251,191,36,0.3)]">
            Criar conta →
          </button>
          <p className="text-center text-sm text-zinc-400">
            Já tem conta? <a href="/login" className="text-white font-semibold underline decoration-amber-400/50 underline-offset-4 hover:decoration-amber-400">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  );
}
