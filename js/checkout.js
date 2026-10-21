/**
 * Torra Lusa — checkout simulado
 * -------------------------------------------------
 * Quatro passos: contacto, envio, pagamento e revisão. Não há chamadas
 * a servidores nem pagamentos reais. No fim, a encomenda é guardada
 * temporariamente em sessionStorage para a página de confirmação.
 */

import {
  PAYMENT_METHODS,
  SHIPPING_OPTIONS,
  SITE,
  formatPrice,
} from "./data.js";
import {
  applyPromo,
  clearCart,
  getAppliedPromo,
  getCart,
  getCartItemDetails,
  getTotals,
  removePromo,
  summaryLine,
} from "./cart.js";
import { icon, escapeHtml } from "./components.js";
import { track } from "./analytics.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const ORDER_KEY = "torraLusaOrder:v1";
const content = qs("[data-checkout-content]");
const summaryDesktop = qs("[data-checkout-summary]");
const mobileSummary = qs("[data-checkout-mobile-summary]");
const mobileSummaryContent = qs("[data-checkout-mobile-summary-content]");
const mobileSummaryMeta = qs("[data-checkout-mobile-summary-meta]");
const mobileSummaryTotal = qs("[data-checkout-mobile-summary-total]");
const checkoutSteps = qsa("[data-step-link]");

const state = {
  step: 1,
  shippingId: "ctt",
  paymentId: "card",
  contact: {},
  promoFeedback: null,
  isPlacingOrder: false,
};

const steps = [
  { id: 1, label: "Contacto" },
  { id: 2, label: "Envio" },
  { id: 3, label: "Pagamento" },
  { id: 4, label: "Revisão" },
];

const setCheckoutChrome = (hasItems) => {
  qs(".checkout-steps")?.toggleAttribute("hidden", !hasItems);
  qs("[data-checkout-simulation]")?.toggleAttribute("hidden", !hasItems);
  qs(".checkout-layout")?.classList.toggle("is-empty", !hasItems);
  if (summaryDesktop) summaryDesktop.hidden = !hasItems;
  if (!hasItems && mobileSummary) mobileSummary.hidden = true;
};

const field = (id, label, options = {}) => {
  const {
    type = "text",
    name = id,
    autocomplete = "",
    required = true,
    full = false,
    hint = "",
    placeholder = "",
    inputmode = "",
    maxlength = "",
  } = options;
  return `
    <div class="field ${full ? "field--full" : ""}" data-field="${name}">
      <label class="field__label" for="${id}">${label}${required ? "" : '<span class="field__optional">opcional</span>'}</label>
      <input class="input" id="${id}" name="${name}" type="${type}" ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${required ? "required" : ""} ${placeholder ? `placeholder="${placeholder}"` : ""} ${inputmode ? `inputmode="${inputmode}"` : ""} ${maxlength ? `maxlength="${maxlength}"` : ""}>
      ${hint ? `<span class="field__hint">${hint}</span>` : ""}
      <span class="field__error" role="alert"></span>
    </div>`;
};

const addBusinessDays = (date, amount) => {
  const result = new Date(date);
  let added = 0;
  while (added < amount) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return result;
};

const nextShippingDay = () => {
  const result = new Date();
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + 1);
  // Enviamos à segunda, terça e quinta-feira.
  while (![1, 2, 4].includes(result.getDay())) result.setDate(result.getDate() + 1);
  return result;
};

const deliveryWindow = (shippingId = state.shippingId) => {
  if (shippingId === "pickup") return "assim que estiver pronta, com aviso por email";
  const ship = nextShippingDay();
  const express = shippingId === "expresso";
  const min = addBusinessDays(ship, express ? 1 : 2);
  const max = addBusinessDays(ship, express ? 2 : 4);
  const formatter = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long" });
  return `${formatter.format(min)} a ${formatter.format(max)}`;
};

const shippingPrice = (option, subtotal) => {
  if (option.freeOverThreshold && subtotal >= SITE.freeShippingThreshold) return 0;
  return option.price;
};

