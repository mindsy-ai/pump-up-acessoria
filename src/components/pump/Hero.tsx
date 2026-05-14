import { motion } from "framer-motion";

const ANALYZED = [
  "Estrutura do tráfego pago",
  "Qualidade dos leads",
  "Processo comercial",
  "Tempo de resposta",
  "CRM e funil",
  "Follow-up",
  "Posicionamento digital",
  "Conversão",
  "Perdas ocultas",
];

const DELIVERABLES = [
  "Diagnóstico estratégico",
  "Identificação de gargalos",
  "Plano de melhorias",
  "Oportunidades de crescimento",
  "Direcionamentos claros",
];

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-4xl px-4 py-12 sm:py-20"
    >
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6B1BFF]/40 bg-[#6B1BFF]/10 px-4 py-1.5">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-pump-gradient">
          Pump Up Marketing
        </span>
      </div>

      <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
        Auditoria <span className="text-pump-gradient">Pump</span>
        <br />
        para Imobiliárias
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#CCCCCC]">
        Uma análise estratégica completa do marketing e do comercial da sua imobiliária —{" "}
        <span className="font-semibold text-white">100% gratuita para apenas 3 empresas selecionadas.</span>
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-pump-gradient">
            O que será analisado
          </h3>
          <ul className="space-y-2.5">
            {ANALYZED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#CCCCCC]">
                <span className="mt-0.5 text-[#FF4500]">✅</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#6B1BFF]/30 bg-gradient-to-br from-[#6B1BFF]/10 to-[#FF4500]/5 p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-pump-gradient">
            Ao final sua imobiliária receberá
          </h3>
          <ul className="space-y-2.5">
            {DELIVERABLES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white">
                <span className="mt-0.5 text-[#6B1BFF]">✔</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-[#FF4500]/40 bg-[#FF4500]/10 p-4 text-sm font-semibold text-white">
        ⚠️ Depois desta semana, a Auditoria Pump deixará de ser gratuita e passará a ser um serviço pago.
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="group inline-flex items-center gap-2 rounded-xl bg-pump-gradient px-8 py-4 text-base font-bold uppercase tracking-wide text-white shadow-[0_10px_40px_-10px_rgba(107,27,255,0.6)] transition-all hover:shadow-[0_15px_50px_-10px_rgba(255,69,0,0.7)]"
        >
          Quero me candidatar
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </motion.button>
        <p className="text-xs text-[#CCCCCC]">⏳ Tempo médio de preenchimento: 10 minutos</p>
      </div>
    </motion.div>
  );
}
