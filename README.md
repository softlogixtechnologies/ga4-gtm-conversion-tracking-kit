<h1 align="center">GA4 + GTM Conversion Tracking Kit</h1>

<p align="center">
  <b>One event spec, one GTM container, wired to GA4, Google Ads and Meta (Pixel + Conversions API).</b><br/>
  Drop-in for Next.js, React or WordPress lead-gen and booking sites.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"/>
  <img alt="Google Tag Manager" src="https://img.shields.io/badge/Tag_Manager-246FDB?logo=googletagmanager&logoColor=white"/>
  <img alt="GA4" src="https://img.shields.io/badge/GA4-E37400?logo=googleanalytics&logoColor=white"/>
  <img alt="Google Ads" src="https://img.shields.io/badge/Google_Ads-4285F4?logo=googleads&logoColor=white"/>
  <img alt="Meta" src="https://img.shields.io/badge/Meta_Pixel_%2B_CAPI-0866FF?logo=meta&logoColor=white"/>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white"/>
  <img alt="WordPress" src="https://img.shields.io/badge/WordPress-21759B?logo=wordpress&logoColor=white"/>
</p>

---

## Why this exists

Most service-business accounts we audit share the same tracking faults: leads counted on button click instead of on a successful submit, the same lead imported twice (Google Ads tag *and* GA4 key event), Meta browser and server events double counting because nobody set an event ID, and parameters leaking from one dataLayer push into the next. Smart Bidding then optimises toward bad data.

This kit fixes that with a small, opinionated setup we use on client sites (limousine and ground transportation, movers, home services, law firms):

- **4 events** that cover a lead-gen or booking site: `generate_lead`, `phone_click`, `whatsapp_click`, `purchase`.
- **An importable GTM container** with GA4, Google Ads conversion, Conversion Linker and Meta Pixel tags already mapped to those events.
- **Event IDs on every push**, shared by the Pixel and the Conversions API so Meta deduplicates.
- **Helpers** for Next.js / React and a **drop-in script** for WordPress form plugins.
- **A QA checklist** to verify everything end to end before it touches a bid strategy.

## What's inside

```
gtm/container-template.json   Importable GTM web container (14 tags, 4 triggers, 13 variables)
src/tracking.ts               Framework-agnostic dataLayer helpers (trackLead, trackPurchase, auto contact links)
nextjs/GoogleTagManager.tsx   App Router GTM loader + contact-link auto tracking
nextjs/meta-capi-route.ts     Meta Conversions API relay (route handler) with hashing + dedup
wordpress/form-tracking.js    Contact Form 7, Elementor Pro, WPForms, Gravity Forms + tel/WhatsApp
docs/event-spec.md            Event names, parameters and platform mapping
docs/qa-checklist.md          Step-by-step verification for GTM, GA4, Google Ads and Meta
```

## Quick start

### 1. Import the container

GTM → Admin → **Import Container** → choose `gtm/container-template.json` → import into a **new workspace** → **Merge** (rename conflicting items). Then replace the placeholder constants:

| Variable | Replace with |
|---|---|
| `CONST - GA4 Measurement ID` | `G-…` from GA4 → Admin → Data streams |
| `CONST - Google Ads Conversion ID` | The number after `AW-` in your conversion tag |
| `CONST - Ads Label - Lead` / `Phone Click` / `Purchase` | Labels from each Google Ads conversion action |
| `CONST - Meta Pixel ID` | Your Pixel / dataset ID from Events Manager |

Delete the tags you don't need (e.g. Purchase on a lead-only site). Test in Preview before publishing; template exports can need small adjustments across GTM versions.

### 2. Push events from the site

**Next.js / React**

```tsx
// src/app/layout.tsx
import GoogleTagManager from "@/components/GoogleTagManager";

<body>
  <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
  {children}
</body>
```

```ts
// after your server action reports success
import { trackLead } from "@/lib/tracking";

const eventId = trackLead({ form_name: "quote_request", lead_type: "airport_transfer" });
// send the same eventId to /api/meta-capi so Meta can deduplicate
```

**WordPress**

Add `wordpress/form-tracking.js` to the footer of every page (code-snippets plugin or theme enqueue). It listens for successful submissions from Contact Form 7, Elementor Pro, WPForms and Gravity Forms, plus clicks on `tel:` and WhatsApp links.

**Anything else**

```js
window.dataLayer.push({ event: "generate_lead", event_id: crypto.randomUUID(), form_name: "contact", value: 0, currency: "USD" });
```

### 3. (Optional) Meta Conversions API

Copy `nextjs/meta-capi-route.ts` to `src/app/api/meta-capi/route.ts`, set `META_PIXEL_ID`, `META_CAPI_TOKEN` and `META_GRAPH_VERSION`, and post the same `event_id` the browser used. Email and phone are SHA-256 hashed server-side before they leave your server.

### 4. Verify

Work through [`docs/qa-checklist.md`](docs/qa-checklist.md). Don't switch a campaign to conversion-based bidding until every box in sections 1 to 4 is ticked.

## Event map

| dataLayer | GA4 | Google Ads | Meta |
|---|---|---|---|
| `generate_lead` | `generate_lead` | Lead | `Lead` |
| `phone_click` | `phone_click` | Phone Click | `Contact` |
| `whatsapp_click` | `whatsapp_click` | — | `Contact` |
| `purchase` | `purchase` | Purchase | `Purchase` |

Full parameter rules in [`docs/event-spec.md`](docs/event-spec.md).

## Need it set up for you?

Built and maintained by **[SOFTLOGIX Technologies](https://softlogixtechnologies.com/)**, a software development and performance marketing company in Lahore, Pakistan, working with clients in the USA, UK, Canada, Australia, UAE and Pakistan. We set up tracking, run Google Ads and Meta Ads, and train in-house teams to do both.

📧 [info@softlogixtechnologies.com](mailto:info@softlogixtechnologies.com) · 🌐 [softlogixtechnologies.com](https://softlogixtechnologies.com/)

## License

MIT. Use it on client work, fork it, adapt it. A star helps other marketers find it.
