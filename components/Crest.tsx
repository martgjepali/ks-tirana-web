"use client";

import { useRef } from "react";
import Image from "next/image";

export function Crest({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(py * -14).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(px * 16).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(50 + px * 60).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(50 + py * 60).toFixed(1)}%`);
    });
  }

  function handleLeave() {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--gx", `50%`);
    el.style.setProperty("--gy", `35%`);
  }

  return (
    <div
      className={`relative [perspective:1200px] ${className ?? ""}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <div
        ref={wrapRef}
        className="crest-tilt relative mx-auto aspect-[0.86] w-full max-w-[280px] [transform-style:preserve-3d] transition-transform duration-300 ease-out motion-reduce:[transform:none]"
        style={
          {
            "--rx": "0deg",
            "--ry": "0deg",
            "--gx": "50%",
            "--gy": "35%",
            transform: "rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0)",
          } as React.CSSProperties
        }
      >
        <div className="crest-float relative h-full w-full [transform-style:preserve-3d]">
          <Image
            src="/images/Tirana_Club_Logo.svg.webp"
            alt="Stema e Klubit Sportiv Tirana"
            fill
            priority
            sizes="280px"
            className="relative z-10 object-contain drop-shadow-[0_30px_40px_rgba(6,14,31,0.45)]"
          />
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-60 mix-blend-soft-light"
            style={{
              background:
                "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.85), transparent 55%)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes crestFloat {
          0%, 100% { transform: translateY(0px) translateZ(40px); }
          50% { transform: translateY(-10px) translateZ(40px); }
        }
        .crest-float {
          animation: crestFloat 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .crest-float { animation: none; }
        }
      `}</style>
    </div>
  );
}
