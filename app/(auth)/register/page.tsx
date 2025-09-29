"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .min(6, "Min 6 digits")
      .max(20, "Too long")
      .regex(/^[0-9+\-\s()]+$/, "Digits and +()- only"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    country: z.string().min(2, "Required"),
    agree: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const COUNTRIES = [
  "Indonesia",
  "Poland",
  "Germany",
  "United Kingdom",
  "United States",
  "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onTouched" });

  const [serverError, setServerError] = useState<string | null>(null);

  function fieldCls(hasErr: boolean, active: boolean) {
    if (hasErr) return "border-red-600 focus:ring-red-500";
    if (active) return "border-neutral-500 focus:ring-amber-500";
    return "border-neutral-700 focus:ring-neutral-600";
  }

  async function onSubmit(values: FormData) {
    setServerError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) router.push("/register/success");
    else {
      const j = await res.json().catch(() => ({}));
      setServerError(j?.error || "Registration failed");
    }
  }

  return (
    <main className="container py-10">
      <div className="card mx-auto w-full max-w-sm p-5">
        <h1 className="h1 text-center text-amber-400">Create Account</h1>

        {serverError && (
          <div className="banner mt-4 mb-3 border-red-600/60 bg-red-900/30 text-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Email */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="Your Email"
              className={[
                "w-full bg-neutral-950 text-white placeholder-neutral-500 border rounded px-3 py-2 focus:outline-none focus:ring-1",
                fieldCls(
                  !!errors.email,
                  !!(touchedFields.email || dirtyFields.email)
                ),
              ].join(" ")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-300">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              inputMode="tel"
              {...register("phone")}
              placeholder="+48 123 456 789"
              className={[
                "w-full bg-neutral-950 text-white placeholder-neutral-500 border rounded px-3 py-2 focus:outline-none focus:ring-1",
                fieldCls(
                  !!errors.phone,
                  !!(touchedFields.phone || dirtyFields.phone)
                ),
              ].join(" ")}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-300">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Minimum 6 characters"
              className={[
                "w-full bg-neutral-950 text-white placeholder-neutral-500 border rounded px-3 py-2 focus:outline-none focus:ring-1",
                fieldCls(
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="Repeat password"
              className={[
                "w-full bg-neutral-950 text-white placeholder-neutral-500 border rounded px-3 py-2 focus:outline-none focus:ring-1",
                fieldCls(
                  !!errors.confirmPassword,
                  !!(
                    touchedFields.confirmPassword || dirtyFields.confirmPassword
                  )
                ),
              ].join(" ")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-300">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">
              Country or region
            </label>
            <select
              {...register("country")}
              defaultValue={COUNTRIES[0]}
              className={[
                "w-full bg-neutral-950 text-white border rounded px-3 py-2 focus:outline-none focus:ring-1",
                fieldCls(
                  !!errors.country,
                  !!(touchedFields.country || dirtyFields.country)
                ),
              ].join(" ")}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="mt-1 text-xs text-red-300">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Agree */}
          <label className="mt-2 flex items-start gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              {...register("agree")}
              className="mt-0.5 h-4 w-4 accent-amber-500"
            />
            <span>
              By creating an account and clicking, you agree to the{" "}
              <span className="cursor-not-allowed underline">
                privacy policy
              </span>
              .
            </span>
          </label>
          {errors.agree && (
            <p className="mt-1 text-xs text-red-300">{errors.agree.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn w-full text-sm"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-right">
          <a
            href="/login"
            className="px-3 py-1 text-sm text-neutral-200 rounded bg-neutral-800 hover:bg-neutral-700"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
