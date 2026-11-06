# Event specification

One event name per business action, the same name everywhere. GA4 uses the names as they are; Google Ads and Meta receive them mapped through the GTM container.

## Events

| dataLayer event | When it fires | Parameters | GA4 event | Google Ads conversion | Meta event |
|---|---|---|---|---|---|
| `generate_lead` | Form submitted **successfully** (server confirmed) | `form_name`, `lead_type`, `value`, `currency`, `event_id` | `generate_lead` (recommended event) | Lead | `Lead` |
| `phone_click` | Click on a `tel:` link | `link_url`, `event_id` | `phone_click` | Phone Click | `Contact` |
| `whatsapp_click` | Click on a WhatsApp link | `link_url`, `event_id` | `whatsapp_click` | (optional, add a label) | `Contact` |
| `purchase` | Booking or payment confirmed | `transaction_id`, `value`, `currency`, `event_id` | `purchase` (recommended event) | Purchase | `Purchase` |

## Rules

**Fire on success, not on click.** A lead is a form the server accepted. Button-click "leads" inflate conversions with validation failures and double clicks, and Smart Bidding then optimises toward noise.

**Every push sets every parameter.** The dataLayer merges state between pushes, so the helpers reset `value`, `currency`, `transaction_id` and the rest to `undefined` before applying the new ones.

**`event_id` is mandatory.** The same id goes to the Meta Pixel (`eventID`) and to the Conversions API (`event_id`). Meta deduplicates on that pair. It also doubles as the Google Ads order id for leads, which stops duplicate lead conversions on refresh.

**`transaction_id` is unique per purchase.** Google Ads and GA4 both deduplicate purchases on it.

**Currency is ISO 4217** (`USD`, `GBP`, `CAD`, `AUD`, `AED`, `PKR`), always sent alongside `value`.

## Naming custom parameters in GA4

Register `form_name`, `lead_type` and `link_url` as event-scoped custom dimensions in GA4 (Admin → Custom definitions), otherwise they are collected but not reportable.

## Marking key events

In GA4, mark `generate_lead` and `purchase` as key events. In Google Ads, prefer importing conversions from the GTM tags (this kit) over importing GA4 key events for the same action; using both double counts.
