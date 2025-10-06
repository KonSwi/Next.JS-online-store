import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container" style={{ paddingBlock: "1.5rem" }}>
      <h1
        style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem" }}
      >
        404 — Page not found
      </h1>
      <Link href="/" style={{ textDecoration: "underline" }}>
        ← Go back home
      </Link>
    </div>
  );
}
