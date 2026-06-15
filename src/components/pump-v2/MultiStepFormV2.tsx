import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ProgressHeader } from "@/components/pump/ProgressHeader";
import { Field, RadioGroup } from "@/components/pump/FormField";
import { trackLeadFn } from "@/lib/track-lead";

export const CALENDAR_BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1d-H_dhM5xg65jQpnsyKoBckj8nOnYGKrHjA25QT1__mLgnobLFvvDZiubq6oGobIhSiYWysyo?gv=true";

type FormData = Record<string, any>;

function genSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function trackLead(sessionId: string, formData: FormData, lastStep: number, isCompleted: boolean) {
  try {
    await trackLeadFn({
      data: {
        sessionId,
        formData: { ...formData, variant: "diagnostico_v2" },
        lastStep,
        isCompleted,
      },
    });
  } catch (err) {
    console.error("[trackLead] failed", err);
  }
}

const MOTIVATIONAL: Record<number, string> = {
  1: "Vamos começar! 🚀",
  2: "Indo bem, continue! ⚡",
  3: "Última etapa — quase lá! 🔥",
};

const STEP_TITLES: Record<number, string> = {
  1: "Sobre você e sua empresa",
  2: "Sobre o seu negócio",
  3: "Diagnóstico comercial",
};

const stepFields: Record<number, string[]> = {
  1: ["nome", "whatsapp", "email", "empresa"],
  2: ["servico", "qtd_vendedores", "faturamento"],
  3: ["gargalo", "usa_crm", "geracao_clientes"],
};

