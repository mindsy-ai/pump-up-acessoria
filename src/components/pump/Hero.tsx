import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pumpLogo from "@/assets/pump-logo.png";
import { StoriesPlayer } from "./StoriesPlayer";
import { Countdown } from "./Countdown";

const QUALIFIERS = [
  "Sua empresa vende serviços B2B e precisa de mais clientes previsíveis",
  "Você já tem um produto validado mas o processo comercial ainda é frágil",
  "Quer escalar sem depender só de indicação ou esforço manual",
  "Você possui um time comercial",
];

const DELIVERABLES: { title: string; items: string[] }[] = [
  {
    title: "Aquisição",
    items: [
      "Gestão de tráfego pago (Meta e Google Ads)",
      "Geração de listas de leads para prospecção fria",
    ],
  },
  {
    title: "Conversão",
    items: [
      "Criação e otimização de Páginas de Venda de alta conversão",
      "Estruturação e treinamento do time comercial",
    ],
  },
  {
    title: "Operação",
    items: [
      "Implantação de CRM automatizado",
      "Acompanhamento de resultados semanalmente",
    ],
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "O diagnóstico é totalmente gratuito?",
    a: "Sim. O diagnóstico estratégico é 100% gratuito e sem compromisso. Selecionamos 5 empresas por edição e analisamos seu processo de aquisição e vendas sem nenhum custo. A implementação das estratégias identificadas é um serviço separado, apresentado apenas para quem tiver interesse após o diagnóstico.",
  },
  {
    q: "Quanto tempo dura a assessoria?",
    a: "A implantação completa leva em média 60 a 90 dias, com acompanhamento semanal de resultados durante todo o período.",
  },
  {
    q: "O que acontece depois da candidatura?",
    a: "Nossa equipe analisa sua aplicação em até 48h. Se você for selecionado, entramos em contato pelo WhatsApp para alinhar o início.",
  },
  {
    q: "Tem algum compromisso depois?",
    a: "Nenhum. A assessoria é entregue sem contrato de continuidade obrigatório.",
  },
];

export function Hero({ onStart }: { onStart: () => void }) {
  const [openStories, setOpenStories] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Fixed top bar */}
      <div className="fixed left-0 right-0 top-0 z-[100] flex flex-col items-center justify-center bg-[#0D0D0D] px-3 py-1.5 text-center text-white">
        <div className="text-[12px] font-bold leading-tight sm:text-[13px]">
          <span className="mr-1.5 text-[#FF4500]">●</span>
          Restam apenas <span className="text-[#FF4500]">3 vagas</span> — seleção encerra sexta-feira
        </div>
        <div className="text-[11px] font-semibold leading-tight sm:text-[12px]">
          <Countdown />
        </div>
      </div>

      <section
        className="min-h-screen w-full pt-14"
        style={{ background: "linear-gradient(180deg, #3D0080 0%, #1A0040 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-xl flex-col items-center px-5 pb-16 pt-8 text-center"
        >
          {/* Stories ring */}
          <button
            onClick={() => setOpenStories(true)}
            aria-label="Ver stories da Pump Up"
            className="h-[140px] w-[140px] animate-ring-pulse rounded-full p-[4px] transition active:scale-95"
            style={{ background: "conic-gradient(from 0deg, #FF4500, #CC0080, #6B1BFF, #FF4500)" }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-black">
              <img src={pumpLogo} alt="Pump Up Marketing" className="h-[65%] w-[65%] object-contain" />
            </div>
          </button>

          <p className="mt-2.5 text-[13px] text-white/70">
            Criado por <span className="text-[#9B6FFF]">@pumpup_mkt</span>
          </p>

          {/* Headline */}
          <h1
            className="mt-4 font-display font-black uppercase leading-[1.1] tracking-[1px] text-white"
            style={{ fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900 }}
          >
            Aplicação{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #FF4500 0%, #6B1BFF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Diagnóstico
            </span>{" "}
            Estratégico Gratuito
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-[17px] leading-[1.6] text-white">
            Uma análise estratégica completa do seu processo de aquisição e vendas B2B —{" "}
            <span className="font-bold">entregue, implantada e acompanhada pela Pump Up Marketing.</span>
          </p>

          {/* Primary CTA */}
          <button
            onClick={onStart}
            className="mt-6 w-full rounded-full bg-[#FF4500] px-6 py-5 text-[17px] font-bold uppercase tracking-[0.5px] text-white shadow-[0_6px_24px_rgba(255,69,0,0.5)] transition active:scale-[0.98] hover:bg-[#E03D00]"
          >
            Quero minha análise gratuita →
          </button>

          {/* Qualifier block */}
          <div className="mt-10 w-full text-left">
            <h3 className="mb-4 text-center text-[13px] font-bold uppercase tracking-[1.5px] text-[#9B6FFF]">
              Esta assessoria é para você se:
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {QUALIFIERS.map((q) => (
                <div
                  key={q}
                  className="rounded-2xl border border-[#FF4500]/30 bg-black/30 p-4 text-[14px] leading-[1.5] text-white"
                >
                  <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF4500]/15 text-[#FF4500]">
                    ✓
                  </div>
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables grouped */}
          <div className="mt-10 w-full text-left">
            <h3 className="mb-4 text-center text-[13px] font-bold uppercase tracking-[1.5px] text-[#9B6FFF]">
              O que você vai receber
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {DELIVERABLES.map((b) => (
                <div key={b.title} className="rounded-2xl bg-black/30 p-5">
                  <h4 className="mb-3 text-[15px] font-bold text-white">{b.title}</h4>
                  <ul className="space-y-2.5">
                    {b.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-white">
                        <span className="leading-none">✅</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 w-full rounded-2xl border-l-4 border-[#FF4500] bg-black/30 p-5 text-left">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-[15px] italic leading-[1.55] text-white">
                  "Em 90 dias, estruturamos o processo de prospecção do zero e triplicamos o volume de reuniões qualificadas por semana."
                </p>
                <p className="mt-3 text-[13px] text-white/70">
                  — Diretor comercial, empresa de serviços de TI B2B
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: "+3x", l: "reuniões qualificadas" },
                  { n: "90", l: "dias de implantação" },
                  { n: "CRM", l: "+ time treinado" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-[#1A1A1A] p-3 text-center">
                    <div className="text-[18px] font-black leading-tight text-[#FF4500]">{s.n}</div>
                    <div className="mt-1 text-[11px] leading-tight text-white/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-10 w-full text-left">
            <h3 className="mb-4 text-center text-[13px] font-bold uppercase tracking-[1.5px] text-[#9B6FFF]">
              Dúvidas frequentes
            </h3>
            <div className="space-y-2">
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[15px] font-semibold text-white"
                    >
                      <span>{item.q}</span>
                      <span
                        className={`text-[#FF4500] transition-transform ${open ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        ▾
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-[14px] leading-[1.6] text-white/80">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Second CTA */}
          <div className="mt-10 w-full">
            <p className="mb-3 text-[15px] text-white">
              Pronto para estruturar seu processo de aquisição B2B?
            </p>
            <button
              onClick={onStart}
              className="w-full rounded-full bg-[#FF4500] px-6 py-5 text-[17px] font-bold uppercase tracking-[0.5px] text-white shadow-[0_6px_24px_rgba(255,69,0,0.5)] transition active:scale-[0.98] hover:bg-[#E03D00]"
            >
              Quero minha análise gratuita →
            </button>
          </div>
        </motion.div>
      </section>

      <StoriesPlayer isOpen={openStories} onClose={() => setOpenStories(false)} />
    </>
  );
}
