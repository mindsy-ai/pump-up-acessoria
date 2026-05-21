import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/leads" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/admin/leads" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold">Admin · Login</h1>
        <p className="mt-1 text-sm text-white/60">Acesso restrito à equipe Pump.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/70">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none focus:border-[#FF4500]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/70">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2.5 text-sm outline-none focus:border-[#FF4500]"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#FF4500] py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF4500]/90 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </main>
  );
}
