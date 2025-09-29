"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const seeAll = () =>
    ref.current?.scrollTo({ left: ref.current.scrollWidth, behavior: "smooth" });

  return (
    <div className="scroll-row my-6">
      <div ref={ref} className="scroll-row__track">
        {children}
      </div>

      {overflowing && (
        <button onClick={seeAll} className="cursor-pointer scroll-row__seeAll">
          See All →
        </button>
      )}
    </div>
  );
}