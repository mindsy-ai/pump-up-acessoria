import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeroV2 } from "@/components/pump-v2/HeroV2";
import { MultiStepFormV2 } from "@/components/pump-v2/MultiStepFormV2";

export const Route = createFileRoute("/diagnostico")({
  component: Diagnostico,
});

function Diagnostico() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [started]);

  if (!started) {
    return (
      <main className="min-h-screen text-white">
        <HeroV2 onStart={() => setStarted(true)} />
        <footer className="bg-[#1A0040] py-6 text-center text-xs text-white/50">
          © 2026 Pump Up Marketing — Assessoria Pump
        </footer>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0D0D0D] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6B1BFF]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-[#FF4500]/15 blur-[120px]" />
      </div>

      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold sm:text-sm">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-[#FF4500]" />
          <span className="text-white">
            Restam apenas <span className="text-pump-gradient">3 vagas</span> — seleção encerra sexta-feira
          </span>
        </div>
      </div>

      <div className="relative">
        <MultiStepFormV2 onExit={() => setStarted(false)} />
      </div>

      <footer className="relative mt-12 border-t border-white/5 py-6 text-center text-xs text-[#666]">
        © 2026 Pump Up Marketing — Assessoria Pump
      </footer>
    </main>
  );
}
