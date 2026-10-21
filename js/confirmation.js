/**
 * Torra Lusa — confirmação de encomenda
 * -------------------------------------------------
 * Lê a encomenda simulada guardada pelo checkout em sessionStorage e
 * apresenta os detalhes, o percurso estimado e os próximos passos.
 * Não há pagamentos nem emails reais.
 */

import { SITE, formatPrice } from "./data.js";
import { icon, escapeHtml } from "./components.js";

const qs = (selector, root = document) => root.querySelector(selector);

const ORDER_KEY = "torraLusaOrder:v1";
const content = qs("[data-confirmation-content]");

const readOrder = () => {
  try {
    const raw = window.sessionStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw);
    if (!order || typeof order !== "object" || !Array.isArray(order.items)) return null;
    if (!order.number || !order.contact || !order.totals) return null;
    return order;
  } catch {
    return null;
  }
};

const formatTimestamp = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const summaryLine = (label, value, className = "") =>
  `<div class="summary-line ${className}"><span>${label}</span><strong>${value}</strong></div>`;

const paymentDescription = (order) => {
  if (order.payment?.id === "card" && order.payment.cardLast4) {
    return `Cartão terminado em ${escapeHtml(order.payment.cardLast4)}`;
  }
  if (order.payment?.id === "multibanco") {
    return "Referência Multibanco simulada — nenhuma referência real foi emitida.";
  }
  if (order.payment?.id === "mbway") {
    return "Pedido de pagamento MB WAY simulado — não foi enviado para o telemóvel.";
  }
  if (order.payment?.id === "paypal") {
    return "Pagamento PayPal simulado — não houve redirecionamento real.";
  }
  return escapeHtml(order.payment?.label || "Pagamento simulado");
};

const itemMarkup = (item) => {
  const variant = [item.format, item.grind, item.subscription ? "Subscrição mensal −10 %" : ""]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");
  return `<div class="order-item">
    <img src="${escapeHtml(item.image || "images/products/etiopia-guji.webp")}" alt="" width="44" height="55">
    <span class="order-item__copy">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${variant} · ${Number(item.quantity) || 1} ×</span>
    </span>
    <strong>${formatPrice(item.lineTotal)}</strong>
  </div>`;
};

const timelineMarkup = (order) => {
  const isPickup = order.shipping?.id === "pickup";
  return `
    <div class="confirmation-timeline">
      <div class="timeline-stop">
        <strong>Encomenda registada</strong>
        <span>${formatTimestamp(order.createdAt)} · ${order.isSimulation ? "demonstração" : "confirmada"}</span>
      </div>
      <div class="timeline-stop">
        <strong>${isPickup ? "Preparação no balcão" : "Torra e preparação"}</strong>
        <span>${
          isPickup
            ? `Preparamos o teu pedido em ${escapeHtml(SITE.address)}, ${escapeHtml(SITE.postalCode)} ${escapeHtml(SITE.city)}. Avisaríamos por email quando estivesse pronto.`
            : "O café segue na próxima torra da semana, em lotes pequenos. A data de torra é impressa na embalagem."
        }</span>
      </div>
      <div class="timeline-stop">
        <strong>${isPickup ? "Pronto para levantar" : "Entrega estimada"}</strong>
        <span>${escapeHtml(order.estimatedDelivery || "Data a confirmar")}${
          isPickup ? ` · ${escapeHtml(SITE.hours)}` : ""
        }</span>
      </div>
      <div class="timeline-stop">
        <strong>Na tua chávena</strong>
        <span>Deixa o café repousar alguns dias depois da torra. É aí que os aromas se abrem.</span>
      </div>
    </div>`;
};

