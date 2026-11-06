# QA checklist

Run this before publishing the container and again after any site release that touches forms, checkout or contact links.

## 1. GTM Preview (Tag Assistant)

- [ ] Open GTM → Preview, enter the site URL, confirm Tag Assistant connects.
- [ ] On page load: **Google Tag - GA4**, **Conversion Linker** and **Meta Pixel - Base** fire once.
- [ ] Submit a real test lead. In the event list, `generate_lead` appears **after** the success message, never on a failed validation.
- [ ] On that event: **GA4 - Event - generate_lead**, **Google Ads - Conversion - Lead** and **Meta Pixel - Lead** fire.
- [ ] Variables tab on that event: `DLV - event_id` is a fresh UUID, `DLV - value` and `DLV - currency` are what the form pushed.
- [ ] Click a phone link and a WhatsApp link; the matching tags fire, and `value` is `undefined` (nothing leaked from the lead).

## 2. GA4 DebugView

- [ ] Admin → DebugView shows `generate_lead`, `phone_click`, `whatsapp_click` (and `purchase` if applicable) with their parameters.
- [ ] Custom dimensions `form_name`, `lead_type`, `link_url` are registered.
- [ ] `generate_lead` and `purchase` are marked as key events.

## 3. Google Ads

- [ ] Goals → Conversions: each conversion action's status moves from *Unverified* to *Recording conversions* within ~24h of the first test.
- [ ] Conversion settings: Lead counts **One**, Purchase counts **Every**.
- [ ] Only one conversion action per business action is set as **Primary** (no GA4-imported duplicate).
- [ ] Auto-tagging is on (Admin → Account settings).
- [ ] Test click: visit with `?gclid=test` and confirm the `_gcl_aw` cookie is set.

## 4. Meta Events Manager

- [ ] Test events tab: browser `Lead` arrives with an event ID.
- [ ] With CAPI enabled and `META_TEST_EVENT_CODE` set, the server `Lead` arrives with the **same** event ID and shows as *Deduplicated*.
- [ ] Event match quality for `Lead` is *Good* or better (send hashed email/phone through CAPI).
- [ ] Remove `META_TEST_EVENT_CODE` after testing.

## 5. Consent (EU / UK traffic)

- [ ] Consent Mode v2 defaults are set before GTM loads, and a CMP updates them.
- [ ] With consent denied, Google tags send cookieless pings and the Meta Pixel does not load.

## 6. Publish

- [ ] Version name and notes describe the change (e.g. "Add WhatsApp click tracking").
- [ ] Re-run sections 1 and 4 against the live site after publishing.
