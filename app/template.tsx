// app/template.tsx
// Serwerowy komponent „template” działa jak layout, ale
// renderuje się ponownie przy każdej nawigacji do tego segmentu.
// Trzymaj go maksymalnie prostym.

import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  // Możesz dodać tu np. <Suspense fallback={...}> jeśli chcesz
  // własny „fallback” dla ładowania podstron.
  return <>{children}</>;
}
