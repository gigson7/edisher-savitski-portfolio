"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export type LoginState = {
  error?: string;
} | null;

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || typeof email !== "string" || email.trim() === "") {
    return { error: "Email is required." };
  }

  if (!password || typeof password !== "string" || password === "") {
    return { error: "Password is required." };
  }

  const result = await login(email.trim(), password);

  if (!result.success) {
    return { error: result.error ?? "Invalid email or password." };
  }

  redirect("/admin");
}
