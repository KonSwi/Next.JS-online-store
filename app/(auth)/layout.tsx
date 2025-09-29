import Link from "next/link";
import Footer from "../components/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header
        className="w-full border-b"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in srgb, var(--panel), transparent 40%)",
        }}
      >
        <div className="container h-12 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            <span className="text-amber-500">Devstock</span>
            <span className="text-white">Hub</span>
          </Link>
          <Link href="/login" className="btn py-1.5 px-3 text-sm">
            Sign In
          </Link>
        </div>
      </header>

      <main className="container py-10 flex-1">{children}</main>
      <Footer />
    </>
  );
}
