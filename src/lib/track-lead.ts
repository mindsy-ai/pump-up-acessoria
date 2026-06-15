import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type TrackPayload = {
  sessionId: string;
  formData: Record<string, any>;
  lastStep: number;
  isCompleted: boolean;
};

export const trackLeadFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): TrackPayload => raw as TrackPayload)
  .handler(async ({ data }: { data: TrackPayload }) => {
    const { error } = await supabaseAdmin.from("form_leads").upsert(
      {
        session_id: data.sessionId,
        form_data: data.formData,
        last_step_completed: data.lastStep,
        is_completed: data.isCompleted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );
    if (error) {
      console.error("[trackLead server] supabase error", error);
      throw new Error(error.message);
    }
    return { ok: true };
  });
