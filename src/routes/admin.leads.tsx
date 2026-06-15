import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeadsPage,
});

type Lead = {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  last_step_completed: number;
  is_completed: boolean;
  form_data: Record<string, any>;
};

type Filter = "all" | "completed" | "incomplete";
type OriginFilter = "all" | "padrao" | "diagnostico";
type Tab = "dashboard" | "leads";

function getOrigin(lead: Lead): { label: string; variant: OriginFilter } {
  const v = lead.form_data?.variant;
  if (v === "diagnostico_v2") return { label: "/diagnostico", variant: "diagnostico" };
  return { label: "Padrão", variant: "padrao" };
}

function OriginBadge({ lead }: { lead: Lead }) {
  const origin = getOrigin(lead);
  if (origin.variant === "diagnostico") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-300">
        📅 Auto agendamento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300">
      🎯 Seletivo
    </span>
  );
}

const COLORS = ["#FF4500", "#6B1BFF", "#CC0080", "#FF8C00", "#00C49F", "#FFBB28"];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function toCsv(rows: Lead[]) {
  const keys = new Set<string>();
  rows.forEach((r) => Object.keys(r.form_data || {}).forEach((k) => keys.add(k)));
  const dataCols = Array.from(keys);
  const header = ["id", "session_id", "created_at", "updated_at", "last_step_completed", "is_completed", ...dataCols];
  const escape = (v: any) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.session_id,
        r.created_at,
        r.updated_at,
        r.last_step_completed,
        r.is_completed,
        ...dataCols.map((k) => escape(r.form_data?.[k])),
      ].join(","),
    );
  }
  return lines.join("\n");
}

