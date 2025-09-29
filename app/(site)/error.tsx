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
    <div className="container" style={{ paddingBlock: "1.5rem" }}>
      <h2
        style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem" }}
      >
        Coś poszło nie tak
      </h2>
      <button
        onClick={() => reset()}
        className="btn btn-outline"
        style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem" }}
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