const contactPanel = () => `
  <section class="checkout-panel checkout-step is-active" data-step-panel="1" aria-labelledby="checkout-step-1">
    <div class="checkout-panel__head">
      <h2 id="checkout-step-1" tabindex="-1">Contacto e entrega</h2>
      <p>Precisamos destes dados para preparar e enviar a encomenda. Nada é enviado para um servidor nesta demonstração.</p>
    </div>
    <div class="guest-note">
      ${icon("info")}
      <span><strong>Compra como convidado.</strong> Não é necessário criar conta. Podes guardar o número da encomenda no fim para acompanhar a preparação.</span>
    </div>
    <form data-checkout-form="contact" novalidate>
      <h3 class="checkout-section-title">Contacto</h3>
      <div class="form-grid form-grid--2">
        ${field("checkout-email", "Email", { type: "email", name: "email", autocomplete: "email", full: true, placeholder: "o.teu@email.pt" })}
        ${field("checkout-phone", "Telefone", { type: "tel", name: "phone", autocomplete: "tel", inputmode: "tel", placeholder: "912 345 678" })}
      </div>

      <h3 class="checkout-section-title">Morada de entrega</h3>
      <div class="form-grid form-grid--2">
        ${field("checkout-first-name", "Nome próprio", { name: "firstName", autocomplete: "given-name" })}
        ${field("checkout-last-name", "Apelido", { name: "lastName", autocomplete: "family-name" })}
        ${field("checkout-address", "Rua e número", { name: "address", autocomplete: "street-address", full: true, placeholder: "Rua, número, andar" })}
        ${field("checkout-postal", "Código postal", { name: "postalCode", autocomplete: "postal-code", inputmode: "numeric", maxlength: "8", placeholder: "0000-000" })}
        ${field("checkout-city", "Localidade", { name: "city", autocomplete: "address-level2" })}
        <div class="field field--full" data-field="country">
          <label class="field__label" for="checkout-country">País</label>
          <select class="select" id="checkout-country" name="country" autocomplete="country-name" required>
            <option value="Portugal">Portugal</option>
            <option value="Espanha">Espanha (envio peninsular)</option>
          </select>
          <span class="field__error" role="alert"></span>
        </div>
        ${field("checkout-notes", "Notas para a entrega", { name: "notes", full: true, required: false, placeholder: "Ex.: deixar na portaria, mensagem para o cartão de oferta…" })}
      </div>

      <div class="checkout-step__actions">
        <a class="checkout-back" href="carrinho.html">${icon("arrowLeft")} Voltar ao carrinho</a>
        <button class="btn" type="submit" data-next-step="2">Continuar para envio ${icon("arrowRight")}</button>
      </div>
    </form>
  </section>`;

const shippingOptionsMarkup = () => {
  const totals = getTotals({ shippingId: state.shippingId });
  return Object.values(SHIPPING_OPTIONS)
    .map((option) => {
      const price = shippingPrice(option, totals.subtotal);
      const checked = option.id === state.shippingId ? "checked" : "";
      return `
        <label class="choice-card">
          <input type="radio" name="shipping" value="${option.id}" ${checked}>
          <span class="choice-card__control" aria-hidden="true"></span>
          <span class="choice-card__body">
            <span class="choice-card__title">
              <span>${escapeHtml(option.name)}</span>
              ${price === 0 ? '<span class="choice-card__free">Grátis</span>' : `<strong>${formatPrice(price)}</strong>`}
            </span>
            <span class="choice-card__description">${escapeHtml(option.description)}</span>
          </span>
        </label>`;
    })
    .join("");
};

const shippingPanel = () => `
  <section class="checkout-panel checkout-step" data-step-panel="2" aria-labelledby="checkout-step-2">
    <div class="checkout-panel__head">
      <h2 id="checkout-step-2" tabindex="-1">Como queremos fazer chegar o café?</h2>
      <p>Enviamos à segunda, terça e quinta-feira. A próxima janela de entrega estimada é <strong data-delivery-window>${deliveryWindow()}</strong>.</p>
    </div>
    <form data-checkout-form="shipping" novalidate>
      <h3 class="checkout-section-title">Método de envio</h3>
      <div class="shipping-options" data-shipping-options>
        ${shippingOptionsMarkup()}
      </div>
      <div class="guest-note mt-3">
        ${icon("leaf")}
        <span>Embalagens sem plástico, com cartão FSC. Se escolheres levantamento, avisamos por email quando estiver pronto no balcão.</span>
      </div>
      <div class="checkout-step__actions">
        <button class="checkout-back" type="button" data-previous-step="1">${icon("arrowLeft")} Contacto</button>
        <button class="btn" type="submit" data-next-step="3">Continuar para pagamento ${icon("arrowRight")}</button>
      </div>
    </form>
  </section>`;