const orderMarkup = (order) => {
  const contact = order.contact || {};
  const shipping = order.shipping || {};
  const isPickup = shipping.id === "pickup";
  const name = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  const fullAddress = [contact.address, `${contact.postalCode || ""} ${contact.city || ""}`.trim(), contact.country]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
  const shippingLabel =
    Number(order.totals.shipping) === 0 ? "Grátis" : formatPrice(order.totals.shipping);

  return `
    <div class="confirmation-hero">
      <div class="confirmation-mark">${icon("check", "", 37)}</div>
      <span class="eyebrow">${order.isSimulation ? "Encomenda simulada" : "Encomenda"} registada</span>
      <h1 id="confirmation-title">${isPickup ? "O café fica à tua espera no balcão." : "O café está a caminho da tua chávena."}</h1>
      <p>Obrigado${name ? `, ${escapeHtml(contact.firstName || name)}` : ""}. Recebemos a tua seleção e guardámos todos os detalhes desta demonstração. Não foi cobrado qualquer valor nem enviado nenhum email.</p>
      <div class="confirmation-number">
        <span>Número da encomenda</span>
        <strong data-order-number>${escapeHtml(order.number)}</strong>
        <button type="button" data-copy-order aria-label="Copiar número da encomenda">${icon("copy")}</button>
      </div>
      <p class="form-message form-message--success mt-2" data-copy-feedback role="status" aria-live="polite"></p>
    </div>

    <div class="confirmation-grid">
      <section class="confirmation-block" aria-labelledby="confirmation-order-title">
        <h2 id="confirmation-order-title">A tua encomenda</h2>
        <div class="order-items">
          ${order.items.map(itemMarkup).join("")}
        </div>
        <div class="confirmation-totals">
          ${summaryLine("Subtotal", formatPrice(order.totals.subtotal))}
          ${
            order.totals.discount > 0
              ? summaryLine(
                  `Desconto ${order.totals.promo?.code || ""}`,
                  `−${formatPrice(order.totals.discount)}`,
                  "summary-line--discount"
                )
              : ""
          }
          ${summaryLine("Portes", shippingLabel, order.totals.shipping === 0 ? "summary-line--free" : "")}
          <div class="summary-total"><span>Total</span><strong>${formatPrice(order.totals.total)}</strong></div>
        </div>
        <p class="confirmation-payment-note">
          <strong>Pagamento:</strong> ${escapeHtml(order.payment?.label || "Simulado")}<br>
          ${paymentDescription(order)}
        </p>
      </section>

      <section class="confirmation-block" aria-labelledby="confirmation-delivery-title">
        <h2 id="confirmation-delivery-title">${isPickup ? "Levantamento" : "Entrega"}</h2>
        <p><strong>${escapeHtml(shipping.name || "Envio Torra Lusa")}</strong><br>
          ${
            isPickup
              ? `${escapeHtml(SITE.address)}<br>${escapeHtml(SITE.postalCode)} ${escapeHtml(SITE.city)}<br>${escapeHtml(name)}`
              : `${escapeHtml(name)}<br>${fullAddress || "Morada fornecida no checkout."}`
          }<br>
          ${contact.email ? escapeHtml(contact.email) : ""}${contact.phone ? ` · ${escapeHtml(contact.phone)}` : ""}
        </p>
        ${
          contact.notes
            ? `<p class="confirmation-delivery-note"><strong>Nota de entrega:</strong> ${escapeHtml(contact.notes)}</p>`
            : ""
        }
        <h2 class="confirmation-timeline-title">O percurso</h2>
        ${timelineMarkup(order)}
      </section>
    </div>

    <div class="confirmation-cta">
      <a class="btn" href="loja.html">Continuar a explorar ${icon("arrowRight")}</a>
      <a class="btn btn--outline" href="contactos.html">Falar connosco</a>
      <button class="btn btn--text" type="button" data-print-order>${icon("copy")} Imprimir detalhes</button>
    </div>`;
};

const emptyMarkup = () => `
  <div class="confirmation-empty">
    <div class="confirmation-mark">${icon("bag", "", 34)}</div>
    <span class="eyebrow">Sem encomenda recente</span>
    <h1 id="confirmation-title">Ainda não há nada para confirmar.</h1>
    <p>Assim que concluíres uma compra simulada, os detalhes da encomenda aparecem aqui durante esta sessão do navegador.</p>
    <div class="confirmation-cta">
      <a class="btn" href="loja.html">Escolher café ${icon("arrowRight")}</a>
      <a class="btn btn--outline" href="carrinho.html">Ver carrinho</a>
    </div>
  </div>`;

const copyFeedback = (text, type = "success") => {
  const feedback = qs("[data-copy-feedback]");
  if (!feedback) return;
  feedback.textContent = text;
  feedback.className = `form-message form-message--${type} is-visible mt-2`;
};

const copyOrderNumber = async () => {
  const number = qs("[data-order-number]")?.textContent?.trim();
  if (!number) return;
  try {
    await navigator.clipboard.writeText(number);
    copyFeedback("Número copiado. Guarda-o nesta sessão.");
  } catch {
    const field = document.createElement("textarea");
    field.value = number;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    field.remove();
    copyFeedback(
      copied ? "Número copiado." : `Copia o número manualmente: ${number}`,
      copied ? "success" : "error"
    );
  }
};

const bindActions = () => {
  qs("[data-copy-order]")?.addEventListener("click", copyOrderNumber);
  qs("[data-print-order]")?.addEventListener("click", () => window.print());
};

export const init = () => {
  if (!content) return;
  const order = readOrder();

  if (!order) {
    content.innerHTML = emptyMarkup();
    document.title = "Confirmação — Torra Lusa";
    return;
  }

  content.innerHTML = orderMarkup(order);
  document.title = `Encomenda ${order.number} — Torra Lusa`;
  bindActions();
};