function countByField(leads: Lead[], field: string): { name: string; total: number }[] {
  const map: Record<string, number> = {};
  for (const l of leads) {
    const v = l.form_data?.[field];
    if (v) map[v] = (map[v] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

function countByDay(leads: Lead[]): { day: string; total: number }[] {
  const map: Record<string, number> = {};
  for (const l of leads) {
    const day = new Date(l.created_at).toLocaleDateString("pt-BR");
    map[day] = (map[day] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([day, total]) => ({ day, total }))
    .sort((a, b) => {
      const [da, ma, ya] = a.day.split("/").map(Number);
      const [db, mb, yb] = b.day.split("/").map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
      <p className="mb-4 text-sm font-semibold text-white/80">{title}</p>
      {children}
    </div>
  );
}

function Dashboard({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const completed = leads.filter((l) => l.is_completed).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const padrao = leads.filter((l) => getOrigin(l).variant === "padrao");
  const diagnostico = leads.filter((l) => getOrigin(l).variant === "diagnostico");
  const byOrigin = [
    { name: "Seletivo", total: padrao.length },
    { name: "Auto agendamento", total: diagnostico.length },
  ];

  const funnelData = [
    { name: "Parou na etapa 1", total: leads.filter((l) => l.last_step_completed === 1 && !l.is_completed).length },
    { name: "Parou na etapa 2", total: leads.filter((l) => l.last_step_completed === 2 && !l.is_completed).length },
    { name: "Parou na etapa 3", total: leads.filter((l) => l.last_step_completed === 3 && !l.is_completed).length },
    { name: "Concluíram", total: completed },
  ];

  const byDay = countByDay(leads);
  const faturamento = countByField(leads, "faturamento");
  const vendedores = countByField(leads, "qtd_vendedores");
  const crm = countByField(leads, "usa_crm");
  const geracaoClientes = countByField(leads, "geracao_clientes");

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de candidaturas" value={total} />
        <StatCard label="Concluídas" value={completed} sub={`${rate}% de conclusão`} />
        <StatCard label="Incompletas" value={total - completed} sub="abandonaram o formulário" />
        <StatCard label="Taxa de conclusão" value={`${rate}%`} />
      </div>

      {/* Origem cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300/70">🎯 Seletivo</p>
          <p className="mt-2 text-3xl font-black text-white">{padrao.length}</p>
          <p className="mt-1 text-xs text-white/40">
            {padrao.filter((l) => l.is_completed).length} concluídos
          </p>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/70">📅 Auto agendamento</p>
          <p className="mt-2 text-3xl font-black text-white">{diagnostico.length}</p>
          <p className="mt-1 text-xs text-white/40">
            {diagnostico.filter((l) => l.is_completed).length} concluídos
          </p>
        </div>
      </div>

      {/* Candidaturas por página */}
      <ChartCard title="Candidaturas por página de origem">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={byOrigin}>
            <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 13 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#a78bfa" }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Candidaturas">
              <Cell fill="#3b82f6" />
              <Cell fill="#8b5cf6" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Candidaturas por dia */}
      <ChartCard title="Candidaturas por dia">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byDay}>
            <XAxis dataKey="day" tick={{ fill: "#ffffff60", fontSize: 11 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#FF4500" }}
            />
            <Bar dataKey="total" fill="#FF4500" radius={[4, 4, 0, 0]} name="Candidaturas" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Funil de etapas */}
      <ChartCard title="Funil de etapas — onde as pessoas param">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={funnelData} layout="vertical">
            <XAxis type="number" tick={{ fill: "#ffffff60", fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#ffffff80", fontSize: 12 }} width={90} />
            <Tooltip
              contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#6B1BFF" }}
            />
            <Bar dataKey="total" fill="#6B1BFF" radius={[0, 4, 4, 0]} name="Pessoas" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Faturamento */}
        <ChartCard title="Faturamento mensal">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={faturamento}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff60", fontSize: 10 }} />
              <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#FF4500" }}
              />
              <Bar dataKey="total" fill="#FF4500" radius={[4, 4, 0, 0]} name="Empresas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Qtd vendedores */}
        <ChartCard title="Tamanho do time de vendas">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vendedores}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff60", fontSize: 12 }} />
              <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#CC0080" }}
              />
              <Bar dataKey="total" fill="#CC0080" radius={[4, 4, 0, 0]} name="Empresas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Usa CRM */}
        <ChartCard title="Usa CRM?">
          {crm.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={crm} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                  {crm.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Como gera clientes */}
        <ChartCard title="Como gera clientes hoje?">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={geracaoClientes}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff60", fontSize: 10 }} />
              <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid #ffffff20", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#00C49F" }}
              />
              <Bar dataKey="total" fill="#00C49F" radius={[4, 4, 0, 0]} name="Empresas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function AdminLeadsPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [detail, setDetail] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      setAuthChecked(true);
      const { data: rows, error } = await supabase
        .from("form_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setLeads((rows ?? []) as Lead[]);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    let rows = leads;
    if (filter === "completed") rows = rows.filter((l) => l.is_completed);
    else if (filter === "incomplete") rows = rows.filter((l) => !l.is_completed);
    if (originFilter !== "all") rows = rows.filter((l) => getOrigin(l).variant === originFilter);
    return rows;
  }, [leads, filter, originFilter]);

  const counts = useMemo(() => {
    const total = leads?.length ?? 0;
    const completed = leads?.filter((l) => l.is_completed).length ?? 0;
    return { total, completed, incomplete: total - completed };
  }, [leads]);

  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D] text-white/60">
        Verificando acesso...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pump Up — Painel de Candidaturas</h1>
            <p className="mt-1 text-sm text-white/60">
              {counts.total} totais — {counts.completed} completos — {counts.incomplete} incompletos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tab === "leads" && (
              <button
                onClick={exportCsv}
                className="rounded-lg border border-white/15 bg-[#1A1A1A] px-4 py-2 text-sm font-semibold hover:border-white/40"
              >
                Exportar CSV
              </button>
            )}
            <button
              onClick={logout}
              className="rounded-lg border border-white/15 bg-[#1A1A1A] px-4 py-2 text-sm font-semibold hover:border-white/40"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="mt-6 inline-flex rounded-lg border border-white/10 bg-[#141414] p-1 text-sm">
          {(["dashboard", "leads"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                tab === t ? "bg-[#FF4500] text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {t === "dashboard" ? "Dashboard" : "Leads"}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {leads === null ? (
          <div className="mt-10 text-center text-white/60">Carregando...</div>
        ) : tab === "dashboard" ? (
          <div className="mt-6">
            <Dashboard leads={leads} />
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex rounded-lg border border-white/10 bg-[#141414] p-1 text-sm">
                {(["all", "completed", "incomplete"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-3 py-1.5 font-medium transition ${
                      filter === f ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {f === "all" ? "Todos" : f === "completed" ? "Completos" : "Incompletos"}
                  </button>
                ))}
              </div>
              <div className="inline-flex rounded-lg border border-white/10 bg-[#141414] p-1 text-sm">
                {([
                  { v: "all" as OriginFilter, label: "Todas as origens" },
                  { v: "padrao" as OriginFilter, label: "🎯 Seletivo" },
                  { v: "diagnostico" as OriginFilter, label: "📅 Auto agendamento" },
                ]).map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setOriginFilter(v)}
                    className={`rounded-md px-3 py-1.5 font-medium transition ${
                      originFilter === v ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-white/60">Nenhum lead encontrado.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white/70">Início</TableHead>
                      <TableHead className="text-white/70">Atualizado</TableHead>
                      <TableHead className="text-white/70">Origem</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Nome</TableHead>
                      <TableHead className="text-white/70">Empresa</TableHead>
                      <TableHead className="text-white/70">WhatsApp</TableHead>
                      <TableHead className="text-white/70">E-mail</TableHead>
                      <TableHead className="text-white/70 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow key={l.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="text-xs">{formatDate(l.created_at)}</TableCell>
                        <TableCell className="text-xs">{formatDate(l.updated_at)}</TableCell>
                        <TableCell><OriginBadge lead={l} /></TableCell>
                        <TableCell>
                          {l.is_completed ? (
                            <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                              Completo
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                              Etapa {l.last_step_completed}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{l.form_data?.nome ?? "—"}</TableCell>
                        <TableCell className="text-sm">{l.form_data?.empresa ?? "—"}</TableCell>
                        <TableCell className="text-sm">{l.form_data?.whatsapp ?? "—"}</TableCell>
                        <TableCell className="text-sm">{l.form_data?.email ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => setDetail(l)}
                            className="rounded-md border border-white/15 bg-[#1A1A1A] px-3 py-1 text-xs font-semibold hover:border-[#FF4500]"
                          >
                            Ver detalhes
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto bg-[#141414] text-white">
          <DialogHeader>
            <DialogTitle>Detalhes do lead</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <OriginBadge lead={detail} />
                {detail.is_completed ? (
                  <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">Completo</span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">Parou na etapa {detail.last_step_completed}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                <div>Início: {formatDate(detail.created_at)}</div>
                <div>Atualizado: {formatDate(detail.updated_at)}</div>
                <div>Session: {detail.session_id}</div>
              </div>
              <pre className="overflow-auto rounded-lg bg-[#0D0D0D] p-4 text-xs">
                {JSON.stringify(detail.form_data, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
