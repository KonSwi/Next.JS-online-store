"use client";
import { useState } from "react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};

export default function CategoryCarousel({ items }: { items: Category[] }) {
  const [i, setI] = useState(0);
  const n = Math.max(items.length, 1);
  const cur = items[i % n];

  const prev = () => setI((v) => (v - 1 + n) % n);
  const next = () => setI((v) => (v + 1) % n);

  return (
    <div
      className="card"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: "400px",
        paddingTop: "2rem",
      }}
    >
      {/* Strzałki */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="btn"
        style={{
          width: "2.75rem",
          height: "4.625rem",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          paddingInline: "0.75rem",
          fontSize: "2.5rem",
          lineHeight: 1,
          fontWeight: 300,
          borderRadius: "0 0.375rem 0.375rem 0",
          zIndex: "2",
          cursor: "pointer",
        }}
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="btn"
        style={{
          width: "2.75rem",
          height: "4.625rem",
          position: "absolute",
          right: "0.0rem",
          top: "50%",
          transform: "translateY(-50%)",
          paddingInline: "0.75rem",
          fontSize: "2.5rem",
          lineHeight: 1,
          fontWeight: 300,
          borderRadius: "0.375rem 0 0 0.375rem",
          zIndex: "2",
          cursor: "pointer",
        }}
      >
        ›
      </button>

      {/* Treść */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          margin: "auto",
        }}
      >
        <div
          style={{
            width: "27.0625rem",
            height: "15rem",
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column",
            gap: "1.5rem",
            paddingInline: "4rem",
          }}
        >
          <h3 className="h1" style={{ fontSize: "2rem", fontWeight: "500" }}>
            {cur?.name}
          </h3>
          <p className="muted" style={{ fontSize: "1rem", fontWeight: "400" }}>
            {cur?.description ?? ""}
          </p>
          {cur && (
            <Link
              href={`/product?categoryIds=${cur.id}`}
              className="btn btn-outline"
              style={{
                marginTop: "0.5rem",
                color: "var(--accent)",
                borderColor: "var(--accent)",
                zIndex: "2",
              }}
            >
              Explore Category →
            </Link>
          )}
        </div>

        <div
          className="media-box"
          style={{
            aspectRatio: "16/9",
            display: "flex",
            justifyContent: "center",
            border: "none",
            overflow: "hidden",
            background: "transparent",
          }}
        >
          {cur?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-full h-full object-cover scale-140"
              src={cur.imageUrl}
              alt={cur.name}
              style={{ zIndex: "1" }}
            />
          ) : (
            <span className="muted" style={{ fontSize: "0.875rem" }}>
              No image
            </span>
          )}
        </div>
      </div>

      {/* Kropki */}
      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          position: "absolute",
          left: "46%",
          bottom: "-2rem",
          zIndex: "2",
        }}
      >
        {items.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to ${idx + 1}`}
            onClick={() => setI(idx)}
            style={{
              width: "0.75rem",
              height: "0.75rem",
              borderRadius: "999px",
              background: idx === i ? "#F29145" : "#383B42",
            }}
          />
        ))}
      </div>
    </div>
  );
}
