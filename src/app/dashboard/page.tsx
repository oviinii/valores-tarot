import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcTotaisPorSemana } from "@/lib/calc";
import { createMonth, addEntry, deleteMonth, updateMonthLabel } from "./actions";
import { EntryRow } from "@/components/EntryRow";

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const months = await prisma.month.findMany({
    where: { userId },
    include: { entries: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const grandTotal = months.reduce((acc, m) => acc + m.entries.reduce((a, e) => a + e.value, 0), 0);
  const grandPessoas = months.reduce((acc, m) => {
    const { pessoas } = calcTotaisPorSemana(m.entries);
    return acc + pessoas;
  }, 0);
  const avg = months.length ? Math.round(grandTotal / months.length) : 0;
  const best = months.length ? [...months].sort((a, b) => b.entries.reduce((s, e) => s + e.value, 0) - a.entries.reduce((s, e) => s + e.value, 0))[0] : null;

  const mesesPt = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06]">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 h-[64px] flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 grid place-items-center font-black">✦</div>
            <div>
              <p className="font-black tracking-tight leading-none">VALORES TAROT</p>
              <p className="text-[11px] tracking-widest text-amber-200/70 font-semibold">LIVES • SQLITE • VPS</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-6 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">● 11 meses importados</span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">{months.length} meses • {months.reduce((a, m) => a + m.entries.length, 0)} lançamentos</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold leading-none">{session.user.name || session.user.email}</p>
              <p className="text-xs text-zinc-500">{session.user.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 grid place-items-center font-bold text-xs">
              {(session.user.email || "V").slice(0, 2).toUpperCase()}
            </div>
            <a href="/dashboard/settings" className="text-sm font-semibold border border-amber-400/20 bg-amber-400/10 text-amber-200 rounded-xl px-4 py-2 hover:bg-amber-400/20 transition">Alterar senha</a>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-sm font-semibold border border-white/10 rounded-xl px-4 py-2 hover:bg-white/5 transition">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-6">
        {/* stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 relative overflow-hidden">
            <p className="text-xs font-black tracking-widest opacity-70">TOTAL GERAL</p>
            <p className="text-2xl lg:text-3xl font-black mt-1 tracking-tight">{formatBRL(grandTotal)}</p>
            <p className="text-xs font-semibold opacity-70 mt-1">{grandPessoas} pessoas atendidas • 15×1 25×2 35×3</p>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/15 rounded-full blur-2xl" />
          </div>
          <div className="rounded-2xl p-5 bg-zinc-900 border border-white/[0.06] glow-gold">
            <p className="text-xs font-bold tracking-widest text-zinc-500">MÉDIA / MÊS</p>
            <p className="text-2xl font-black mt-1">{formatBRL(avg)}</p>
            <p className="text-xs text-zinc-500 mt-1">{months.length} meses ativos</p>
          </div>
          <div className="rounded-2xl p-5 bg-zinc-900 border border-white/[0.06]">
            <p className="text-xs font-bold tracking-widest text-zinc-500">MELHOR MÊS</p>
            <p className="text-lg font-black mt-1 truncate">{best ? `${best.label} — ${formatBRL(best.entries.reduce((a, e) => a + e.value, 0))}` : "—"}</p>
            <p className="text-xs text-zinc-500 mt-1">{best ? `${mesesPt[best.month]}/${best.year}` : "sem dados"}</p>
          </div>
          <div className="rounded-2xl p-5 bg-zinc-900 border border-white/[0.06]">
            <p className="text-xs font-bold tracking-widest text-zinc-500">PESSOAS ATENDIDAS</p>
            <p className="text-2xl font-black mt-1">{grandPessoas}</p>
            <p className="text-xs text-zinc-500 mt-1">15×1 25×2 35×3 • demais ×1</p>
          </div>
        </section>

        {/* criar mês */}
        <section className="rounded-2xl bg-zinc-900 border border-white/[0.06] p-4 lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-black tracking-tight flex items-center gap-2"><span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /> Novo mês (replica uma aba da planilha)</h2>
            <span className="text-xs text-zinc-500 border border-white/10 rounded-full px-3 py-1">Ano + Mês = chave única por usuário</span>
          </div>
          <form action={createMonth} className="grid grid-cols-2 lg:grid-cols-[120px_120px_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold tracking-widest text-zinc-500">ANO</label>
              <input name="year" type="number" defaultValue={new Date().getFullYear()} className="mt-1 w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-3 text-sm focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-widest text-zinc-500">MÊS 1-12</label>
              <input name="month" type="number" min={1} max={12} defaultValue={new Date().getMonth() + 1} className="mt-1 w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-3 text-sm focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-widest text-zinc-500">RÓTULO (ex: Setembro 2025)</label>
              <input name="label" placeholder="Setembro 2025 — Página12" className="mt-1 w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-3 text-sm focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 outline-none placeholder:text-zinc-600" />
            </div>
            <button className="col-span-2 lg:col-span-1 rounded-xl bg-white text-zinc-950 font-black px-6 py-3.5 hover:bg-zinc-100 transition">+ Criar mês</button>
          </form>
        </section>

        {months.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center space-y-3">
            <p className="text-3xl">✦</p>
            <p className="font-bold">Nenhum mês ainda</p>
            <p className="text-sm text-zinc-500">Crie o primeiro mês ou importe a planilha com <code className="bg-zinc-900 px-2 py-1 rounded">npx tsx scripts/import-xlsx.ts</code></p>
          </div>
        )}

        {months.map((m) => {
          const { porSemana, totalMes, pessoas } = calcTotaisPorSemana(m.entries);
          const maxSemana = Math.max(1, ...Object.values(porSemana));
          const entradasPorSemana: Record<number, typeof m.entries> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
          for (const e of m.entries) entradasPorSemana[e.week]?.push(e);
          entradasPorSemana[1].sort((a, b) => b.value - a.value);

          return (
            <section key={m.id} className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
              {/* header do mês */}
              <div className="px-4 lg:px-6 py-4 flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-600/20 border border-amber-400/20 grid place-items-center font-black text-amber-200">
                    {String(m.month).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <form action={updateMonthLabel} className="flex items-center gap-2">
                      <input type="hidden" name="monthId" value={m.id} />
                      <input name="label" defaultValue={m.label} className="bg-transparent font-black leading-none tracking-tight outline-none border border-transparent hover:border-white/10 focus:border-amber-400/40 rounded-lg px-2 py-1 w-full max-w-[260px]" />
                      <span className="text-zinc-500 font-semibold text-sm whitespace-nowrap">• {mesesPt[m.month]}/{m.year}</span>
                      <button className="text-[11px] font-black tracking-widest bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/10">SALVAR NOME</button>
                    </form>
                    <p className="text-xs text-zinc-400 mt-1 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-white text-zinc-900 font-black px-2.5 py-1 rounded-full text-xs">{formatBRL(totalMes)}</span>
                      <span className="inline-flex items-center gap-1 border border-white/10 px-2.5 py-1 rounded-full">{pessoas} pessoas</span>
                      <span className="inline-flex items-center gap-1 border border-white/10 px-2.5 py-1 rounded-full">{m.entries.length} lançamentos</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-1.5 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const v = porSemana[s] || 0;
                      const pct = Math.round((v / maxSemana) * 100);
                      return (
                        <div key={s} className="text-center min-w-[72px]">
                          <p className="text-[11px] font-bold tracking-widest text-zinc-500">S{s}</p>
                          <p className="font-black text-xs">{formatBRL(v)}</p>
                          <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-purple-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form action={deleteMonth.bind(null, m.id)}>
                    <button className="text-xs font-semibold text-red-300 border border-red-500/20 bg-red-500/10 rounded-xl px-3 py-2 hover:bg-red-500/20 transition">Excluir</button>
                  </form>
                </div>
              </div>

              {/* semanas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
                {[1, 2, 3, 4, 5].map((sem) => {
                  const lista = entradasPorSemana[sem] || [];
                  const totalSem = porSemana[sem] || 0;
                  return (
                    <div key={sem} className="p-4 flex flex-col min-h-[280px]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black tracking-[0.14em] text-zinc-500">SEMANA {sem}</span>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${totalSem ? "bg-amber-400 text-zinc-950" : "bg-white/5 text-zinc-500 border border-white/10"}`}>
                          {formatBRL(totalSem)}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1.5 overflow-auto max-h-[320px] pr-1">
                        {lista.map((e) => (
                          <EntryRow key={e.id} entry={{ id: e.id, value: e.value, type: e.type, week: e.week }} />
                        ))}
                        {lista.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-600">Sem lançamentos nesta semana</div>}
                      </div>

                      <form action={addEntry} className="mt-3 flex gap-1.5">
                        <input type="hidden" name="monthId" value={m.id} />
                        <input type="hidden" name="week" value={sem} />
                        <input name="value" type="number" step="0.01" placeholder="R$" required className="flex-1 min-w-0 rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm focus:border-amber-400/40 outline-none" />
                        <select name="type" className="rounded-xl bg-zinc-950 border border-white/10 px-2 py-2.5 text-xs font-semibold">
                          <option value="normal">Normal</option>
                          <option value="feitico">Feitiço</option>
                        </select>
                        <button className="rounded-xl bg-white text-zinc-950 font-black px-3.5 hover:bg-zinc-100 transition">+</button>
                      </form>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 lg:px-6 py-3 bg-zinc-950 border-t border-white/[0.06] flex flex-wrap gap-3 text-xs items-center">
                <span className="text-zinc-500 font-semibold">Resumo:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="border border-white/10 rounded-full px-2.5 py-1 bg-white/[0.02]">
                    S{s} <b className="text-white">{formatBRL(porSemana[s] || 0)}</b>
                  </span>
                ))}
                <span className="ml-auto font-black">Total {formatBRL(totalMes)} • {pessoas} pessoas</span>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
