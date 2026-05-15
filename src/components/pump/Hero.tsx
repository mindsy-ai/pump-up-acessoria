import { useState } from "react";
import { motion } from "framer-motion";
import pumpLogo from "@/assets/pump-logo.png";
import { StoriesPlayer } from "./StoriesPlayer";

const ANALYZED = [
  "Estrutura do tráfego pago",
  "Qualidade dos leads",
  "Processo comercial",
  "Tempo de resposta dos corretores",
  "CRM e organização do funil",
  "Estratégia de follow-up",
  "Posicionamento digital",
  "Conversão de atendimentos em vendas",
  "Perdas ocultas no processo comercial",
];


export function Hero({ onStart }: { onStart: () => void }) {
  const [openStories, setOpenStories] = useState(false);

  return (
    <>
      {/* Fixed top bar */}
      <div
        className="fixed left-0 right-0 top-0 z-[100] flex h-9 items-center justify-center bg-[#0D0D0D] text-[13px] font-bold text-white"
      >
        <span className="mr-1.5 text-[#FF4500]">●</span>
        Restam apenas&nbsp;<span className="text-[#FF4500]">3 vagas</span>&nbsp;nesta edição gratuita
      </div>

      <section
        className="min-h-screen w-full pt-9"
        style={{ background: "linear-gradient(180deg, #3D0080 0%, #1A0040 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-xl flex-col items-center px-5 pb-16 pt-8 text-center"
        >
          {/* 1. Stories ring */}
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

          {/* 2. Creator credit */}
          <p className="mt-2.5 text-[13px] text-white/70">
            Criado por <span className="text-[#9B6FFF]">@pumpup_mkt</span>
          </p>

          {/* 3. Title */}
          <h1
            className="mt-4 font-display font-black uppercase leading-[1.1] text-white"
            style={{ fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 900 }}
          >
            Auditoria{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #FF4500 0%, #6B1BFF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Pump
            </span>
            <br />
            Para Imobiliárias
          </h1>

          {/* 4. CTA */}
          <button
            onClick={onStart}
            className="mt-5 w-full rounded-full bg-[#FF4500] px-6 py-5 text-[17px] font-bold uppercase tracking-[0.5px] text-white shadow-[0_6px_24px_rgba(255,69,0,0.5)] transition active:scale-[0.98] hover:bg-[#E03D00]"
          >
            Quero me candidatar →
          </button>

          {/* 5. Description */}
          <p className="mt-5 text-[17px] leading-[1.6] text-white">
            Uma análise estratégica completa do marketing e do comercial da sua imobiliária —{" "}
            <span className="font-bold">100% gratuita para apenas 3 empresas selecionadas.</span>
          </p>

          {/* 6. Card */}
          <div className="mt-6 w-full rounded-2xl bg-black/30 p-5 text-left">
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[1.5px] text-[#9B6FFF]">
              O que será analisado
            </h3>
            <ul className="space-y-2.5">
              {ANALYZED.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-white">
                  <span className="leading-none">✅</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      <StoriesPlayer isOpen={openStories} onClose={() => setOpenStories(false)} />
    </>
  );
}
