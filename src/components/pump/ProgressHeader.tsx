import { motion } from "framer-motion";

const STEP_LABELS = ["Imobiliária", "Operação", "Comercial", "Marketing", "Objetivos"];

export function ProgressHeader({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className="text-white">Etapa {step} de {total}</span>
        <span className="text-pump-gradient font-bold">{pct}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 bg-pump-gradient"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const current = n === step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: current ? 1.1 : 1 }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                  done
                    ? "border-[#FF4500] bg-[#FF4500] text-white"
                    : current
                    ? "border-[#6B1BFF] bg-[#6B1BFF] text-white shadow-[0_0_18px_rgba(107,27,255,0.7)]"
                    : "border-white/20 bg-[#1A1A1A] text-white/40"
                }`}
              >
                {done ? "✓" : n}
              </motion.div>
              <span className={`hidden text-[10px] font-medium uppercase tracking-wide sm:block ${current ? "text-white" : "text-white/40"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
