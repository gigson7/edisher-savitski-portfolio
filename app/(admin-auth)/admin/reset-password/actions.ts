"use server";

import { resetPassword } from "@/lib/auth";

export type ResetPasswordState = {
  success?: boolean;
  error?: string;
} | null;

export async function resetPasswordAction(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (!token || typeof token !== "string" || token.trim() === "") {
    return { error: "Reset token is missing. Please use the link from your email." };
  }

  if (!newPassword || typeof newPassword !== "string") {
    return { error: "Password is required." };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const result = await resetPassword(token.trim(), newPassword);

  if (!result.success) {
    return { error: result.error ?? "Failed to reset password." };
  }

  return { success: true };
}
