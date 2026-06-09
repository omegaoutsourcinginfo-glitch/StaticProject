/**
 * Modern email templates for devis form submissions.
 */
(function (global) {
  const BRAND = {
    wine: "#7a2035",
    wineDark: "#5a1828",
    wineSoft: "#f9f0f2",
    green: "#8fb01f",
    greenDark: "#6d8c18",
    greenLight: "#eef4d9",
    slate: "#1e293b",
    muted: "#64748b",
    border: "#e2e8f0",
    bg: "#f8fafc",
    white: "#ffffff",
  };

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatBienPlain(bien) {
    const lines = [`Type : ${bien.type}`, `Nombre d'unités : ${bien.nombreUnites}`];
    if (bien.surfaceMoyenneM2) lines.push(`Surface moyenne : ${bien.surfaceMoyenneM2} m²`);
    if (bien.surfaceGlobaleTotaleM2) lines.push(`Surface : ${bien.surfaceGlobaleTotaleM2} m²`);
    return lines.join("\n");
  }

  function appendBiensDetails(lines, items, heading) {
    if (!items?.length) return;
    lines.push("", heading);
    items.forEach((b, i) => {
      if (i > 0) lines.push("", "—", "");
      lines.push(formatBienPlain(b));
    });
  }

  function formatBienHtml(bien) {
    const chips = [
      `<span style="display:inline-block;background:${BRAND.greenLight};color:${BRAND.greenDark};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin:0 6px 6px 0;">${esc(bien.nombreUnites)} unité(s)</span>`,
      bien.surfaceMoyenneM2
        ? `<span style="display:inline-block;background:${BRAND.wineSoft};color:${BRAND.wine};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin:0 6px 6px 0;">${esc(bien.surfaceMoyenneM2)} m² moy.</span>`
        : "",
      bien.surfaceGlobaleTotaleM2
        ? `<span style="display:inline-block;background:${BRAND.wineSoft};color:${BRAND.wine};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin:0 6px 6px 0;">${esc(bien.surfaceGlobaleTotaleM2)} m²</span>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    return `<div style="margin-bottom:14px;padding:16px 18px;background:linear-gradient(135deg,${BRAND.white} 0%,${BRAND.bg} 100%);border-radius:12px;border:1px solid ${BRAND.border};border-left:5px solid ${BRAND.green};box-shadow:0 2px 8px rgba(122,32,53,0.06);">
      <div style="font-weight:700;color:${BRAND.wine};font-size:15px;margin-bottom:10px;">${esc(bien.type)}</div>
      <div>${chips}</div>
    </div>`;
  }

  function rowHtml(label, value, alt) {
    if (value === undefined || value === null || String(value).trim() === "") return "";
    const bg = alt ? BRAND.bg : BRAND.white;
    return `<tr style="background:${bg};">
      <td style="padding:11px 14px;border-bottom:1px solid ${BRAND.border};color:${BRAND.muted};font-size:13px;width:40%;vertical-align:top;">${esc(label)}</td>
      <td style="padding:11px 14px;border-bottom:1px solid ${BRAND.border};color:${BRAND.slate};font-size:14px;font-weight:600;">${esc(String(value))}</td>
    </tr>`;
  }

  function sectionHtml(title, icon, rowsHtml, extraHtml = "") {
    if (!rowsHtml && !extraHtml) return "";
    return `<div style="margin-bottom:26px;">
      <div style="display:inline-block;background:linear-gradient(135deg,${BRAND.wine} 0%,${BRAND.wineDark} 100%);color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;padding:8px 16px;border-radius:8px 8px 0 0;margin-bottom:0;">
        ${icon} ${esc(title)}
      </div>
      <div style="background:${BRAND.white};border:1px solid ${BRAND.border};border-top:none;border-radius:0 12px 12px 12px;padding:16px 18px;box-shadow:0 4px 14px rgba(122,32,53,0.05);">
        ${rowsHtml ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:8px;overflow:hidden;">${rowsHtml}</table>` : ""}
        ${extraHtml}
      </div>
    </div>`;
  }

  function badgeHtml(text) {
    if (!text) return "";
    return `<span style="display:inline-block;background:${BRAND.green};color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;margin-top:10px;">${esc(text)}</span>`;
  }

  function collectProjectPlain(payload) {
    const lines = [];

    function add(label, value) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        lines.push(`${label} : ${value}`);
      }
    }

    add("Domaine d'étude", payload.domaineEtudeLabel);

    if (payload.vrd) {
      add("Types de bien", (payload.vrd.typesBien || []).join(", "));
      add("Surface globale du sol", `${payload.vrd.surfaceGlobaleDuSolM2} m²`);
      appendBiensDetails(lines, payload.vrd.biens, "Détails par type de bien :");
    }

    if (payload.construction) {
      add("Type de structure", payload.construction.typeStructureLabel);
      const ba = payload.construction.betonArme;
      const cm = payload.construction.charpenteMetallique;
      const block = ba || cm;
      if (block) {
        add("Types de projet", (block.typesProjet || []).join(", "));
        add("Surface globale du sol", `${block.surfaceGlobaleDuSolM2} m²`);
        if (ba?.nombreEtages) add("Nombre d'étages", ba.nombreEtages);
        if (cm?.hauteurM) add("Hauteur", `${cm.hauteurM} m`);
        appendBiensDetails(lines, block.projets, "Détails par type de projet :");
      }
    }

    if (payload.structure) {
      add("Type (Structure)", payload.structure.typeLabel);
      if (payload.structure.construction) {
        const c = payload.structure.construction;
        add("Types de bâtiment", (c.typesBatiment || []).join(", "));
        add("Surface globale du sol", `${c.surfaceGlobaleDuSolM2} m²`);
        appendBiensDetails(lines, c.batiments, "Détails par type de bâtiment :");
      }
      if (payload.structure.lotissement) {
        const l = payload.structure.lotissement;
        add("Types de lotissement", (l.typesLotissement || []).join(", "));
        add("Surface globale du sol", `${l.surfaceGlobaleDuSolM2} m²`);
        appendBiensDetails(lines, l.lots, "Détails par type de lotissement :");
      }
    }

    if (payload.projet) {
      add("Types de projet", (payload.projet.typesProjet || []).join(", "));
      add("Surface globale du sol", `${payload.projet.surfaceGlobaleDuSolM2} m²`);
      appendBiensDetails(lines, payload.projet.projets, "Détails par type de projet :");
    }

    return lines;
  }

  function collectProjectHtml(payload) {
    const rows = [];
    const extras = [];
    let rowAlt = false;

    function add(label, value) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        rows.push(rowHtml(label, value, rowAlt));
        rowAlt = !rowAlt;
      }
    }

    add("Nature de la demande", payload.natureDemandeLabel);
    add("Domaine d'étude", payload.domaineEtudeLabel);

    if (payload.vrd) {
      add("Types de bien", (payload.vrd.typesBien || []).join(", "));
      add("Surface globale du sol", `${payload.vrd.surfaceGlobaleDuSolM2} m²`);
      if (payload.vrd.biens?.length) extras.push(payload.vrd.biens.map(formatBienHtml).join(""));
    }

    if (payload.construction) {
      add("Type de structure", payload.construction.typeStructureLabel);
      const ba = payload.construction.betonArme;
      const cm = payload.construction.charpenteMetallique;
      const block = ba || cm;
      if (block) {
        add("Types de projet", (block.typesProjet || []).join(", "));
        add("Surface globale du sol", `${block.surfaceGlobaleDuSolM2} m²`);
        if (ba?.nombreEtages) add("Nombre d'étages", ba.nombreEtages);
        if (cm?.hauteurM) add("Hauteur", `${cm.hauteurM} m`);
        if (block.projets?.length) extras.push(block.projets.map(formatBienHtml).join(""));
      }
    }

    if (payload.structure) {
      add("Type (Structure)", payload.structure.typeLabel);
      if (payload.structure.construction) {
        const c = payload.structure.construction;
        add("Types de bâtiment", (c.typesBatiment || []).join(", "));
        add("Surface globale du sol", `${c.surfaceGlobaleDuSolM2} m²`);
        if (c.batiments?.length) extras.push(c.batiments.map(formatBienHtml).join(""));
      }
      if (payload.structure.lotissement) {
        const l = payload.structure.lotissement;
        add("Types de lotissement", (l.typesLotissement || []).join(", "));
        add("Surface globale du sol", `${l.surfaceGlobaleDuSolM2} m²`);
        if (l.lots?.length) extras.push(l.lots.map(formatBienHtml).join(""));
      }
    }

    if (payload.projet) {
      add("Types de projet", (payload.projet.typesProjet || []).join(", "));
      add("Surface globale du sol", `${payload.projet.surfaceGlobaleDuSolM2} m²`);
      if (payload.projet.projets?.length) extras.push(payload.projet.projets.map(formatBienHtml).join(""));
    }

    return { rows: rows.join(""), extras: extras.join("") };
  }

  function buildPlain(payload) {
    const client = payload.client || {};
    const lines = [
      "DEMANDE DE DEVIS",
      "",
      "",
      "Coordonnées client",
      "──────────────────",
      `Prénom : ${client.prenom || ""}`,
      `Nom : ${client.nom || ""}`,
      `E-mail : ${client.email || ""}`,
      `Téléphone : ${client.telephone || ""}`,
      "",
      "Projet",
      "──────",
    ];

    if (payload.natureDemandeLabel) {
      lines.push(`Nature de la demande : ${payload.natureDemandeLabel}`);
    }

    collectProjectPlain(payload).forEach((l) => lines.push(l));

    lines.push("", "Message du client", "─────────────────");
    if (payload.message) lines.push(payload.message);

    return lines.join("\n");
  }

  function buildHtml(payload) {
    const client = payload.client || {};
    const clientRows = [
      rowHtml("Prénom", client.prenom, false),
      rowHtml("Nom", client.nom, true),
      rowHtml("E-mail", client.email, false),
      rowHtml("Téléphone", client.telephone, true),
    ].join("");

    const project = collectProjectHtml(payload);
    const natureBadge = badgeHtml(payload.natureDemandeLabel);
    const messageBlock = payload.message
      ? sectionHtml(
          "Message du client",
          "💬",
          "",
          `<div style="padding:16px 18px;background:linear-gradient(135deg,${BRAND.greenLight} 0%,${BRAND.white} 100%);border-radius:10px;border-left:4px solid ${BRAND.green};font-size:14px;color:${BRAND.slate};line-height:1.75;white-space:pre-wrap;">${esc(payload.message)}</div>`
        )
      : "";

    const contactQuick = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
      <tr>
        <td width="50%" style="padding:6px;">
          <div style="background:${BRAND.wineSoft};border-radius:10px;padding:12px 14px;text-align:center;">
            <div style="font-size:11px;color:${BRAND.muted};margin-bottom:4px;">E-mail</div>
            <div style="font-size:13px;font-weight:700;color:${BRAND.wine};word-break:break-all;">${esc(client.email || "—")}</div>
          </div>
        </td>
        <td width="50%" style="padding:6px;">
          <div style="background:${BRAND.greenLight};border-radius:10px;padding:12px 14px;text-align:center;">
            <div style="font-size:11px;color:${BRAND.muted};margin-bottom:4px;">Téléphone</div>
            <div style="font-size:13px;font-weight:700;color:${BRAND.greenDark};">${esc(client.telephone || "—")}</div>
          </div>
        </td>
      </tr>
    </table>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:linear-gradient(180deg,#eef4d9 0%,#f1f5f9 40%,#f1f5f9 100%);font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:transparent;padding:36px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${BRAND.white};border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(122,32,53,0.15);">
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND.wine} 0%,${BRAND.wineDark} 55%,#3d1019 100%);padding:36px 32px 28px;position:relative;">
      <div style="color:${BRAND.greenLight};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;font-weight:600;">Omega Outsourcing Service</div>
      <div style="color:#ffffff;font-size:26px;font-weight:800;line-height:1.25;letter-spacing:-0.5px;">Nouvelle demande de devis</div>
      <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-top:10px;">${esc(client.prenom || "")} ${esc(client.nom || "")}</div>
      ${natureBadge}
    </td>
  </tr>
  <tr><td style="height:6px;background:linear-gradient(90deg,${BRAND.green} 0%,#a1bf17 50%,${BRAND.green} 100%);"></td></tr>
  <tr>
    <td style="padding:28px 24px 32px;background:${BRAND.white};">
      ${sectionHtml("Coordonnées client", "👤", clientRows, contactQuick)}
      ${sectionHtml("Détails du projet", "🏗️", project.rows, project.extras)}
      ${messageBlock}
    </td>
  </tr>
  <tr>
    <td style="padding:22px 32px;background:linear-gradient(135deg,${BRAND.wineDark} 0%,${BRAND.wine} 100%);text-align:center;">
      <div style="font-size:13px;color:${BRAND.greenLight};font-weight:600;margin-bottom:4px;">Omega Outsourcing Service</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.65);">Bureau d'étude technique · Casablanca</div>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  }

  /** FormSubmit — texte structuré lisible dans Gmail. */
  function build(payload) {
    return buildPlain(payload);
  }

  global.DevisEmailTemplate = { build, buildPlain, buildHtml };
})(window);

function getContactConfig() {
  const el = document.getElementById("contact-config");
  if (!el) return {};
  try {
    return JSON.parse(el.textContent);
  } catch {
    return {};
  }
}

function getFormSubmitEmail() {
  const c = getContactConfig();
  return c.formEmail || c.email || "omegaoutsourcing.info@gmail.com";
}

function getWeb3FormsAccessKey() {
  const key = getContactConfig().web3formsAccessKey;
  return typeof key === "string" ? key.trim() : "";
}

/** "auto" | "web3forms" | "formsubmit" — auto : Web3Forms puis FormSubmit en secours */
function getFormProvider() {
  const p = getContactConfig().formProvider;
  if (p === "formsubmit" || p === "web3forms" || p === "auto") return p;
  return "auto";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableResult(result) {
  if (result.ok) return false;
  const m = (result.message || "").toLowerCase();
  return (
    m.includes("délai") ||
    m.includes("timeout") ||
    m.includes("connexion") ||
    m.includes("inaccessible") ||
    m.includes("indisponible") ||
    m.includes("521") ||
    m.includes("réseau") ||
    m.includes("répond pas")
  );
}

async function tryWithRetry(fn, retries = 1) {
  let result = await fn();
  for (let i = 0; i < retries && !result.ok && isRetryableResult(result); i++) {
    await sleep(1000);
    result = await fn();
  }
  return result;
}

function buildPayloadFromFormData(formData) {
  const payload = {};
  formData.forEach((value, key) => {
    if (key === "_honey" && value) return;
    payload[key] = value;
  });
  return payload;
}

function buildWeb3FormsBody(payload) {
  const nom = payload.nom || "";
  const prenom = payload.prenom || "";
  const replyTo = payload.email || payload._replyto || "";
  const corps = payload.message || payload.description || "";

  const body = {
    access_key: getWeb3FormsAccessKey(),
    subject: payload._subject || "Message — Omega Outsourcing Service",
    from_name: "Omega Outsourcing Service",
    botcheck: false,
  };

  if (replyTo) body.replyto = replyTo;

  // Champs personnalisés en français — évite Name / Email / Phone en anglais + doublon.
  if (prenom) body["Prénom"] = prenom;
  if (nom) body["Nom"] = nom;
  if (replyTo) body["E-mail"] = replyTo;
  if (payload.telephone) body["Téléphone"] = payload.telephone;
  if (corps) body[corps.length > 120 ? "Demande" : "Message"] = corps;

  return body;
}

const FORM_FETCH_TIMEOUT_MS = 18000;

async function fetchFormService(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FORM_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("timeout");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function submitViaWeb3Forms(formData) {
  const accessKey = getWeb3FormsAccessKey();
  if (!accessKey) {
    return {
      ok: false,
      message:
        "Clé Web3Forms manquante. Ajoutez web3formsAccessKey dans contact-config (https://web3forms.com).",
    };
  }

  let res;
  try {
    res = await fetchFormService("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildWeb3FormsBody(buildPayloadFromFormData(formData))),
    });
  } catch (err) {
    if (err.message === "timeout") {
      return {
        ok: false,
        message:
          "Délai dépassé (18 s). Réessayez ou écrivez à " + getFormSubmitEmail() + ".",
      };
    }
    return {
      ok: false,
      message: "Connexion à Web3Forms impossible. Vérifiez votre réseau.",
    };
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: "Réponse invalide du service Web3Forms." };
  }

  if (data.success) return { ok: true, message: "" };
  return {
    ok: false,
    message: data.message || "Envoi impossible via Web3Forms. Vérifiez la clé d'accès.",
  };
}

function parseFormSubmitResponse(res, data) {
  const ok = res.ok && (data.success === true || data.success === "true");
  if (ok) return { ok: true, message: "" };
  const msg = data.message || "";
  if (/activat/i.test(msg)) {
    return {
      ok: false,
      message:
        "Activation requise : ouvrez la boîte Gmail " +
        getFormSubmitEmail() +
        " (dossier spam inclus), cliquez sur le lien « Activate Form » envoyé par FormSubmit, puis renvoyez le formulaire.",
    };
  }
  return {
    ok: false,
    message:
      msg || "Envoi impossible. Vérifiez votre connexion ou écrivez-nous à " + getFormSubmitEmail(),
  };
}

async function submitViaFormSubmit(formData) {
  const mail = getFormSubmitEmail();

  try {
    const res = await fetchFormService(
      "https://formsubmit.co/ajax/" + encodeURIComponent(mail),
      { method: "POST", body: formData, headers: { Accept: "application/json" } }
    );

    if (res.status === 521) {
      return {
        ok: false,
        message:
          "FormSubmit est indisponible (521). Le secours Web3Forms sera utilisé si configuré.",
      };
    }

    let data = {};
    try {
      data = await res.json();
    } catch {
      return { ok: false, message: "Réponse invalide du serveur FormSubmit." };
    }

    return parseFormSubmitResponse(res, data);
  } catch (err) {
    if (err.message === "timeout") {
      return {
        ok: false,
        message: "FormSubmit ne répond pas (délai 18 s).",
      };
    }
    return {
      ok: false,
      message: "FormSubmit est inaccessible.",
    };
  }
}

async function submitFormDataToEmail(formDataOrForm) {
  const formData =
    formDataOrForm instanceof HTMLFormElement
      ? new FormData(formDataOrForm)
      : formDataOrForm;

  if (location.protocol === "file:") {
    return {
      ok: false,
      message:
        "Ouvrez le site via http://localhost (Live Server), pas en double-cliquant le fichier HTML.",
    };
  }

  const provider = getFormProvider();
  const hasWeb3 = !!getWeb3FormsAccessKey();

  const tryWeb3 = () => tryWithRetry(() => submitViaWeb3Forms(formData));
  const tryFormSubmit = () => tryWithRetry(() => submitViaFormSubmit(formData));

  if (provider === "formsubmit") {
    const primary = await tryFormSubmit();
    if (primary.ok) return primary;
    if (hasWeb3) {
      const fallback = await tryWeb3();
      if (fallback.ok) return fallback;
    }
    return primary;
  }

  if (provider === "web3forms") {
    if (!hasWeb3) return tryFormSubmit();
    const primary = await tryWeb3();
    if (primary.ok) return primary;
    const fallback = await tryFormSubmit();
    if (fallback.ok) return fallback;
    return primary;
  }

  // auto : Web3Forms d'abord (plus fiable), FormSubmit en secours
  if (hasWeb3) {
    const primary = await tryWeb3();
    if (primary.ok) return primary;
    const fallback = await tryFormSubmit();
    if (fallback.ok) return fallback;
    return primary;
  }
  return tryFormSubmit();
}

window.FormMail = {
  getFormSubmitEmail,
  submitFormDataToEmail,
};

function clearInlineErrors(form) {
  form.querySelectorAll("[data-field]").forEach((wrap) => {
    const err = wrap.querySelector(".field-error");
    if (err) {
      err.textContent = "";
      err.classList.add("hidden");
    }
    wrap.querySelectorAll(".input-light").forEach((el) => el.classList.remove("is-invalid"));
  });
}

function setInlineError(form, fieldKey, message) {
  const wrap = form.querySelector(`[data-field="${fieldKey}"]`);
  if (!wrap) return;
  const err = wrap.querySelector(".field-error");
  const input = wrap.querySelector("input, textarea, select");
  if (err) {
    err.textContent = message;
    err.classList.remove("hidden");
  }
  input?.classList.add("is-invalid");
}

function phoneDigits(phone) {
  return String(phone).replace(/\D/g, "");
}

function isValidPhone(phone) {
  const digits = phoneDigits(phone);
  return digits.length >= 8 && digits.length <= 15;
}

function validateContactForm(form) {
  clearInlineErrors(form);
  const errors = {};
  if (!form.nom?.value.trim()) errors.nom = "Veuillez indiquer votre nom.";
  if (!form.prenom?.value.trim()) errors.prenom = "Veuillez indiquer votre prénom.";
  const email = form.email?.value.trim() ?? "";
  if (!email) errors.email = "Veuillez indiquer votre e-mail.";
  else if (!email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Adresse e-mail incorrecte.";
  }
  const tel = form.telephone?.value.trim() ?? "";
  if (tel && !isValidPhone(tel)) {
    errors.telephone = "Numéro de téléphone incorrect.";
  }
  if (!form.description?.value.trim()) {
    errors.description = "Veuillez saisir votre message.";
  }
  Object.entries(errors).forEach(([key, msg]) => setInlineError(form, key, msg));
  if (Object.keys(errors).length) {
    form
      .querySelector(`[data-field="${Object.keys(errors)[0]}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return false;
  }
  return true;
}

function createAjaxFormHandlers(opts = {}) {
  return {
    feedbackText: "",
    feedbackVisible: false,
    feedbackClass: "hidden rounded-lg px-3 py-2.5 text-center text-sm",
    submitting: false,
    successMessage:
      opts.successMessage ??
      "Merci ! Votre message a été envoyé.",
    invalidMessage: "Merci de compléter les champs obligatoires.",
    submitBusyLabel: opts.submitBusyLabel ?? "Envoi…",
    feedbackSuccess:
      "feedback-enter block rounded-lg border border-brand-green/40 bg-brand-green-light px-4 py-3.5 text-center text-sm font-semibold text-brand-green shadow-sm",
    feedbackError:
      "block rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-400",
    get contactEmail() {
      return getFormSubmitEmail();
    },
    showError(text) {
      this.feedbackText = text;
      this.feedbackClass = this.feedbackError;
      this.feedbackVisible = true;
    },
    showSuccess(text) {
      this.feedbackText = text;
      this.feedbackClass = this.feedbackSuccess;
      this.feedbackVisible = true;
    },
    async onSubmit(event) {
      event.preventDefault();
      const form = event.target;
      this.feedbackVisible = false;
      if (!validateContactForm(form)) return;
      const honey = form.querySelector('[name="_honey"]');
      if (honey?.value) return;
      const replyTo = form.email?.value.trim();
      const replyInput = form.querySelector('[name="_replyto"]');
      if (replyInput && replyTo) replyInput.value = replyTo;
      if (location.protocol === "file:") {
        this.showError(
          "Ouvrez le site avec Live Server (adresse http://), pas en double-cliquant le fichier HTML."
        );
        return;
      }
      this.submitting = true;
      try {
        const result = await submitFormDataToEmail(form);
        if (result.ok) {
          this.showSuccess(this.successMessage);
          form.reset();
          this.$nextTick(() => {
            form.querySelector('[role="alert"]')?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          });
        } else {
          this.showError(result.message);
        }
      } catch {
        this.showError(
          "Envoi impossible. Vérifiez votre connexion internet ou écrivez-nous à " +
            getFormSubmitEmail() +
            "."
        );
      } finally {
        this.submitting = false;
      }
    },
  };
}

document.addEventListener("alpine:init", () => {
  Alpine.data("contactInfo", () => {
    const contact = getContactConfig();
    const latitude = Number(contact.latitude);
    const longitude = Number(contact.longitude);
    return {
      adresse: contact.adresse ?? "",
      ville: contact.ville ?? "",
      email: contact.email ?? "",
      telephone: contact.telephone ?? "",
      telephone2: contact.telephone2 ?? "",
      latitude,
      longitude,
      mapZoom: 17,
      mapZoomMin: 14,
      mapZoomMax: 20,
      year: new Date().getFullYear(),
      phoneHref(phone) {
        return "tel:" + String(phone).replace(/\s/g, "");
      },
      get mailHref() {
        return "mailto:" + this.email;
      },
      get hasMap() {
        return Number.isFinite(this.latitude) && Number.isFinite(this.longitude);
      },
      get mapCoords() {
        return `${this.latitude},${this.longitude}`;
      },
      get mapEmbedUrl() {
        const marker = `color:green|label:2OS|${this.mapCoords}`;
        const params = new URLSearchParams({
          q: this.mapCoords,
          hl: "fr",
          z: String(this.mapZoom),
          t: "m",
          markers: marker,
          output: "embed",
        });
        return `https://maps.google.com/maps?${params.toString()}`;
      },
      zoomIn() {
        if (this.mapZoom < this.mapZoomMax) this.mapZoom += 1;
      },
      zoomOut() {
        if (this.mapZoom > this.mapZoomMin) this.mapZoom -= 1;
      },
      get googleMapsUrl() {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapCoords)}`;
      },
      get directionsUrl() {
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.mapCoords)}`;
      },
      get wazeUrl() {
        return `https://waze.com/ul?ll=${this.latitude},${this.longitude}&navigate=yes`;
      },
      get mapsAppUrl() {
        return `geo:${this.latitude},${this.longitude}?q=${this.latitude},${this.longitude}`;
      },
      openInMapsApp(event) {
        if (!this.hasMap) return;
        const lat = this.latitude;
        const lng = this.longitude;
        const ua = navigator.userAgent || "";
        let url = this.mapsAppUrl;
        if (/iPad|iPhone|iPod/i.test(ua)) {
          url = `maps://?ll=${lat},${lng}&q=${encodeURIComponent(this.adresse)}`;
        } else if (/Android/i.test(ua)) {
          url = `geo:${lat},${lng}?q=${lat},${lng}(2OS)`;
        } else {
          url = this.googleMapsUrl;
        }
        if (event) event.preventDefault();
        if (/iPad|iPhone|iPod|Android/i.test(ua)) {
          window.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      },
    };
  });
  Alpine.data("ajaxForm", (opts = {}) => createAjaxFormHandlers(opts));
});

document.addEventListener("DOMContentLoaded", () => {
  const tel = document.getElementById("tel");
  tel?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^\d\s+\-]/g, "");
  });
});
