import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

export function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-white">
        {label} {required && <span className="text-[#FF4500]">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-[#CCCCCC]">{hint}</span>}
      </label>
      <motion.div
        animate={error ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium text-[#FF4500]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              selected
                ? "border-[#6B1BFF] bg-[#6B1BFF]/15 text-white shadow-[0_0_20px_rgba(107,27,255,0.35)]"
                : "border-white/10 bg-[#1A1A1A] text-[#CCCCCC] hover:border-[#6B1BFF]/60 hover:text-white"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                selected ? "border-[#FF4500] bg-[#FF4500]/20" : "border-white/30"
              }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-[#FF4500]" />}
            </span>
            <span className="font-medium">{opt}</span>
            <input type="radio" name={name} value={opt} checked={selected} readOnly className="sr-only" />
          </button>
        );
      })}
    </div>
  );
}

export function CheckboxGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              selected
                ? "border-[#6B1BFF] bg-[#6B1BFF]/15 text-white shadow-[0_0_20px_rgba(107,27,255,0.35)]"
                : "border-white/10 bg-[#1A1A1A] text-[#CCCCCC] hover:border-[#6B1BFF]/60 hover:text-white"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                selected ? "border-[#FF4500] bg-[#FF4500]/20" : "border-white/30"
              }`}
            >
              {selected && (
                <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3 text-[#FF4500]">
                  <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="font-medium">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
