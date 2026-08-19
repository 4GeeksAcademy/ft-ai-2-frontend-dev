"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { ApiError } from "@/lib/api";
import { AuthForm } from "@/components/forms/AuthForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthLink } from "@/components/layout/AuthLink";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const resetSuccess = searchParams.get("reset") === "success";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect to profile
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/user_profile");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      await login(
        formData.get("email") as string,
        formData.get("password") as string,
      );
      router.replace("/user_profile");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm title="Log in">
      {resetSuccess && (
        <Alert variant="success" role="alert" id="reset-success-banner">
          Your password has been reset successfully. Please log in with your
          new password.
        </Alert>
      )}

      <form action={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          errorId={error ? "login-error" : undefined}
        />

        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          errorId={error ? "login-error" : undefined}
          link={{ label: "Forgot your password?", href: "/reset-password" }}
        />

        {error && (
          <Alert id="login-error" variant="error">
            {error}
          </Alert>
        )}

        <Button type="submit" loading={loading} loadingLabel="Logging in…">
          Log in
        </Button>
      </form>

      <AuthLink label="Don&apos;t have an account?" linkLabel="Register" href="/register" />
    </AuthForm>
  );
}