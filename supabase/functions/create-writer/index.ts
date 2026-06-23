import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is superadmin
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Forbidden: superadmin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const full_name = String(body?.full_name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (!full_name || !email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Invalid input. Nama, email, dan password (min 6 char) wajib." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create user with email confirmed (no verification)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    let userId = created?.user?.id;
    let convertedFrom: string | null = null;

    if (createErr || !userId) {
      const msg = createErr?.message || "";
      const alreadyExists = /already|registered|exists/i.test(msg);
      if (!alreadyExists) {
        return new Response(JSON.stringify({ error: msg || "Gagal membuat user" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Find existing user by email
      const { data: existing } = await admin.from("profiles").select("id, role").eq("email", email).maybeSingle();
      if (!existing) {
        return new Response(JSON.stringify({ error: "Email sudah terdaftar di sistem auth tetapi profil tidak ditemukan. Hubungi admin." }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (existing.role === "superadmin") {
        return new Response(JSON.stringify({ error: "Email ini adalah akun superadmin dan tidak bisa dijadikan writer." }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      convertedFrom = existing.role ?? null;

      // Existing subscriber/writer accounts can be converted/updated as writer.
      const { error: updateAuthErr } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (updateAuthErr) {
        return new Response(JSON.stringify({ error: updateAuthErr.message || "Gagal memperbarui akun writer" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      userId = existing.id;
    }

    // Upsert profile with writer role
    const { error: profileErr } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name,
      role: "writer",
    }, { onConflict: "id" });
    if (profileErr) {
      return new Response(JSON.stringify({ error: profileErr.message || "Gagal menyimpan profil writer" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    return new Response(JSON.stringify({ success: true, user_id: userId, converted_from: convertedFrom }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