const paymentOption = (method, index, iconText) => `
  <label class="choice-card payment-card">
    <input type="radio" name="payment" value="${method.id}" ${index === 0 ? "checked" : ""}>
    <span class="choice-card__control" aria-hidden="true"></span>
    <span class="choice-card__icon" aria-hidden="true">${iconText}</span>
    <span class="choice-card__body">
      <span class="choice-card__title"><span>${escapeHtml(method.label)}</span></span>
      <span class="choice-card__description">${escapeHtml(method.note)}</span>
    </span>
  </label>`;

const paymentPanel = () => `
  <section class="checkout-panel checkout-step" data-step-panel="3" aria-labelledby="checkout-step-3">
    <div class="checkout-panel__head">
      <h2 id="checkout-step-3" tabindex="-1">Pagamento</h2>
      <p>Este checkout é uma demonstração. Nenhum valor é cobrado e não deves introduzir dados reais de cartão.</p>
    </div>
    <form data-checkout-form="payment" novalidate>
      <h3 class="checkout-section-title">Método de pagamento</h3>
      <div class="payment-options" data-payment-options>
        ${Object.values(PAYMENT_METHODS)
          .map((method, index) => {
            const labelMap = {
              card: "Visa / MC",
              mbway: "MB WAY",
              multibanco: "MB",
              paypal: "PayPal",
            };
            return paymentOption(method, index, labelMap[method.id] || "Pagar");
          })
          .join("")}
      </div>

      <div class="payment-method-fields is-visible" data-payment-fields="card">
        <div class="form-grid form-grid--2">
          ${field("card-name", "Nome no cartão", { name: "cardName", autocomplete: "cc-name", full: true, placeholder: "Como está impresso no cartão" })}
          ${field("card-number", "Número do cartão", { name: "cardNumber", autocomplete: "cc-number", inputmode: "numeric", full: true, maxlength: "23", placeholder: "4242 4242 4242 4242" })}
          ${field("card-expiry", "Validade", { name: "cardExpiry", autocomplete: "cc-exp", inputmode: "numeric", maxlength: "5", placeholder: "MM/AA" })}
          ${field("card-cvc", "CVC", { name: "cardCvc", autocomplete: "cc-csc", inputmode: "numeric", maxlength: "4", placeholder: "123" })}
        </div>
        <p class="field__hint mt-2">${icon("lock")} Os dados do cartão não são guardados. Usa apenas números de teste, como 4242 4242 4242 4242.</p>
      </div>

      <div class="payment-method-fields" data-payment-fields="mbway">
        <div class="form-grid">
          ${field("mbway-phone", "Número de telemóvel associado ao MB WAY", { type: "tel", name: "mbwayPhone", inputmode: "tel", autocomplete: "tel", placeholder: "912 345 678", hint: "Receberias um pedido de pagamento no telemóvel. Nesta demonstração, não é enviado nada." })}
        </div>
      </div>

      <div class="payment-method-fields" data-payment-fields="multibanco">
        <div class="payment-info">
          ${icon("info")}
          <p>No passo seguinte seria gerada uma referência Multibanco válida durante 48 horas. Nesta demonstração, a referência abaixo é apenas ilustrativa: <strong>123 456 789</strong>, entidade <strong>21234</strong>.</p>
        </div>
      </div>

      <div class="payment-method-fields" data-payment-fields="paypal">
        <div class="payment-info">
          ${icon("shield")}
          <p>Serias encaminhado para o PayPal para concluir o pagamento. O carrinho e a morada seriam mantidos em segurança.</p>
        </div>
      </div>

      <div class="checkout-trust">
        <span>${icon("lock")} Ligação encriptada</span>
        <span>${icon("shield")} Dados protegidos</span>
        <span>${icon("refresh")} Devolução em 14 dias</span>
      </div>

      <div class="checkout-step__actions">
        <button class="checkout-back" type="button" data-previous-step="2">${icon("arrowLeft")} Envio</button>
        <button class="btn" type="submit" data-next-step="4">Rever a encomenda ${icon("arrowRight")}</button>
      </div>
    </form>
  </section>`;

