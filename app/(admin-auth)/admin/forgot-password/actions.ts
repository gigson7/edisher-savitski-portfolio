"use server";

import nodemailer from "nodemailer";
import { createPasswordResetToken } from "@/lib/auth";

export type ForgotPasswordState = {
  success?: boolean;
  error?: string;
} | null;

export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get("email");

  if (!email || typeof email !== "string" || email.trim() === "") {
    return { error: "Email is required." };
  }

  try {
    // createPasswordResetToken returns null if user not found — we still show success
    const token = await createPasswordResetToken(email.trim());

    if (token) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`;

      const port = Number(process.env.SMTP_PORT) || 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Edisher Savitski Portfolio" <${process.env.SMTP_USER}>`,
        to: email.trim(),
        subject: "Password Reset — Edisher Savitski Portfolio",
        text: `Click the link below to reset your password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    }

    // Always return success — do not reveal whether email exists
    return { success: true };
  } catch {
    // Still return success to avoid leaking whether the account exists
    return { success: true };
  }
}
