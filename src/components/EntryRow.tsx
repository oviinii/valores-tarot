"use client";
import { useState } from "react";

export function EntryRow({ entry }: { entry: { id: string; value: number; type: string; week: number } }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(entry.value));
  const [week, setWeek] = useState(String(entry.week));
  const [type, setType] = useState(entry.type);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: Number(value), week: Number(week), type }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      // soft reload to recalc totals
      window.location.reload();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Erro ao salvar");
    }
  }

  async function del() {
    if (!confirm("Excluir este lançamento?")) return;
    const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
    else alert("Erro ao excluir");
  }

  if (!editing) {
    return (
      <div className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm border ${entry.type === "feitico" ? "bg-purple-500/10 border-purple-500/20 text-purple-200" : "bg-zinc-950 border-white/[0.04] text-zinc-200"}`}>
        <span className="font-semibold flex items-center gap-2">
          R$ {entry.value}
          {entry.type === "feitico" && <span className="text-[10px] tracking-widest font-black bg-purple-500 text-white px-1.5 py-0.5 rounded">FEITIÇO</span>}
          <span className="text-[11px] text-zinc-500 font-bold">S{entry.week}</span>
        </span>
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="text-[11px] font-black tracking-widest bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/10">EDITAR</button>
          <button onClick={del} className="text-zinc-500 hover:text-red-400 w-7 h-7 grid place-items-center rounded-lg hover:bg-white/5">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-3 border bg-zinc-950 border-amber-400/30 space-y-2 shadow-lg shadow-amber-400/5">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-black tracking-widest text-zinc-500">VALOR R$</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} type="number" step="0.01" className="mt-1 w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2.5 text-sm font-black outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20" />
        </div>
        <div className="w-[88px]">
          <label className="text-[10px] font-black tracking-widest text-zinc-500">SEMANA</label>
          <select value={week} onChange={(e) => setWeek(e.target.value)} className="mt-1 w-full rounded-xl bg-zinc-900 border border-white/10 px-2 py-2.5 text-xs font-bold">
            <option value="1">S1</option>
            <option value="2">S2</option>
            <option value="3">S3</option>
            <option value="4">S4</option>
            <option value="5">S5</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-black tracking-widest text-zinc-500">TIPO</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2.5 text-xs font-bold">
          <option value="normal">Normal</option>
          <option value="feitico">✦ Feitiço</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => setEditing(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-black tracking-widest hover:bg-white/10">CANCELAR</button>
        <button onClick={save} disabled={saving} className="flex-[1.4] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-900 py-2.5 text-xs font-black tracking-widest hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 shadow-md">
          {saving ? "SALVANDO..." : "✓ SALVAR"}
        </button>
      </div>
    </div>
  );
}
