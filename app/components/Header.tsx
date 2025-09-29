import Link from "next/link";
import Image from "next/image";
import CartIcon from "./icons/Cart";
import UserIcon from "./icons/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserIdFrom } from "@/lib/session";

function initials(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email && email.split("@")[0]) || "";
  if (!base) return "🙂";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default async function Header() {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFrom(session);

  const user =
    userId != null
      ? await prisma.user.findUnique({
          where: { id: userId },
        })
      : null;

  const isLoggedIn = !!userId && !!user;

  const firstName = user?.firstName ?? null;
  const email = user?.email ?? null;

  let avatarUrl: string | null = null;
  if (user && typeof user === "object" && "avatarUrl" in user) {
    const v = (user as Record<string, unknown>).avatarUrl;
    avatarUrl = typeof v === "string" && v.length > 0 ? v : null;
  }

  const userInitials = isLoggedIn ? initials(firstName, email) : null;
  const profileHref = isLoggedIn ? "/profile" : "/login";

  return (
    <header style={{}}>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "2rem 2.5rem",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "var(--accent)" }}>Devstock</span>
            <span style={{ color: "var(--foreground)" }}>Hub</span>
          </span>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginLeft: "0.5rem",
          }}
        >
          <Link
            href="/cart"
            aria-label="Cart"
            className="btn-ghost"
            style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
          >
            <CartIcon className="size-6 text-neutral-100" />
          </Link>

          <Link
            href={profileHref}
            aria-label={isLoggedIn ? "Profile" : "Login"}
            className="btn-ghost"
            style={{ padding: "0.25rem", borderRadius: "9999px" }}
          >
            {isLoggedIn ? (
              avatarUrl ? (
                <span
                  style={{
                    display: "inline-flex",
                    width: 32,
                    height: 32,
                    borderRadius: "9999px",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "var(--panel)",
                  }}
                >
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={32}
                    height={32}
                    style={{
                      width: "2rem",
                      height: "auto",
                    }}
                  />
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    width: 32,
                    height: 32,
                    borderRadius: "9999px",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--panel)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  title={email ?? undefined}
                >
                  {userInitials}
                </span>
              )
            ) : (
              <UserIcon className="size-6 text-neutral-100" />
            )}
          </Link>
        </div>
      </div>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0rem 2.5rem 2rem",
          background:
            "linear-gradient(var(--border), var(--border)) center bottom / calc(100% - 5rem) 1px no-repeat",

          marginBottom: "2.5rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            fontSize: "1rem",
            color: "var(--muted)",
            fontWeight: "600",
          }}
        >
          <Link
            href="/"
            className="link"
            style={{
              color: "var(--accent)",
            }}
          >
            Home
          </Link>
          <Link href="/product" className="link">
            Product
          </Link>
          <Link href="/contact" className="link">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
