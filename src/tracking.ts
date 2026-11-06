/**
 * Conversion Tracking Kit — browser helper
 *
 * Pushes a small, consistent set of events into the GTM dataLayer. Every event
 * carries an `event_id`, which the GTM container passes to the Meta Pixel as
 * `eventID` and which you send to the Conversions API from the server, so Meta
 * can deduplicate browser and server copies of the same conversion.
 *
 * Framework-agnostic: works in Next.js, React, Vue, plain HTML or WordPress.
 */

export type TrackingEventName =
  | "generate_lead"
  | "phone_click"
  | "whatsapp_click"
  | "purchase";

type DataLayerEntry = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer: DataLayerEntry[];
  }
}

const DEFAULT_CURRENCY = "USD";

/** Unique id shared by the browser event and its server-side (CAPI) twin. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Push one event. Every parameter the container reads is written explicitly on
 * every push, because the dataLayer merges state: a `value` left over from an
 * earlier event would otherwise leak into the next one.
 */
export function track(
  event: TrackingEventName,
  params: DataLayerEntry & { event_id?: string } = {},
): string {
  if (typeof window === "undefined") return params.event_id ?? "";
  window.dataLayer = window.dataLayer || [];

  const event_id = params.event_id ?? newEventId();
  window.dataLayer.push({
    value: undefined,
    currency: undefined,
    transaction_id: undefined,
    form_name: undefined,
    lead_type: undefined,
    link_url: undefined,
    ...params,
    event,
    event_id,
  });
  return event_id;
}

export interface LeadParams {
  form_name: string;
  lead_type?: string;
  value?: number;
  currency?: string;
  event_id?: string;
}

/** Call after a form submits successfully (not on button click). */
export function trackLead(params: LeadParams): string {
  return track("generate_lead", {
    value: 0,
    currency: DEFAULT_CURRENCY,
    ...params,
  });
}

export interface PurchaseParams {
  transaction_id: string;
  value: number;
  currency?: string;
  event_id?: string;
}

/** Call on the confirmation page or after the booking/payment succeeds. */
export function trackPurchase(params: PurchaseParams): string {
  return track("purchase", { currency: DEFAULT_CURRENCY, ...params });
}

/**
 * Track clicks on tel: and WhatsApp links anywhere on the page with one
 * listener. Returns a function that removes the listener.
 */
export function autoTrackContactLinks(root: Document | HTMLElement = document): () => void {
  const handler = (e: Event) => {
    const target = e.target as Element | null;
    const link = target?.closest?.("a");
    if (!link) return;
    const href = link.getAttribute("href") ?? "";

    if (href.startsWith("tel:")) {
      track("phone_click", { link_url: href });
    } else if (/(^https?:\/\/)?(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(href)) {
      track("whatsapp_click", { link_url: href });
    }
  };

  root.addEventListener("click", handler, { capture: true });
  return () => root.removeEventListener("click", handler, { capture: true });
}
