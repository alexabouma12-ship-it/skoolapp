import { createClient } from "@supabase/supabase-js";

/**
 * Appelée chaque jour par la tâche planifiée Vercel (vercel.json) : une requête
 * régulière empêche le projet Supabase gratuit de se mettre en pause.
 */
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Non autorisé", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const { error } = await supabase.from("classes").select("id", { head: true, count: "exact" });

  return Response.json({ ok: !error, date: new Date().toISOString() }, { status: error ? 500 : 200 });
}
