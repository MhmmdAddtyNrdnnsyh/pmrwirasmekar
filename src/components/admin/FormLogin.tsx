"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const labelClass = "text-sm font-medium text-pmr-dark";
const inputClass =
  "mt-1.5 w-full rounded-md border border-pmr-gray bg-pmr-white px-3 py-2 text-sm text-pmr-dark placeholder:text-pmr-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pmr-red focus-visible:ring-offset-2";

export default function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Username atau password salah.");
        setIsLoading(false);
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat login. Coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div>
        <label htmlFor="username" className={labelClass}>
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="admin"
          className={inputClass}
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-pmr-red/30 bg-pmr-red/5 p-3 text-sm text-pmr-red-dark"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={isLoading} className="mt-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Memproses…
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}
