import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;
  const body = await req.json();
  const { value, type, week } = body;
  if (!value || value <= 0) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  if (!week || week < 1 || week > 5) return NextResponse.json({ error: "Semana inválida" }, { status: 400 });

  const entry = await prisma.entry.findUnique({ where: { id }, include: { month: true } });
  if (!entry || entry.month.userId !== userId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const updated = await prisma.entry.update({ where: { id }, data: { value: Number(value), type: type || "normal", week: Number(week) } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;
  const entry = await prisma.entry.findUnique({ where: { id }, include: { month: true } });
  if (!entry || entry.month.userId !== userId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
