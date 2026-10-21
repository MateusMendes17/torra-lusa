/**
 * Torra Lusa — análise de utilização simulada
 * -------------------------------------------------
 * Não envia dados para nenhum servidor. Guarda um pequeno registo local
 * de eventos apenas quando o visitante aceita cookies de análise. Serve
 * para demonstrar o consentimento e os pontos de medição do percurso.
 */

const CONSENT_KEY = "torraLusaConsent:v1";
const EVENTS_KEY = "torraLusaAnalytics:v1";
const MAX_EVENTS = 80;

const canUseStorage = () => {
  try {
    const testKey = "__torra_lusa_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const getConsent = () => {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};

export const setConsent = (value) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // O site funciona sem preferência guardada.
  }
  if (value === "all") track("consent_analytics");
};

export const getEvents = () => {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EVENTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Registado apenas com consentimento "all"; nunca bloqueia a interface. */
export const track = (name, properties = {}) => {
  if (getConsent() !== "all" || !canUseStorage()) return;
  try {
    const events = getEvents();
    events.push({
      name,
      properties,
      page: document.body?.dataset.page || "site",
      path: window.location.pathname + window.location.search,
      at: new Date().toISOString(),
    });
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    document.dispatchEvent(new CustomEvent("analytics:event", { detail: { name, properties } }));
  } catch {
    // Medição é acessória; a compra nunca depende dela.
  }
};

export const clearEvents = () => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(EVENTS_KEY);
  } catch {
    // silencioso por design
  }
};
