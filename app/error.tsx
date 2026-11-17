"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-20">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-extrabold text-primary">Oops</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Something went off-road</h1>
        <p className="mt-3 text-base-content/70">We hit an unexpected problem loading this page. Try again, or head back to the start.</p>
        <div className="mt-7 flex justify-center gap-3">
          <button className="btn btn-primary" onClick={reset}>Try again</button>
          <Link href="/" className="btn btn-ghost">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
