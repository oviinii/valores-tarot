"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const s = await auth();
  if (!s?.user) throw new Error("Não autenticado");
  return (s.user as any).id as string;
}

export async function createMonth(formData: FormData) {
  const userId = await requireUser();
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const label = String(formData.get("label") || "").trim() || `${month}/${year}`;
  if (!year || !month) throw new Error("Ano/mês inválidos");
  await prisma.month.create({ data: { userId, year, month, label } });
  revalidatePath("/dashboard");
}

export async function addEntry(formData: FormData) {
  const userId = await requireUser();
  const monthId = String(formData.get("monthId"));
  const week = Number(formData.get("week"));
  const value = Number(formData.get("value"));
  const type = String(formData.get("type") || "normal");
  const note = String(formData.get("note") || "").trim() || null;

  const m = await prisma.month.findFirst({ where: { id: monthId, userId } });
  if (!m) throw new Error("Mês não encontrado");
  if (!week || week < 1 || week > 5) throw new Error("Semana 1-5");
  if (!value || value <= 0) throw new Error("Valor inválido");

  await prisma.entry.create({ data: { monthId, week, value, type, note } });
  revalidatePath("/dashboard");
}

export async function deleteEntry(entryId: string) {
  const userId = await requireUser();
  const entry = await prisma.entry.findUnique({ where: { id: entryId }, include: { month: true } });
  if (!entry || entry.month.userId !== userId) throw new Error("Não autorizado");
  await prisma.entry.delete({ where: { id: entryId } });
  revalidatePath("/dashboard");
}

export async function updateEntry(formData: FormData) {
  const userId = await requireUser();
  const entryId = String(formData.get("entryId"));
  const value = Number(formData.get("value"));
  const type = String(formData.get("type") || "normal");
  const week = Number(formData.get("week"));
  const note = String(formData.get("note") || "").trim() || null;

  if (!value || value <= 0) throw new Error("Valor inválido");
  if (!week || week < 1 || week > 5) throw new Error("Semana inválida");

  const entry = await prisma.entry.findUnique({ where: { id: entryId }, include: { month: true } });
  if (!entry || entry.month.userId !== userId) throw new Error("Não autorizado");

  await prisma.entry.update({ where: { id: entryId }, data: { value, type, week, note } });
  revalidatePath("/dashboard");
}

export async function updateMonthLabel(formData: FormData) {
  const userId = await requireUser();
  const monthId = String(formData.get("monthId"));
  const label = String(formData.get("label") || "").trim();
  if (!label) throw new Error("Rótulo vazio");
  const m = await prisma.month.findFirst({ where: { id: monthId, userId } });
  if (!m) throw new Error("Mês não encontrado");
  await prisma.month.update({ where: { id: monthId }, data: { label } });
  revalidatePath("/dashboard");
}

export async function deleteMonth(monthId: string) {
  const userId = await requireUser();
  const m = await prisma.month.findFirst({ where: { id: monthId, userId } });
  if (!m) throw new Error("Não encontrado");
  await prisma.month.delete({ where: { id: monthId } });
  revalidatePath("/dashboard");
}