const reviewPanel = () => `
  <section class="checkout-panel checkout-step" data-step-panel="4" aria-labelledby="checkout-step-4">
    <div class="checkout-panel__head">
      <h2 id="checkout-step-4" tabindex="-1">Revisão final</h2>
      <p>Confirma os dados antes de concluir. Podes editar qualquer secção.</p>
    </div>
    <div class="review-order" data-review-order>
      ${reviewMarkup()}
    </div>
    <form data-checkout-form="review" novalidate>
      <label class="checkbox checkout-terms" data-field="terms">
        <input type="checkbox" name="terms" required>
        <span class="checkbox__box" aria-hidden="true"></span>
        <span>Li e aceito os <a href="termos.html" target="_blank" rel="noopener">termos e condições</a> e a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</span>
      </label>
      <span class="field__error" role="alert"></span>
      <p class="checkout-privacy">Ao confirmar, autorizas o tratamento dos dados indicados para preparar e entregar a encomenda. Nesta demonstração, os dados ficam apenas no teu navegador.</p>
      <div class="checkout-step__actions">
        <button class="checkout-back" type="button" data-previous-step="3">${icon("arrowLeft")} Pagamento</button>
        <button class="btn" type="submit" data-place-order>Confirmar encomenda simulada ${icon("check")}</button>
      </div>
    </form>
  </section>`;

const addressLine = () => {
  const contact = state.contact;
  return contact.address
    ? `${escapeHtml(contact.address)}<br>${escapeHtml(contact.postalCode || "")} ${escapeHtml(contact.city || "")}`
    : "A preencher no passo de contacto.";
};

const reviewMarkup = () => {
  const shipping = SHIPPING_OPTIONS[state.shippingId] || SHIPPING_OPTIONS.ctt;
  const payment = PAYMENT_METHODS[state.paymentId] || PAYMENT_METHODS.card;
  const totals = getTotals({ shippingId: state.shippingId });
  return `
    <div class="review-block">
      <div class="review-block__head">
        <h3>Contacto e entrega</h3>
        <button class="review-block__edit" type="button" data-edit-step="1">Editar</button>
      </div>
      <p>
        <strong>${escapeHtml(state.contact.firstName || "")} ${escapeHtml(state.contact.lastName || "")}</strong><br>
        ${escapeHtml(state.contact.email || "Email a preencher")} · ${escapeHtml(state.contact.phone || "telefone a preencher")}<br>
        ${addressLine()}<br>
        ${escapeHtml(state.contact.country || "Portugal")}
      </p>
    </div>
    <div class="review-block">
      <div class="review-block__head">
        <h3>Envio</h3>
        <button class="review-block__edit" type="button" data-edit-step="2">Editar</button>
      </div>
      <p><strong>${escapeHtml(shipping.name)}</strong><br>${escapeHtml(shipping.description)} · ${totals.shipping === 0 ? "grátis" : formatPrice(totals.shipping)}<br>${deliveryWindow()}</p>
    </div>
    <div class="review-block">
      <div class="review-block__head">
        <h3>Pagamento</h3>
        <button class="review-block__edit" type="button" data-edit-step="3">Editar</button>
      </div>
      <p><strong>${escapeHtml(payment.label)}</strong><br>${escapeHtml(payment.note)}<br><span class="text-small">Ambiente demonstrativo — não será cobrado qualquer valor.</span></p>
    </div>`;
};

