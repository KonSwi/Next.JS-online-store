import Link from "next/link";
export default function Contact() {
  return (
    <div className="container" style={{ paddingBlock: "1.5rem" }}>
      <h1
        style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem" }}
      >
        Call me baby *_* 
      </h1>
      <Link href="/" style={{ textDecoration: "underline" }}>
        ← Wróć na stronę główną
      </Link>
    </div>
  );
}
