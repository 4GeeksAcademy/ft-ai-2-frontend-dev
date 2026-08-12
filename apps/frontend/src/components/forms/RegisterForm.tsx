"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiClient, type ApiError } from "@/lib/api";
import { AuthForm } from "@/components/forms/AuthForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthLink } from "@/components/layout/AuthLink";

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

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
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          display_name: formData.get("displayName"),
        }),
      });

      // Registration succeeded — redirect to login
      router.replace("/login");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm title="Register">
      <form action={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="displayName"
          name="displayName"
          label="Display name"
          type="text"
          required
          errorId={error ? "register-error" : undefined}
        />

        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          errorId={error ? "register-error" : undefined}
        />

        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          hint="8–128 characters"
          errorId={error ? "register-error" : undefined}
        />

        {error && (
          <Alert id="register-error" variant="error">
            {error}
          </Alert>
        )}

        <Button type="submit" loading={loading} loadingLabel="Creating account…">
          Register
        </Button>
      </form>

      <AuthLink label="Already have an account?" linkLabel="Log in" href="/login" />
    </AuthForm>
  );
}