const renderSteps = () => {
  const cart = getCart();
  if (!content) return;
  setCheckoutChrome(cart.length > 0);
  if (!cart.length) {
    content.innerHTML = `
      <div class="checkout-empty cart-empty">
        <div class="cart-empty__card">
          <span class="cart-empty__mark">${icon("bag")}</span>
          <h2>O carrinho está vazio.</h2>
          <p>Escolhe um café antes de finalizar a compra. Os favoritos da casa são um bom ponto de partida.</p>
          <div class="cart-empty__actions">
            <a class="btn" href="loja.html">Ir à loja ${icon("arrowRight")}</a>
            <a class="btn btn--outline" href="carrinho.html">Ver carrinho</a>
          </div>
        </div>
      </div>`;
    qsa(".checkout-step-link").forEach((link) => link.classList.remove("is-active", "is-complete"));
    if (summaryDesktop) summaryDesktop.innerHTML = "";
    if (mobileSummary) mobileSummary.hidden = true;
    return;
  }

  content.innerHTML = `
    ${contactPanel()}
    ${shippingPanel()}
    ${paymentPanel()}
    ${reviewPanel()}`;
  updateStepState();
  updatePaymentFields();
  refreshReview();
};

const updateStepState = () => {
  qsa("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", Number(panel.dataset.stepPanel) === state.step);
  });
  checkoutSteps.forEach((link) => {
    const step = Number(link.dataset.stepLink);
    link.classList.toggle("is-active", step === state.step);
    link.classList.toggle("is-complete", step < state.step);
    const number = qs(".checkout-step-link__num", link);
    const label = qs("span:last-child", link);
    if (number) number.innerHTML = `<span>${step}</span>`;
    if (label) label.textContent = steps.find((item) => item.id === step)?.label || "";
    if (link.hasAttribute("aria-current")) link.removeAttribute("aria-current");
    if (step === state.step) link.setAttribute("aria-current", "step");
  });
};

const summaryContentsMarkup = (scope) => {
  const totals = getTotals({ shippingId: state.shippingId });
  const applied = getAppliedPromo();
  const items = getCart();
  return `
    <div class="checkout-summary__head">
      <h2 id="checkout-resumo-${scope}">Resumo</h2>
      <span>${totals.count} ${totals.count === 1 ? "artigo" : "artigos"}</span>
      <button class="checkout-summary__toggle" type="button" aria-label="Mostrar resumo" data-summary-toggle aria-expanded="false">${icon("chevronDown")}</button>
    </div>
    <div class="checkout-summary__lines" data-summary-lines>
      ${items
        .map((line) => {
          const details = getCartItemDetails(line);
          if (!details) return "";
          return `<div class="checkout-summary-line">
            <img src="${details.product.images[0].src}" alt="" width="88" height="110" loading="lazy">
            <span class="checkout-summary-line__copy">
              <strong>${escapeHtml(details.product.name)}</strong>
              <span>${escapeHtml(details.format.label)}${details.grind ? ` · ${escapeHtml(details.grind.label)}` : ""}${line.subscription ? " · subscrição" : ""} · ${line.qty} ×</span>
            </span>
            <strong>${formatPrice(details.lineTotal)}</strong>
          </div>`;
        })
        .join("")}
    </div>
    <div class="checkout-summary__totals">
      ${summaryLine("Subtotal", formatPrice(totals.subtotal))}
      ${
        totals.discount > 0
          ? summaryLine(
              `Desconto ${totals.appliedPromo?.code || ""}`,
              `−${formatPrice(totals.discount)}`,
              "summary-line--discount"
            )
          : ""
      }
      ${summaryLine(
        "Portes",
        totals.shipping === 0 ? "Grátis" : formatPrice(totals.shipping),
        totals.shipping === 0 ? "summary-line--free" : ""
      )}
      <div class="checkout-summary__total"><span>Total</span><strong>${formatPrice(totals.total)}</strong></div>
      <p class="checkout-summary__fine">${SITE.vatNote} Portes finais confirmados nesta etapa.</p>
    </div>
    ${
      applied
        ? `<div class="promo-applied is-visible">${icon("check")} ${escapeHtml(applied.code)} · ${escapeHtml(applied.label)}<button type="button" data-remove-promo>Remover</button></div>`
        : `<form class="checkout-summary__promo" data-checkout-promo novalidate>
            <label class="sr-only" for="checkout-promo-${scope}">Código promocional</label>
            <input class="input" id="checkout-promo-${scope}" name="promo" type="text" placeholder="Código promocional" autocomplete="off" aria-describedby="checkout-promo-message-${scope}">
            <button class="btn btn--outline" type="submit">Aplicar</button>
          </form>
          <p class="form-message ${state.promoFeedback ? `form-message--${state.promoFeedback.type} is-visible` : ""} mt-2" id="checkout-promo-message-${scope}" data-checkout-promo-message role="status">${state.promoFeedback ? escapeHtml(state.promoFeedback.text) : ""}</p>`
    }
    <div class="checkout-summary__help">
      <strong>Precisas de ajuda?</strong><br>
      Escreve para <a href="mailto:${SITE.email}">${SITE.email}</a> ou fala connosco por WhatsApp.
    </div>`;
};

