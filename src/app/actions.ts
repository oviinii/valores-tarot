"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) throw new Error("Email e senha obrigatórios");
  if (password.length < 6) throw new Error("Senha mínimo 6 caracteres");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("Email já cadastrado");

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hash, name: name || null } });
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {}
  redirect("/dashboard");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (e) {
    if (e instanceof AuthError) {
      throw new Error("Credenciais inválidas");
    }
    throw e;
  }
}
