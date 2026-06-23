import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hashString(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { article_id } = await req.json();
    if (!article_id) return new Response(JSON.stringify({ error: "article_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "0.0.0.0";
    const ua = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const ipHash = await hashString(`${ip}|${ua}|${article_id}|${new Date().toISOString().slice(0, 10)}`);

    // De-dupe: only count once per ip/day/article
    const { data: existing } = await admin
      .from("blog_article_views")
      .select("id")
      .eq("article_id", article_id)
      .eq("ip_hash", ipHash)
      .limit(1)
      .maybeSingle();

    if (!existing) {
      await admin.from("blog_article_views").insert({
        article_id,
        ip_hash: ipHash,
        user_agent: ua.slice(0, 500),
        referrer: referer.slice(0, 500),
      });

      // Increment counter
      const { data: art } = await admin.from("blog_articles").select("views_count").eq("id", article_id).single();
      if (art) {
        await admin.from("blog_articles").update({ views_count: (art.views_count || 0) + 1 }).eq("id", article_id);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
