/**
 * Meta Conversions API relay for Next.js (App Router).
 *
 * Place in: src/app/api/meta-capi/route.ts
 *
 * The browser fires the Pixel event through GTM with an eventID. Your form's
 * server action (or this route, called from the client) sends the same event
 * with the same event_id, so Meta keeps one copy and you keep conversions that
 * ad blockers and iOS restrictions would otherwise drop.
 *
 * Env (server-only, never NEXT_PUBLIC_):
 *   META_PIXEL_ID       your pixel / dataset id
 *   META_CAPI_TOKEN     system-user access token from Events Manager
 *   META_GRAPH_VERSION  current Graph API version, e.g. "v21.0"
 *   META_TEST_EVENT_CODE  optional, from Events Manager → Test events
 */

import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_EVENTS = new Set(["Lead", "Contact", "Purchase"]);

interface Payload {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
}

const sha256 = (input: string) =>
  createHash("sha256").update(input).digest("hex");

/** Meta expects lowercased, trimmed email and digits-only phone with country code. */
const normEmail = (email: string) => sha256(email.trim().toLowerCase());
const normPhone = (phone: string) => sha256(phone.replace(/\D/g, ""));

export async function POST(request: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  const version = process.env.META_GRAPH_VERSION;
  if (!pixelId || !token || !version) {
    console.error("[meta-capi] missing META_PIXEL_ID / META_CAPI_TOKEN / META_GRAPH_VERSION");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (!ALLOWED_EVENTS.has(body.event_name) || !body.event_id) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const user_data: Record<string, unknown> = {
    client_ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    client_user_agent: request.headers.get("user-agent") ?? undefined,
    fbp: request.cookies.get("_fbp")?.value,
    fbc: request.cookies.get("_fbc")?.value,
  };
  if (body.email) user_data.em = [normEmail(body.email)];
  if (body.phone) user_data.ph = [normPhone(body.phone)];

  const event = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    action_source: "website",
    event_source_url: body.event_source_url ?? request.headers.get("referer") ?? undefined,
    user_data,
    custom_data:
      body.value !== undefined
        ? { value: body.value, currency: body.currency ?? "USD" }
        : undefined,
  };

  const res = await fetch(
    `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        ...(process.env.META_TEST_EVENT_CODE
          ? { test_event_code: process.env.META_TEST_EVENT_CODE }
          : {}),
      }),
    },
  );

  if (!res.ok) {
    console.error("[meta-capi]", res.status, await res.text());
    return NextResponse.json({ success: false }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
