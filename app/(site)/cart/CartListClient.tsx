"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Qty from "./_Qty";
import Remove from "./_Remove";

type Item = {
  id: number;
  qty: number;
  unit: number;
  line: number;
  note?: string | null;
  product: {
    id: number;
    name: string;
    imageUrl?: string | null;
    category?: { id: number; name: string } | null;
  };
};

export default function CartListClient({
  initialItems,
}: {
  initialItems: Item[];
}) {

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(initialItems.map((i) => i.id)) 
  );
  const allSelected = useMemo(
    () => selected.size === initialItems.length && initialItems.length > 0,
    [selected, initialItems.length]
  );
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(initialItems.map((i) => i.id)));
  };
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const [openNote, setOpenNote] = useState<Record<number, boolean>>({});
  const [draftNote, setDraftNote] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [savedOk, setSavedOk] = useState<Record<number, boolean>>({});

  const onOpenNote = (it: Item) => {
    setOpenNote((s) => ({ ...s, [it.id]: !s[it.id] }));
    if (draftNote[it.id] === undefined) {
      setDraftNote((d) => ({ ...d, [it.id]: it.note ?? "" }));
    }
  };

  const saveNote = async (it: Item) => {
    const note = (draftNote[it.id] ?? "").trim();
    setSaving((s) => ({ ...s, [it.id]: true }));
    try {
      const res = await fetch(`/api/cart/item/${it.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSavedOk((s) => ({ ...s, [it.id]: true }));
      setTimeout(() => {
        setSavedOk((s) => ({ ...s, [it.id]: false }));
      }, 1200);
    } catch {

    } finally {
      setSaving((s) => ({ ...s, [it.id]: false }));
    }
  };

  return (
    <>

      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          className="h-4 w-4 accent-amber-500"
          checked={allSelected}
          onChange={toggleAll}
        />
        <span className="text-sm text-neutral-300">Select All</span>
      </div>

      <ul className="space-y-3">
        {initialItems.map((it) => {
          const isChecked = selected.has(it.id);
          const noteOpen = !!openNote[it.id];
          const isSaving = !!saving[it.id];
          const ok = !!savedOk[it.id];
          return (
            <li key={it.id} className="card p-3">
              <div className="flex items-center gap-3">
   
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-amber-500"
                  checked={isChecked}
                  onChange={() => toggleOne(it.id)}
                />

        
                <Link
                  href={`/product/${it.product.id}`}
                  className="h-16 w-16 rounded bg-black/20 overflow-hidden grid place-items-center shrink-0"
                >
                  {it.product.imageUrl ? (
                    <Image
                      src={it.product.imageUrl}
                      alt={it.product.name}
                      width={64}
                      height={64}
                      className="object-contain h-16 w-auto"
                    />
                  ) : (
                    <span className="muted text-xs">No image</span>
                  )}
                </Link>

    
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${it.product.id}`}
                    className="block text-white hover:underline truncate"
                  >
                    {it.product.name}
                  </Link>
                  {it.product.category?.name && (
                    <span className="badge mt-1">
                      {it.product.category.name}
                    </span>
                  )}
                  <div className="mt-2 text-sm text-white">
                    ${it.unit.toFixed(2)}
                  </div>

          
                  <button
                    className="mt-2 text-xs text-neutral-300 hover:underline"
                    onClick={() => onOpenNote(it)}
                  >
                    {noteOpen
                      ? "Hide Note"
                      : it.note
                      ? "Edit Note"
                      : "Write Note"}
                  </button>

                  {noteOpen && (
                    <div className="mt-2">
                      <textarea
                        value={draftNote[it.id] ?? ""}
                        onChange={(e) =>
                          setDraftNote((d) => ({
                            ...d,
                            [it.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="input"
                        placeholder="Add a note for seller (max 500 chars)"
                        maxLength={500}
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className="btn"
                          onClick={() => saveNote(it)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save note"}
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() =>
                            setOpenNote((o) => ({ ...o, [it.id]: false }))
                          }
                        >
                          Cancel
                        </button>
                        {ok && (
                          <span className="text-xs text-emerald-400">
                            Saved ✓
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

    
                <Qty itemId={it.id} qty={it.qty} />


                <div className="w-24 text-right font-semibold">
                  ${it.line.toFixed(2)}
                </div>

  
                <Remove itemId={it.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
