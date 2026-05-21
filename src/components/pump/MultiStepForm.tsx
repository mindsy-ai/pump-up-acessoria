import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressHeader } from "./ProgressHeader";
import { Field, RadioGroup, CheckboxGroup } from "./FormField";
import { Success } from "./Success";
import { supabase } from "@/integrations/supabase/client";

type FormData = Record<string, any>;

function genSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function trackLead(sessionId: string, formData: FormData, lastStep: number, isCompleted: boolean) {
  try {
    await supabase.from("form_leads").upsert(
      {
        session_id: sessionId,
        form_data: formData,
        last_step_completed: lastStep,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );
  } catch (err) {
    // fire-and-forget — never disrupt the user
    console.warn("[trackLead] failed", err);
  }
}

const MOTIVATIONAL: Record<number, string> = {
  1: "Vamos começar! 🚀",
  2: "Indo bem, continue! ⚡",
  3: "Você está indo muito bem! 💪",
  4: "Faltam só 2 etapas! 🔥",
  5: "Quase lá! Última etapa 🔥",
};

const STEP_TITLES: Record<number, string> = {
  1: "Sobre você e sua imobiliária",
  2: "Como funciona sua operação hoje?",
  3: "Como é o seu processo comercial?",
  4: "Como está o marketing da sua imobiliária?",
  5: "Última etapa — seus objetivos 🎯",
};

const stepFields: Record<number, string[]> = {
  1: ["nome_imob", "cidade_estado", "instagram", "responsavel", "cargo", "whatsapp", "email"],
  2: ["anos_mercado", "qtd_corretores", "foco", "leads_mes", "trafego_pago", "dificuldade_captar", "tempo_venda", "tempo_locacao"],
  3: ["distribuicao_leads", "crm", "follow_up", "gargalo", "tempo_resposta", "treinamento"],
  4: ["canais_marketing", "problema_marketing", "dificuldade_principal"],
  5: ["porque_participar", "meta_6m", "interesse_implementar", "ciente_vagas"],
};

export function MultiStepForm({ onExit: _onExit }: { onExit?: () => void }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>({ canais_marketing: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
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
    const required = stepFields[step];
    const errs: Record<string, string> = {};
    for (const f of required) {
      const v = data[f];
      if (f === "canais_marketing") {
        if (!Array.isArray(v) || v.length === 0) errs[f] = "Selecione ao menos uma opção";
      } else if (f === "ciente_vagas") {
        if (!v) errs[f] = "É necessário confirmar para enviar";
      } else if (!v || (typeof v === "string" && !v.trim())) {
        errs[f] = "Este campo é obrigatório";
      }
    }
    // conditional validation step 2
    if (step === 2 && data.trafego_pago === "Sim") {
      if (!data.investimento?.trim()) errs.investimento = "Informe o investimento médio";
      if (!data.justificativa?.trim()) errs.justificativa = "Justifique sua resposta";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step === 5) {
      setLoading(true);
      (async () => {
        try {
          await fetch("https://mindsy-n8n.nzsrfq.easypanel.host/webhook/recebe_dados_formulario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, submitted_at: new Date().toISOString() }),
          });
        } catch (err) {
          console.error("Webhook error:", err);
        } finally {
          void trackLead(sessionIdRef.current, data, 5, true);
          setLoading(false);
          setSubmitted(true);
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

  if (submitted) return <Success />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <ProgressHeader step={step} total={5} />

      <motion.p
        key={`motiv-${step}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center text-sm font-semibold text-pump-gradient"
      >
        {MOTIVATIONAL[step]}
      </motion.p>

      <div className="relative mt-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8"
          >
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {STEP_TITLES[step]}
            </h2>

            <div className="mt-6 space-y-5">
              {step === 1 && <Step1 data={data} set={set} errors={errors} />}
              {step === 2 && <Step2 data={data} set={set} errors={errors} />}
              {step === 3 && <Step3 data={data} set={set} errors={errors} />}
              {step === 4 && <Step4 data={data} set={set} errors={errors} />}
              {step === 5 && <Step5 data={data} set={set} errors={errors} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

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
          ) : step === 5 ? (
            "Enviar minha aplicação →"
          ) : (
            "Continuar →"
          )}
        </motion.button>
      </div>
    </div>
  );
}

type StepProps = { data: FormData; set: (k: string, v: any) => void; errors: Record<string, string> };

function Step1({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Nome da imobiliária" required error={errors.nome_imob}>
        <input className="pump-input" value={data.nome_imob || ""} onChange={(e) => set("nome_imob", e.target.value)} />
      </Field>
      <Field label="Cidade + Estado" required error={errors.cidade_estado}>
        <input className="pump-input" placeholder="Ex: São Paulo - SP" value={data.cidade_estado || ""} onChange={(e) => set("cidade_estado", e.target.value)} />
      </Field>
      <Field label="Site da imobiliária" hint="(se tiver)">
        <input className="pump-input" placeholder="https://" value={data.site || ""} onChange={(e) => set("site", e.target.value)} />
      </Field>
      <Field label="Instagram da imobiliária" required error={errors.instagram}>
        <input className="pump-input" placeholder="@suaimobiliaria" value={data.instagram || ""} onChange={(e) => set("instagram", e.target.value)} />
      </Field>
      <Field label="Nome do responsável" required error={errors.responsavel}>
        <input className="pump-input" value={data.responsavel || ""} onChange={(e) => set("responsavel", e.target.value)} />
      </Field>
      <Field label="Cargo do responsável" required error={errors.cargo}>
        <RadioGroup name="cargo" value={data.cargo || ""} onChange={(v) => set("cargo", v)}
          options={["Dono(a)", "Gerente Comercial", "Corretor(a)", "Secretário(a)", "Outro"]} />
      </Field>
      <Field label="WhatsApp para contato" required error={errors.whatsapp}>
        <input className="pump-input" placeholder="(00) 00000-0000" value={data.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} />
      </Field>
      <Field label="E-mail" required error={errors.email}>
        <input type="email" className="pump-input" value={data.email || ""} onChange={(e) => set("email", e.target.value)} />
      </Field>
    </>
  );
}

function Step2({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Há quantos anos a sua imobiliária atua no mercado?" required error={errors.anos_mercado}>
        <RadioGroup name="anos" value={data.anos_mercado || ""} onChange={(v) => set("anos_mercado", v)}
          options={["- de 6 meses", "6 meses - 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "+10 anos"]} />
      </Field>
      <Field label="Quantos corretores fazem parte da equipe atualmente?" required error={errors.qtd_corretores}>
        <RadioGroup name="corretores" value={data.qtd_corretores || ""} onChange={(v) => set("qtd_corretores", v)}
          options={["1-3", "3-10", "10-20", "20-30", "+30"]} />
      </Field>
      <Field label="Qual é o principal foco da imobiliária?" required error={errors.foco}>
        <RadioGroup name="foco" value={data.foco || ""} onChange={(v) => set("foco", v)}
          options={["Venda de imóveis", "Locação", "Alto padrão", "Minha Casa Minha Vida", "Lançamentos", "Imóveis comerciais", "Outro"]} />
      </Field>
      <Field label="Em média, quantos leads sua imobiliária recebe por mês?" required error={errors.leads_mes}>
        <RadioGroup name="leads" value={data.leads_mes || ""} onChange={(v) => set("leads_mes", v)}
          options={["Menos de 50", "50 a 100", "100 a 300", "300 a 500", "Mais de 500"]} />
      </Field>
      <Field label="Hoje vocês investem em tráfego pago?" required error={errors.trafego_pago}>
        <RadioGroup name="trafego" value={data.trafego_pago || ""} onChange={(v) => set("trafego_pago", v)}
          options={["Sim", "Não"]} />
      </Field>

      <AnimatePresence>
        {data.trafego_pago === "Sim" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5 overflow-hidden"
          >
            <Field label="Qual o investimento médio mensal em anúncios?" required error={errors.investimento}>
              <input className="pump-input" placeholder="Ex: R$ 5.000" value={data.investimento || ""} onChange={(e) => set("investimento", e.target.value)} />
            </Field>
            <Field label="Você considera esse valor baixo, alto ou ideal para o seu negócio? Justifique." required error={errors.justificativa}>
              <textarea rows={3} className="pump-input resize-none" value={data.justificativa || ""} onChange={(e) => set("justificativa", e.target.value)} />
            </Field>
          </motion.div>
        )}
      </AnimatePresence>

      <Field label="Você sente dificuldade de captar novos imóveis para venda/locação?" required error={errors.dificuldade_captar}>
        <RadioGroup name="dif_cap" value={data.dificuldade_captar || ""} onChange={(v) => set("dificuldade_captar", v)}
          options={["Sim", "Não", "Um pouco"]} />
      </Field>
      <Field label="Quanto tempo em média um imóvel demora para ser vendido na sua imobiliária?" required error={errors.tempo_venda}>
        <input className="pump-input" placeholder="Ex: 90 dias" value={data.tempo_venda || ""} onChange={(e) => set("tempo_venda", e.target.value)} />
      </Field>
      <Field label="Quanto tempo um imóvel demora para ser locado a partir da sua imobiliária?" required error={errors.tempo_locacao}>
        <input className="pump-input" placeholder="Ex: 30 dias" value={data.tempo_locacao || ""} onChange={(e) => set("tempo_locacao", e.target.value)} />
      </Field>
    </>
  );
}

function Step3({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Como os leads são distribuídos para os corretores atualmente?" required error={errors.distribuicao_leads}>
        <textarea rows={3} className="pump-input resize-none" value={data.distribuicao_leads || ""} onChange={(e) => set("distribuicao_leads", e.target.value)} />
      </Field>
      <Field label="Sua imobiliária utiliza CRM? Qual?" required error={errors.crm}>
        <input className="pump-input" value={data.crm || ""} onChange={(e) => set("crm", e.target.value)} />
      </Field>
      <Field label="Existe um processo de follow-up estruturado?" required error={errors.follow_up}>
        <RadioGroup name="fup" value={data.follow_up || ""} onChange={(v) => set("follow_up", v)}
          options={["Sim", "Não", "Parcialmente"]} />
      </Field>
      <Field label="Qual você acredita ser o maior gargalo comercial hoje?" required error={errors.gargalo} hint="(detalhe o máximo que puder)">
        <textarea rows={4} className="pump-input resize-none" value={data.gargalo || ""} onChange={(e) => set("gargalo", e.target.value)} />
      </Field>
      <Field label="Qual é o tempo médio de resposta dos seus corretores aos novos leads?" required error={errors.tempo_resposta}>
        <RadioGroup name="tresp" value={data.tempo_resposta || ""} onChange={(v) => set("tempo_resposta", v)}
          options={["Menos de 5 minutos", "5 a 15 minutos", "15 a 30 minutos", "Mais de 30 minutos"]} />
      </Field>
      <Field label="Os corretores recebem treinamento comercial constante?" required error={errors.treinamento}>
        <RadioGroup name="trein" value={data.treinamento || ""} onChange={(v) => set("treinamento", v)}
          options={["Sim", "Não", "Às Vezes"]} />
      </Field>
    </>
  );
}

function Step4({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Quais canais de marketing vocês utilizam hoje?" required error={errors.canais_marketing} hint="(múltipla escolha)">
        <CheckboxGroup
          value={data.canais_marketing || []}
          onChange={(v) => set("canais_marketing", v)}
          options={["Instagram", "Facebook ADS", "Google Ads", "Portais Imobiliários (ZAP, OLX etc.)", "Indicação", "YouTube", "TikTok", "E-mail Marketing", "WhatsApp", "Outro"]}
        />
      </Field>
      <Field label="Qual você acredita ser o maior problema do marketing da imobiliária hoje?" required error={errors.problema_marketing}>
        <textarea rows={4} className="pump-input resize-none" value={data.problema_marketing || ""} onChange={(e) => set("problema_marketing", e.target.value)} />
      </Field>
      <Field label="Hoje vocês têm mais dificuldade em:" required error={errors.dificuldade_principal}>
        <RadioGroup name="dif_p" value={data.dificuldade_principal || ""} onChange={(v) => set("dificuldade_principal", v)}
          options={["Gerar leads", "Converter leads", "Organizar o comercial", "Acompanhar os corretores", "Melhorar o posicionamento da marca", "Escalar vendas"]} />
      </Field>
    </>
  );
}

function Step5({ data, set, errors }: StepProps) {
  return (
    <>
      <Field label="Por que sua imobiliária deseja participar da Auditoria Pump?" required error={errors.porque_participar}>
        <textarea rows={4} className="pump-input resize-none" value={data.porque_participar || ""} onChange={(e) => set("porque_participar", e.target.value)} />
      </Field>
      <Field label="Qual a meta que vocês desejam alcançar nos próximos 6 meses?" required error={errors.meta_6m}>
        <textarea rows={4} className="pump-input resize-none" value={data.meta_6m || ""} onChange={(e) => set("meta_6m", e.target.value)} />
      </Field>
      <Field label="Se identificarmos oportunidades claras de crescimento, vocês possuem interesse em implementar melhorias na operação?" required error={errors.interesse_implementar}>
        <RadioGroup name="interesse" value={data.interesse_implementar || ""} onChange={(v) => set("interesse_implementar", v)}
          options={["Sim", "Não"]} />
      </Field>
      <Field
        label="Você entende que esta edição gratuita possui apenas 3 vagas e que o preenchimento do formulário não garante aprovação?"
        required
        error={errors.ciente_vagas}
      >
        <button
          type="button"
          onClick={() => set("ciente_vagas", !data.ciente_vagas)}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
            data.ciente_vagas
              ? "border-[#6B1BFF] bg-[#6B1BFF]/15 text-white shadow-[0_0_20px_rgba(107,27,255,0.35)]"
              : "border-white/10 bg-[#1A1A1A] text-[#CCCCCC] hover:border-[#6B1BFF]/60"
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${data.ciente_vagas ? "border-[#FF4500] bg-[#FF4500]/20" : "border-white/30"}`}>
            {data.ciente_vagas && (
              <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3 text-[#FF4500]">
                <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="font-medium">Sim, entendo</span>
        </button>
      </Field>
    </>
  );
}
