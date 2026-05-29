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

function AdminLeadsPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [detail, setDetail] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (filter === "completed") return leads.filter((l) => l.is_completed);
    if (filter === "incomplete") return leads.filter((l) => !l.is_completed);
    return leads;
  }, [leads, filter]);

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
            <h1 className="text-2xl font-bold">Leads do formulário</h1>
            <p className="mt-1 text-sm text-white/60">
              {counts.total} leads totais — {counts.completed} completos — {counts.incomplete} incompletos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="rounded-lg border border-white/15 bg-[#1A1A1A] px-4 py-2 text-sm font-semibold hover:border-white/40"
            >
              Exportar CSV
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-white/15 bg-[#1A1A1A] px-4 py-2 text-sm font-semibold hover:border-white/40"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="mt-6 inline-flex rounded-lg border border-white/10 bg-[#141414] p-1 text-sm">
          {(["all", "completed", "incomplete"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                filter === f ? "bg-[#FF4500] text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {f === "all" ? "Todos" : f === "completed" ? "Completos" : "Incompletos"}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
          {leads === null ? (
            <div className="p-8 text-center text-white/60">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-white/60">Nenhum lead encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white/70">Início</TableHead>
                  <TableHead className="text-white/70">Atualizado</TableHead>
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
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto bg-[#141414] text-white">
          <DialogHeader>
            <DialogTitle>Detalhes do lead</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                <div>Início: {formatDate(detail.created_at)}</div>
                <div>Atualizado: {formatDate(detail.updated_at)}</div>
                <div>Session: {detail.session_id}</div>
                <div>
                  Status:{" "}
                  {detail.is_completed ? "Completo" : `Parou na etapa ${detail.last_step_completed}`}
                </div>
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
