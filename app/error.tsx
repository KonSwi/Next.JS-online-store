"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
        Coś poszło nie tak
      </h2>
      <button
        onClick={() => reset()}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
