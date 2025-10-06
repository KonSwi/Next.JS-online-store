"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type Form = { id: string };

function looksLikeEmail(v: string) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
}
function looksLikePhone(v: string) {
  const core = v.replace(/[^\d]/g, "");
  return core.length >= 6 && /^[0-9+\-\s()]+$/.test(v);
}

export default function LoginStep1Page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm<Form>({ mode: "onTouched" });

  function cls(hasErr: boolean, active: boolean) {
    if (hasErr) return "border-red-600 focus:ring-red-500";
    if (active) return "border-neutral-500 focus:ring-amber-500";
    return "border-neutral-700 focus:ring-neutral-600";
  }

  async function onSubmit(values: Form) {
    const id = values.id.trim();
    router.push(`/login/password?id=${encodeURIComponent(id)}`);
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-5">
        <h1 className="mb-4 text-center text-amber-400 text-lg font-semibold">
          Sign in
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Email or mobile phone number
            </label>
            <input
              {...register("id", {
                required: "Required",
                validate: (v) =>
                  looksLikeEmail(v) ||
                  looksLikePhone(v) ||
                  "Enter email or phone",
              })}
              placeholder="Email or Mobile phone Number"
              className={[
                "w-full rounded-md bg-neutral-950 px-3 py-2 text-white placeholder-neutral-500 border focus:outline-none focus:ring-1",
                cls(!!errors.id, !!(touchedFields.id || dirtyFields.id)),
              ].join(" ")}
            />
            {errors.id && (
              <p className="mt-1 text-xs text-red-300">
                {errors.id.message as string}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            Continue
          </button>
        </form>

        <div className="mt-3 text-center text-xs text-neutral-400">
          Don’t have an account?{" "}
          <a href="/register" className="text-amber-400 hover:underline">
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