const renderSummary = () => {
  const cart = getCart();
  if (!cart.length) {
    if (summaryDesktop) summaryDesktop.innerHTML = "";
    if (mobileSummary) mobileSummary.hidden = true;
    return;
  }
  const totals = getTotals({ shippingId: state.shippingId });
  if (summaryDesktop) summaryDesktop.innerHTML = summaryContentsMarkup("desktop");
  if (mobileSummaryContent) mobileSummaryContent.innerHTML = summaryContentsMarkup("mobile");
  if (mobileSummary) mobileSummary.hidden = false;
  if (mobileSummaryMeta) {
    mobileSummaryMeta.textContent = `${totals.count} ${totals.count === 1 ? "artigo" : "artigos"} · ${formatPrice(totals.total)}`;
  }
  if (mobileSummaryTotal) mobileSummaryTotal.textContent = formatPrice(totals.total);

  qsa("[data-summary-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const details = button.closest("details");
      if (details) details.open = !details.open;
      button.setAttribute("aria-expanded", String(details?.open || false));
    });
  });
};

const refreshShippingTotals = () => {
  const optionsContainer = qs("[data-shipping-options]");
  if (optionsContainer) {
    const current = state.shippingId;
    optionsContainer.innerHTML = shippingOptionsMarkup();
    state.shippingId = current;
    const checked = qs(`input[name="shipping"][value="${current}"]`, optionsContainer);
    if (checked) checked.checked = true;
    updateShippingChoice();
  }
  const windowLabel = qs("[data-delivery-window]");
  if (windowLabel) windowLabel.textContent = deliveryWindow();
  renderSummary();
  refreshReview();
};

const refreshReview = () => {
  const review = qs("[data-review-order]");
  if (review) review.innerHTML = reviewMarkup();
};

const updateShippingChoice = () => {
  qsa('input[name="shipping"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      state.shippingId = input.value;
      refreshShippingTotals();
      track("checkout_shipping_selected", { shipping: input.value });
    });
  });
};

const updatePaymentFields = () => {
  const selected = qs('input[name="payment"]:checked');
  state.paymentId = selected?.value || state.paymentId || "card";
  qsa("[data-payment-fields]").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.paymentFields === state.paymentId);
  });
  refreshReview();
};

const updatePaymentChoice = () => {
  qsa('input[name="payment"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.paymentId = input.value;
      updatePaymentFields();
      track("checkout_payment_selected", { payment: input.value });
    });
  });
};

const setFieldError = (input, message = "") => {
  const target = input.closest(".field") || input.closest(".checkout-terms")?.parentElement;
  const error = target?.querySelector(".field__error");
  if (input.closest(".checkout-terms")) {
    input.closest(".checkout-terms")?.classList.toggle("has-error", Boolean(message));
  } else {
    input.closest(".field")?.classList.toggle("has-error", Boolean(message));
  }
  if (error) error.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
};

const validateInput = (input) => {
  if (!input.required || input.type === "checkbox") return true;
  const value = input.value.trim();
  if (!value) {
    setFieldError(input, "Preenche este campo, por favor.");
    return false;
  }
  if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    setFieldError(input, "Escreve um email válido, por exemplo nome@email.pt.");
    return false;
  }
  if (input.name === "postalCode" && !/^\d{4}-\d{3}$/.test(value)) {
    setFieldError(input, "Usa o formato 0000-000.");
    return false;
  }
  if (input.name === "phone" || input.name === "mbwayPhone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 9) {
      setFieldError(input, "Indica um número com pelo menos 9 dígitos.");
      return false;
    }
  }
  setFieldError(input, "");
  return true;
};

