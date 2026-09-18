"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!current || !next || !confirm) redirect("/dashboard/settings?error=Preencha+todos+os+campos");
  if (next.length < 6) redirect("/dashboard/settings?error=Senha+precisa+ter+6+caracteres");
  if (next !== confirm) redirect("/dashboard/settings?error=Confirmacao+diferente");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/dashboard/settings?error=Usuario+nao+encontrado");

  const ok = await bcrypt.compare(current, user.password);
  if (!ok) redirect("/dashboard/settings?error=Senha+atual+incorreta");

  const hash = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });

  redirect("/dashboard/settings?success=Senha+alterada+com+sucesso");
}
