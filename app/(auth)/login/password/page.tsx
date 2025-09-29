import { Suspense } from "react";
import LoginPasswordClient from "./LoginPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPasswordClient />
    </Suspense>
  );
}