const validateCard = () => {
  const number = qs("#card-number");
  const name = qs("#card-name");
  const expiry = qs("#card-expiry");
  const cvc = qs("#card-cvc");
  let valid = true;
  if (!name.value.trim()) {
    setFieldError(name, "Indica o nome impresso no cartão.");
    valid = false;
  } else setFieldError(name, "");
  const digits = number.value.replace(/\D/g, "");
  if (digits.length < 12) {
    setFieldError(number, "Usa um número de cartão de teste, como 4242 4242 4242 4242.");
    valid = false;
  } else setFieldError(number, "");
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value.trim())) {
    setFieldError(expiry, "Indica a validade no formato MM/AA.");
    valid = false;
  } else setFieldError(expiry, "");
  if (!/^\d{3,4}$/.test(cvc.value.trim())) {
    setFieldError(cvc, "Indica os 3 ou 4 dígitos do CVC.");
    valid = false;
  } else setFieldError(cvc, "");
  return valid;
};

const validateStep = (step) => {
  if (step === 1) {
    const form = qs('[data-checkout-form="contact"]');
    const fields = qsa("input[required], select[required]", form);
    let valid = true;
    fields.forEach((input) => {
      if (!validateInput(input)) valid = false;
    });
    if (!valid) {
      qs(".field.has-error .input, .field.has-error .select", form)?.focus();
      return false;
    }
    const data = new FormData(form);
    state.contact = {
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      firstName: String(data.get("firstName") || "").trim(),
      lastName: String(data.get("lastName") || "").trim(),
      address: String(data.get("address") || "").trim(),
      postalCode: String(data.get("postalCode") || "").trim(),
      city: String(data.get("city") || "").trim(),
      country: String(data.get("country") || "Portugal"),
      notes: String(data.get("notes") || "").trim(),
    };
    return true;
  }
  if (step === 2) {
    const checked = qs('input[name="shipping"]:checked');
    if (!checked) {
      window.alert("Escolhe um método de envio.");
      return false;
    }
    state.shippingId = checked.value;
    return true;
  }
  if (step === 3) {
    const selected = qs('input[name="payment"]:checked');
    if (!selected) {
      window.alert("Escolhe um método de pagamento.");
      return false;
    }
    state.paymentId = selected.value;
    if (state.paymentId === "card") return validateCard();
    if (state.paymentId === "mbway") {
      const phone = qs("#mbway-phone");
      if (!validateInput(phone)) {
        phone.focus();
        return false;
      }
    }
    return true;
  }
  return true;
};

const collectFormatted = () => {
  const contactForm = qs('[data-checkout-form="contact"]');
  const data = new FormData(contactForm);
  state.contact = {
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    firstName: String(data.get("firstName") || "").trim(),
    lastName: String(data.get("lastName") || "").trim(),
    address: String(data.get("address") || "").trim(),
    postalCode: String(data.get("postalCode") || "").trim(),
    city: String(data.get("city") || "").trim(),
    country: String(data.get("country") || "Portugal"),
    notes: String(data.get("notes") || "").trim(),
  };
};

const goToStep = (step, { scroll = true } = {}) => {
  state.step = Math.max(1, Math.min(4, Number(step) || 1));
  updateStepState();
  refreshReview();
  const page = qs(".checkout-page");
  if (scroll) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = (page?.offsetTop || 0) + 10;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    window.setTimeout(() => {
      const active = qs(".checkout-step.is-active h2");
      if (active) active.focus?.({ preventScroll: true });
    }, 240);
  }
};

const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `TL-${year}-${suffix}`;
};

