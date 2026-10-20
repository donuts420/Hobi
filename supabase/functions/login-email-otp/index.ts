import { withSupabase } from "npm:@supabase/server@1";

const encoder = new TextEncoder();

function randomCode() {
  const range = 0x100000000;
  const limit = Math.floor(range / 1_000_000) * 1_000_000;
  let value;
  do {
    value = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (value >= limit);
  return String(value % 1_000_000).padStart(6, "0");
}

async function digestCode(code: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(code)),
  );
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    },
  });
}

Deno.serve(
  withSupabase({ auth: "none" }, async (request: Request, context) => {
    const origin = request.headers.get("Origin") || "";
    const configuredOrigin = Deno.env.get("APP_ORIGIN")?.replace(/\/$/, "");
    const allowedOrigins = new Set(
      [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        configuredOrigin,
      ].filter(Boolean),
    );

    if (!allowedOrigins.has(origin))
      return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") return json({}, 200, origin);
    if (request.method !== "POST")
      return json({ error: "Method not allowed" }, 405, origin);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM_EMAIL");
    const otpSecret = Deno.env.get("OTP_HMAC_SECRET");
    if (!resendApiKey || !resendFrom || !otpSecret) {
      return json({ error: "Login service is not configured." }, 503, origin);
    }

    let body: Record<string, unknown>;
    try {
      const raw = await request.text();
      if (raw.length > 8_192)
        return json({ error: "Invalid request." }, 400, origin);
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return json({ error: "Invalid request." }, 400, origin);
      }
      body = parsed;
    } catch {
      return json({ error: "Invalid request." }, 400, origin);
    }

    const action = body.action;
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 6 ||
      password.length > 1024
    ) {
      return json({ error: "Invalid request." }, 400, origin);
    }

    const auth = context.supabase;
    const service = context.supabaseAdmin;

    if (action === "request") {
      const { data: authData, error: authError } =
        await auth.auth.signInWithPassword({ email, password });
      if (authError || !authData.session) {
        console.info("login-email-otp: password authentication rejected");
        return json({ challengeId: crypto.randomUUID() }, 200, origin);
      }

      const { data: recentChallenge } = await service
        .from("login_email_otp_challenges")
        .select("id")
        .eq("email", email)
        .gt("created_at", new Date(Date.now() - 60_000).toISOString())
        .maybeSingle();
      if (recentChallenge) {
        console.info("login-email-otp: resend cooldown active");
        return json({ challengeId: recentChallenge.id }, 200, origin);
      }

      const code = randomCode();
      const digest = await digestCode(code, otpSecret);
      const { data: challengeId, error: challengeError } = await service.rpc(
        "request_login_email_otp",
        {
          p_email: email,
          p_digest: digest,
          p_expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
        },
      );
      if (challengeError) {
        console.error(
          "login-email-otp: challenge RPC failed",
          challengeError.code,
        );
        return json(
          { error: "Unable to send a sign-in code right now." },
          503,
          origin,
        );
      }

      if (!challengeId) {
        const { data: currentChallenge } = await service
          .from("login_email_otp_challenges")
          .select("id")
          .eq("email", email)
          .gt("created_at", new Date(Date.now() - 60_000).toISOString())
          .maybeSingle();
        return json(
          { challengeId: currentChallenge?.id || crypto.randomUUID() },
          200,
          origin,
        );
      }

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: [email],
            subject: "Your Hopi sign-in code",
            text: `Your Hopi sign-in code is ${code}. It expires in five minutes. If you did not request this code, you can ignore this email.`,
            html: `<p>Your Hopi sign-in code is <strong>${code}</strong>.</p><p>It expires in five minutes. If you did not request this code, you can ignore this email.</p>`,
          }),
        });
        if (!emailResponse.ok) {
          console.error(
            "login-email-otp: Resend rejected email",
            emailResponse.status,
          );
          throw new Error("Email provider rejected the message.");
        }
        console.info(
          "login-email-otp: Resend accepted email",
          emailResponse.status,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message !== "Email provider rejected the message."
        ) {
          console.error("login-email-otp: Resend request failed", error.name);
        }
        await service
          .from("login_email_otp_challenges")
          .delete()
          .eq("id", challengeId);
        return json(
          { error: "Unable to send a sign-in code right now." },
          503,
          origin,
        );
      }

      return json({ challengeId }, 200, origin);
    }

    if (action === "verify") {
      const challengeId =
        typeof body.challengeId === "string" ? body.challengeId : "";
      const code = typeof body.code === "string" ? body.code : "";
      if (!/^[0-9a-f-]{36}$/i.test(challengeId) || !/^\d{6}$/.test(code)) {
        return json({ error: "The code is invalid or expired." }, 401, origin);
      }

      const { data: authData, error: authError } =
        await auth.auth.signInWithPassword({ email, password });
      if (authError || !authData.session) {
        return json({ error: "The code is invalid or expired." }, 401, origin);
      }

      const digest = await digestCode(code, otpSecret);
      const { data: valid, error: verifyError } = await service.rpc(
        "consume_login_email_otp",
        {
          p_challenge_id: challengeId,
          p_email: email,
          p_digest: digest,
        },
      );
      if (verifyError || valid !== true) {
        return json({ error: "The code is invalid or expired." }, 401, origin);
      }

      return json(
        {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        },
        200,
        origin,
      );
    }

    return json({ error: "Invalid request." }, 400, origin);
  }),
);
