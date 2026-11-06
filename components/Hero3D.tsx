"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => null,
});

function StaticFallback() {
  return (
    <div className="relative mx-auto aspect-[0.86] w-full max-w-[300px]">
      <Image
        src="/images/Tirana_Club_Logo.svg.webp"
        alt="Stema e Klubit Sportiv Tirana"
        fill
        priority
        sizes="300px"
        className="object-contain drop-shadow-[0_30px_40px_rgba(6,14,31,0.45)]"
      />
    </div>
  );
}

export function Hero3D({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setReady(true);
  }, []);

  return (
    <div className={`relative h-[360px] w-full sm:h-[420px] lg:h-[480px] ${className ?? ""}`}>
      {ready && !reduced ? (
        <Hero3DScene />
      ) : (
        <div className="flex h-full items-center justify-center">
          <StaticFallback />
        </div>
      )}
    </div>
  );
}