const placeOrder = () => {
  const terms = qs('input[name="terms"]');
  if (!terms.checked) {
    setFieldError(terms, "Aceita os termos e a política de privacidade para continuar.");
    terms.focus();
    return;
  }
  setFieldError(terms, "");
  collectFormatted();

  const shipping = SHIPPING_OPTIONS[state.shippingId] || SHIPPING_OPTIONS.ctt;
  const payment = PAYMENT_METHODS[state.paymentId] || PAYMENT_METHODS.card;
  const totals = getTotals({ shippingId: state.shippingId });
  const order = {
    number: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    contact: { ...state.contact },
    shipping: { ...shipping, price: totals.shipping },
    payment: {
      id: payment.id,
      label: payment.label,
      note: payment.note,
      cardLast4:
        payment.id === "card"
          ? qs("#card-number")?.value.replace(/\D/g, "").slice(-4)
          : null,
    },
    items: getCart().map((line) => {
      const details = getCartItemDetails(line);
      return {
        line,
        productId: line.productId,
        name: details?.product.name || "Produto Torra Lusa",
        image: details?.product.images[0]?.src || "images/products/etiopia-guji.webp",
        format: details?.format.label || line.formatId,
        grind: details?.grind?.label || "",
        unitPrice: details?.unitPrice || 0,
        lineTotal: details?.lineTotal || 0,
        quantity: line.qty,
        subscription: line.subscription,
      };
    }),
    totals: {
      subtotal: totals.subtotal,
      discount: totals.discount,
      promo: totals.appliedPromo || null,
      shipping: totals.shipping,
      total: totals.total,
    },
    estimatedDelivery: deliveryWindow(),
    isSimulation: true,
  };

  state.isPlacingOrder = true;
  try {
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // A confirmação continua a funcionar nesta sessão sem persistência.
  }
  document.dispatchEvent(new CustomEvent("order:placed", { detail: { order } }));
  track("order_placed", { number: order.number, total: order.totals.total });

  const button = qs("[data-place-order]");
  if (button) {
    button.disabled = true;
    button.innerHTML = `${icon("refresh")} A preparar a confirmação…`;
  }
  clearCart();
  window.setTimeout(() => {
    window.location.href = "confirmacao.html";
  }, 500);
};

const bindFieldValidation = () => {
  qsa("[data-checkout-form] input, [data-checkout-form] select").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.closest(".field")?.classList.contains("has-error")) validateInput(input);
    });
    input.addEventListener("blur", () => {
      if (input.required && input.type !== "checkbox") validateInput(input);
    });
    if (input.name === "terms") {
      input.addEventListener("change", () => {
        if (input.checked) setFieldError(input, "");
      });
    }
  });
  qsa("[data-checkout-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const type = form.dataset.checkoutForm;
      if (type === "contact") {
        if (!validateStep(1)) return;
        goToStep(2);
      } else if (type === "shipping") {
        if (!validateStep(2)) return;
        goToStep(3);
      } else if (type === "payment") {
        if (!validateStep(3)) return;
        collectFormatted();
        refreshReview();
        goToStep(4);
      } else if (type === "review") {
        placeOrder();
      }
    });
  });
  qsa("[data-previous-step]").forEach((button) => {
    button.addEventListener("click", () => goToStep(button.dataset.previousStep));
  });
  qsa("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", () => goToStep(button.dataset.editStep));
  });
  const cardNumber = qs("#card-number");
  cardNumber?.addEventListener("input", () => {
    cardNumber.value = cardNumber.value
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  });
  const expiry = qs("#card-expiry");
  expiry?.addEventListener("input", () => {
    const digits = expiry.value.replace(/\D/g, "").slice(0, 4);
    expiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });
};

const initSummaryForms = () => {
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-checkout-promo]");
    if (!form) return;
    event.preventDefault();
    const input = qs('input[name="promo"]', form);
    const result = applyPromo(input?.value || "");
    state.promoFeedback = { type: result.ok ? "success" : "error", text: result.message };
    if (result.ok) track("promo_applied", { code: input.value.trim().toUpperCase() });
    renderSummary();
    refreshShippingTotals();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-remove-promo]")) return;
    removePromo();
    state.promoFeedback = { type: "success", text: "Código removido." };
    renderSummary();
    refreshShippingTotals();
  });
};

export const init = () => {
  renderSteps();
  renderSummary();
  initSummaryForms();
  bindFieldValidation();
  updateShippingChoice();
  updatePaymentChoice();
  if (mobileSummary) mobileSummary.hidden = getCart().length === 0;
  document.addEventListener("cart:changed", () => {
    if (state.isPlacingOrder) return;
    if (!getCart().length) renderSteps();
  });
};
