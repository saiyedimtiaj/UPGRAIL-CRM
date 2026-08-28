"use client"
import React from "react";
import { Rocket, ArrowLeft } from "lucide-react";

const COLORS = {
  canvas: "#f8faf9",
  ink: "#0c1410",
  text: "#0c1410",
  muted: "#6b7d74",
  emerald: "#10b981",
  emeraldSoft: "#e7f7f0",
  emeraldLine: "#059669",
};

export default function ComingSoon({
  title = "Something great is on the way",
  description = "We're building this page right now. It'll be worth the wait.",
  ctaLabel = "Back to dashboard",
}) {
  return (
    <div
      className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden px-6"
    >
      <style>{`
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: .35; }
          80% { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(14px,-18px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ring-pulse { animation: ringPulse 2.8s cubic-bezier(.2,.7,.4,1) infinite; }
        .orbit-spin { animation: orbit 14s linear infinite; }
        .float-blob { animation: floatBlob 8s ease-in-out infinite; }
        .fade-up { animation: fadeUp .8s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ring-pulse, .orbit-spin, .float-blob, .fade-up { animation: none !important; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${COLORS.emeraldLine}22 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 72%)",
        }}
      />

      <div
        className="float-blob pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(16,185,129,0.14)" }}
      />
      <div
        className="float-blob pointer-events-none absolute -right-20 bottom-16 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(5,150,105,0.12)", animationDelay: "2.4s" }}
      />

      <div className="relative flex max-w-lg flex-col items-center text-center">
        <div className="fade-up relative mb-10 flex h-28 w-28 items-center justify-center">
          <span className="ring-pulse absolute h-full w-full rounded-full border" style={{ borderColor: COLORS.emerald }} />
          <span
            className="ring-pulse absolute h-full w-full rounded-full border"
            style={{ borderColor: COLORS.emerald, animationDelay: "1.4s" }}
          />
          <svg className="orbit-spin absolute h-full w-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke={COLORS.emeraldSoft} strokeWidth="1.5" />
            <circle cx="50" cy="4" r="3" fill={COLORS.emerald} />
          </svg>
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: COLORS.ink, boxShadow: "0 18px 40px -12px rgba(16,185,129,0.45)" }}
          >
            <Rocket className="h-7 w-7" style={{ color: COLORS.emerald }} />
          </div>
        </div>

        <div
          className="fade-up mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-widest"
          style={{ backgroundColor: COLORS.emeraldSoft, color: COLORS.emeraldLine, animationDelay: "80ms" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS.emerald }} />
          Under construction
        </div>

        <h1
          className="fade-up text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          style={{ color: COLORS.text, animationDelay: "150ms" }}
        >
          {title}
        </h1>

        <p
          className="fade-up mt-4 max-w-sm text-base leading-relaxed"
          style={{ color: COLORS.muted, animationDelay: "220ms" }}
        >
          {description}
        </p>

        <button
          className="fade-up mt-9 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform active:scale-95"
          style={{ backgroundColor: COLORS.ink, animationDelay: "300ms" }}
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}