/**
 * Conversion Tracking Kit — WordPress form + contact-link tracking
 *
 * Add with a code-snippets plugin (footer, all pages) or enqueue from your
 * theme. Requires the GTM container from gtm/container-template.json.
 *
 * Covers: Contact Form 7, Elementor Pro forms, WPForms, Gravity Forms,
 * plus tel: and WhatsApp link clicks. Leads fire only on a SUCCESSFUL submit.
 */
(function () {
  window.dataLayer = window.dataLayer || [];

  function eventId() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  }

  function push(event, params) {
    var entry = {
      value: undefined, currency: undefined, transaction_id: undefined,
      form_name: undefined, lead_type: undefined, link_url: undefined,
      event: event, event_id: eventId()
    };
    for (var k in params) entry[k] = params[k];
    window.dataLayer.push(entry);
  }

  function lead(formName) {
    push("generate_lead", { form_name: String(formName || "unknown"), value: 0, currency: "USD" });
  }

  // Contact Form 7
  document.addEventListener("wpcf7mailsent", function (e) {
    lead("cf7_" + (e.detail && e.detail.contactFormId));
  });

  // WPForms (AJAX submit)
  document.addEventListener("wpformsAjaxSubmitSuccess", function (e) {
    var form = e.target && e.target.closest ? e.target.closest("form") : null;
    lead("wpforms_" + (form ? form.getAttribute("data-formid") : ""));
  });

  if (window.jQuery) {
    // Elementor Pro forms
    jQuery(document).on("submit_success", function (e) {
      var name = e.target && e.target.getAttribute ? e.target.getAttribute("name") : "";
      lead("elementor_" + (name || "form"));
    });
    // Gravity Forms (AJAX confirmation)
    jQuery(document).on("gform_confirmation_loaded", function (e, formId) {
      lead("gravity_" + formId);
    });
  }

  // tel: and WhatsApp links
  document.addEventListener("click", function (e) {
    var link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      push("phone_click", { link_url: href });
    } else if (/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(href)) {
      push("whatsapp_click", { link_url: href });
    }
  }, true);
})();
