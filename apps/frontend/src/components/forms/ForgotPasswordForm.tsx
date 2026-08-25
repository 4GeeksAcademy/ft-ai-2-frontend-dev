"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageCenter } from "@/components/layout/PageCenter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLink } from "@/components/layout/AuthLink";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      });
    } catch {
      // Keep response generic to avoid account enumeration.
    } finally {
      setEmailSent(true);
      setLoading(false);
    }
  }

  return (
    <PageCenter>
      <Card>
        {!emailSent ? (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
              Forgot password
            </h1>

            <p className="mb-6 text-sm text-zinc-400">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <form action={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                loading={loading}
                loadingLabel="Sending…"
              >
                Send reset link
              </Button>
            </form>

            <AuthLink
              label=""
              linkLabel="Back to log in"
              href="/login"
            />
          </>
        ) : (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-green-400">
              Check your email
            </h1>

            <p className="text-sm text-zinc-300">
              If that address is registered, you&apos;ll receive a password
              reset link shortly.
            </p>

            <AuthLink
              label=""
              linkLabel="Back to log in"
              href="/login"
            />
          </>
        )}
      </Card>
    </PageCenter>
  );
}