export function MultiStepFormV2({ onExit: _onExit }: { onExit?: () => void }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const sessionIdRef = useRef<string>(genSessionId());

  const set = (k: string, v: any) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => {
      const { [k]: _, ...rest } = e;
      return rest;
    });
  };

  const validate = () => {
    const required = stepFields[step] || [];
    const errs: Record<string, string> = {};
    for (const f of required) {
      const v = data[f];
      if (!v || (typeof v === "string" && !v.trim())) {
        errs[f] = "Este campo é obrigatório";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step === 4) return;
    if (!validate()) return;
    if (step === 3) {
      setLoading(true);
      (async () => {
        try {
          await fetch("https://mindsy-n8n.nzsrfq.easypanel.host/webhook/recebe_dados_formulario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, variant: "diagnostico_v2", submitted_at: new Date().toISOString() }),
          });
        } catch (err) {
          console.error("Webhook error:", err);
        } finally {
          void trackLead(sessionIdRef.current, data, 4, true);
          setLoading(false);
          setDirection(1);
          setStep(4);
        }
      })();
      return;
    }
    void trackLead(sessionIdRef.current, data, step, false);
    setDirection(1);
    setStep((s) => s + 1);
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  useEffect(() => {
    if (step !== 4) return;
    const fire = (delay: number, opts: confetti.Options) =>
      setTimeout(() => confetti({ ...opts, colors: ["#6B1BFF", "#FF4500", "#ffffff"] }), delay);
    fire(0, { particleCount: 120, spread: 90, origin: { y: 0.6 } });
    fire(300, { particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
    fire(500, { particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });
  }, [step]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <ProgressHeader step={step} total={4} />

      {step < 4 && (
        <motion.p
          key={`motiv-${step}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-sm font-semibold text-pump-gradient"
        >
          {MOTIVATIONAL[step]}
        </motion.p>
      )}

      <div className="relative mt-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`rounded-2xl border border-white/10 bg-[#141414] ${step === 4 ? "p-3 sm:p-6" : "p-6 sm:p-8"}`}
          >
            {step < 4 && (
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {STEP_TITLES[step]}
              </h2>
            )}

            <div className={step < 4 ? "mt-6 space-y-5" : ""}>
              {step === 1 && <Step1 data={data} set={set} errors={errors} />}
              {step === 2 && <Step2 data={data} set={set} errors={errors} />}
              {step === 3 && <Step3 data={data} set={set} errors={errors} />}
              {step === 4 && <Step4Calendar nome={data.nome} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {step < 4 && (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <button
              onClick={back}
              type="button"
              className="rounded-xl border border-white/15 bg-[#1A1A1A] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
            >
              ← Voltar
            </button>
          ) : <div />}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={next}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pump-gradient px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(107,27,255,0.7)] disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Enviando...
              </span>
            ) : step === 3 ? (
              "Enviar candidatura →"
            ) : (
              "Continuar →"
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}

type StepProps = { data: FormData; set: (k: string, v: any) => void; errors: Record<string, string> };

function Step1({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Nome completo" required error={errors.nome}>
        <input className="pump-input" value={data.nome || ""} onChange={(e) => set("nome", e.target.value)} />
      </Field>
      <Field label="WhatsApp" required error={errors.whatsapp}>
        <input className="pump-input" placeholder="(00) 00000-0000" value={data.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} />
      </Field>
      <Field label="E-mail" required error={errors.email}>
        <input type="email" className="pump-input" value={data.email || ""} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Nome da empresa" required error={errors.empresa}>
        <input className="pump-input" value={data.empresa || ""} onChange={(e) => set("empresa", e.target.value)} />
      </Field>
    </>
  );
}

function Step2({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Qual serviço sua empresa oferece?" required error={errors.servico}>
        <input className="pump-input" value={data.servico || ""} onChange={(e) => set("servico", e.target.value)} />
      </Field>
      <Field label="Quantos vendedores tem no seu time?" required error={errors.qtd_vendedores}>
        <RadioGroup name="qtd_vend" value={data.qtd_vendedores || ""} onChange={(v) => set("qtd_vendedores", v)}
          options={["1", "2–5", "6–10", "11+"]} />
      </Field>
      <Field label="Faturamento mensal aproximado" required error={errors.faturamento}>
        <RadioGroup name="fat" value={data.faturamento || ""} onChange={(v) => set("faturamento", v)}
          options={["Até R$20k", "R$20k–R$50k", "R$50k–R$100k", "R$100k–R$300k", "Acima de R$300k"]} />
      </Field>
    </>
  );
}

function Step3({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Qual é o maior gargalo de vendas hoje na sua empresa?" required error={errors.gargalo}>
        <textarea rows={4} className="pump-input resize-none" value={data.gargalo || ""} onChange={(e) => set("gargalo", e.target.value)} />
      </Field>
      <Field label="Você já usa algum CRM?" required error={errors.usa_crm}>
        <RadioGroup name="crm" value={data.usa_crm || ""} onChange={(v) => set("usa_crm", v)}
          options={["Sim", "Não", "Estou tentando organizar"]} />
      </Field>
      <Field label="Como você gera clientes hoje?" required error={errors.geracao_clientes}>
        <RadioGroup name="ger" value={data.geracao_clientes || ""} onChange={(v) => set("geracao_clientes", v)}
          options={["Indicação", "Tráfego pago", "Prospecção ativa", "Combinação", "Não tenho um processo definido"]} />
      </Field>
    </>
  );
}

function Step4Calendar({ nome }: { nome?: string }) {
  const [booked, setBooked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showError, setShowError] = useState(false);
  const firstName = nome ? nome.split(" ")[0] : "você";

  const handleBookedClick = () => {
    if (!confirmed) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setBooked(true);
  };

  return (
    <div className="py-2 text-center">
      {/* Success icon — compacto no mobile */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF4500]/15 shadow-[0_0_40px_rgba(255,69,0,0.4)] sm:mb-4 sm:h-20 sm:w-20"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#FF4500] sm:h-12 sm:w-12">
          <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <h2 className="font-display text-xl font-black text-white sm:text-2xl">
        Candidatura enviada, {firstName}!
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[14px] leading-[1.5] text-white/80 sm:mt-3 sm:text-[15px]">
        Escolha o melhor horário para seu diagnóstico.
      </p>

      <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#FF4500]/50 bg-[#FF4500]/10 px-3 py-1.5 text-[12px] font-bold text-white sm:mt-4 sm:gap-2 sm:px-4 sm:py-2 sm:text-[13px]">
        🔥 Restam apenas <span className="text-[#FF4500]">3 vagas</span> para esta semana
      </div>

      {/* Calendar embed area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 sm:mt-6"
      >
        {!booked ? (
          <div className="overflow-hidden rounded-2xl border border-[#6B1BFF]/40">
            {/* Header compacto */}
            <div className="flex items-center gap-2.5 border-b border-white/10 bg-[#6B1BFF]/10 px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3.5">
              <span className="text-lg sm:text-xl">📅</span>
              <div className="text-left">
                <p className="text-[12px] font-bold text-white sm:text-[13px]">Agendar Diagnóstico Estratégico</p>
                <p className="text-[10px] text-white/50 sm:text-[11px]">45–60 min · Google Meet · Gratuito</p>
              </div>
            </div>

            {/* Calendar iframe — altura responsiva ao viewport */}
            <div className="bg-white">
              <iframe
                src={CALENDAR_BOOKING_URL}
                title="Agendar diagnóstico"
                className="w-full border-0"
                style={{ height: "min(600px, calc(100svh - 300px))", minHeight: "420px" }}
                allow="camera; microphone"
              />
            </div>

            {/* Confirmation checkbox + button */}
            <div className="border-t border-white/10 bg-[#0D0D0D] px-5 py-4">
              <label className="flex cursor-pointer items-start gap-3 text-left">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    if (e.target.checked) setShowError(false);
                  }}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-green-500"
                />
                <span className="text-[13px] leading-[1.5] text-white/70">
                  Confirmo que selecionei um horário no calendário acima e recebi a confirmação por e-mail.
                </span>
              </label>

              {showError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-[12px] text-red-400"
                >
                  Confirme o agendamento antes de continuar.
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: confirmed ? 1.02 : 1 }}
                whileTap={{ scale: confirmed ? 0.97 : 1 }}
                type="button"
                onClick={handleBookedClick}
                className={`mt-4 w-full rounded-xl px-6 py-3.5 text-[15px] font-bold uppercase tracking-wide text-white transition ${
                  confirmed
                    ? "bg-green-600 shadow-[0_6px_24px_rgba(22,163,74,0.45)] hover:bg-green-500"
                    : "cursor-not-allowed bg-white/10 text-white/30"
                }`}
              >
                ✅ Agendamento realizado
              </motion.button>
            </div>
          </div>
        ) : (
          /* Post-booking confirmation */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#6B1BFF]/40 bg-[#6B1BFF]/10 p-6"
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#6B1BFF]/20 text-2xl">
              🎉
            </div>
            <h3 className="text-[18px] font-bold text-white">Diagnóstico agendado!</h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-white/70">
              Você receberá a confirmação por e-mail com o link do Google Meet.
              Nossa equipe estará pronta para a sua sessão.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Trust signal */}
      {!booked && (
        <p className="mt-4 text-[12px] text-white/40">
          Confirmação automática por e-mail + convite no Google Calendar
        </p>
      )}
    </div>
  );
}
