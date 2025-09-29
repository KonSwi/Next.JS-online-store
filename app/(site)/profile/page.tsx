import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import Image from "next/image";
import { getUserIdFrom } from "@/lib/session";

export const revalidate = 0;

function initials(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email && email.split("@")[0]) || "";
  if (!base) return "🙂";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFrom(session);
  if (!userId) {
    return (
      <div className="panel">
        You must be signed in.{" "}
        <Link href="/login" className="underline">
          Go to login
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      email: true,
      createdAt: true,
      avatarUrl: true,
    },
  });

  if (!user) return <div className="panel">User not found.</div>;

  const userInitials = initials(user.firstName, user.email);

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return (
    <>
      <nav className="text-sm text-neutral-400 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span>Profile</span>
      </nav>

      <div className="row">
        <section className="col">
          <div className="card p-4">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                  <Image
                    src={user.avatarUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full grid place-items-center bg-neutral-800 border border-neutral-700 text-white font-semibold">
                  {userInitials}
                </div>
              )}

              <div className="min-w-0">
                <div className="text-white font-semibold">
                  {user.firstName || user.email}
                </div>
                <div className="muted text-sm">{user.email}</div>
                <div className="muted text-xs">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="ml-auto">
                <LogoutButton />
              </div>
            </div>
          </div>
        </section>

        <section className="col">
          <div className="h1 mb-3">Transaction</div>

          {orders.length === 0 ? (
            <div className="card p-4">
              <div className="muted">No transactions yet.</div>
              <Link href="/product" className="btn btn-outline mt-3">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const inv = `INV/${o.createdAt.getTime()}/TSR/${o.id}`;
                const when = o.createdAt.toLocaleString();
                return (
                  <div key={o.id} className="card p-4">
                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <span>🔒</span>
                      <span>{when}</span>
                    </div>
                    <div className="mt-2 text-white">
                      Your order nr <span className="font-mono">{inv}</span>
                    </div>
                    <ul className="mt-2 text-sm text-neutral-300 list-disc pl-5">
                      {o.orderItems.map((it) => (
                        <li key={it.id}>
                          {it.product.name}
                          {it.product.category?.name ? (
                            <span className="ml-2 badge">
                              {it.product.category.name}
                            </span>
                          ) : null}{" "}
                          <span className="ml-1 text-neutral-400">
                            x{it.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
