"use client";
import { useEffect, useRef, useState } from "react";

export default function CartToaster() {
  const [visible, setVisible] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onAdd = () => {
      setVisible(true);
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(() => setVisible(false), 1600);
    };
    window.addEventListener("cart:add", onAdd as EventListener);
    return () => {
      window.removeEventListener("cart:add", onAdd as EventListener);
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        insetInline: 0,
        top: "3.5rem",
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        paddingInline: "1rem",
      }}
    >
      <div
        className="banner success"
        style={{
          width: "100%",
          maxWidth: "72rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "999px",
              background: "var(--success-strong, #34d399)",
            }}
          />
          Product Successfully Added
        </div>
      </div>
    </div>
  );
}
