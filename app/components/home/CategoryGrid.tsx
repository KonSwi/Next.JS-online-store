"use client";

import Image from "next/image";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
};

const ICONS: Record<string, string> = {
  Mouse: "/icons/category/mouse.png",
  Monitor: "/icons/category/monitor.png",
  Headphone: "/icons/category/headphone.png",
  Keyboard: "/icons/category/keyboard.png",
  Webcam: "/icons/category/webcam.png",
};

export default function CategoryGrid({ items }: { items: Category[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-neutral-300">
        No categories.
      </div>
    );
  }

  return (
    <div className="gap-1 flex justify-between my-8">
      {items.map((c) => {
        const iconSrc = ICONS[c.name] ?? "/icons/category/mouse.png";
        return (
          <Link
            key={c.id}
            href={`/product?categoryIds=${c.id}`}
            className=" group rounded-xl border border-neutral-700 bg-[#262626] px-6 py-5 transition-colors hover:bg-neutral-800/80 w-[220px] h-[190px] flex items-center justify-center"

          >
            <div className="flex flex-col items-center gap-3">
              <span className="grid h-20 w-20 place-items-center rounded-lg bg-[#262626]">
                <Image
                  src={iconSrc}
                  alt={c.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </span>
              <span className="text-sm text-[1.25rem] text-white">{c.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
