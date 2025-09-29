"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type Form = { password: string; save: boolean };

export default function LoginStep2Page() {
  const router = useRouter();
  const sp = useSearchParams();
  const id = sp?.get("id") || "";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm<Form>({ mode: "onTouched", defaultValues: { save: true } });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) router.replace("/login");
  }, [id, router]);

  function cls(hasErr: boolean, active: boolean) {
    if (hasErr) return "border-red-600 focus:ring-red-500";
    if (active) return "border-neutral-500 focus:ring-amber-500";
    return "border-neutral-700 focus:ring-neutral-600";
  }

  async function onSubmit(values: Form) {
    setServerError(null);
    const res = await signIn("credentials", {
      redirect: false,
      id,
      password: values.password,
    });

    if (res?.ok) {
      window.dispatchEvent(new CustomEvent("session:login:success"));
      router.push("/");
    } else {
      setServerError("Invalid credentials");
    }
  }

  if (!id) return null;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-5">
        <h1 className="mb-4 text-center text-amber-400 text-lg font-semibold">
          Sign in
        </h1>

        {serverError && (
          <div className="mb-3 rounded border border-red-600/60 bg-red-900/30 p-3 text-sm text-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              placeholder="Password"
              className={[
                "w-full rounded-md bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 border focus:outline-none focus:ring-1",
                cls(
                  !!errors.password,
                  !!(touchedFields.password || dirtyFields.password)
                ),
              ].join(" ")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-300">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                {...register("save")}
                className="h-4 w-4 accent-amber-500"
              />
              Save password
            </label>
            <span className="cursor-not-allowed text-xs text-neutral-400">
              Forgot your password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
