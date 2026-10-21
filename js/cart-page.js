/**
 * Torra Lusa — página do carrinho
 * -------------------------------------------------
 * Apresenta as linhas guardadas em localStorage, quantidades, portes
 * estimados, códigos promocionais e produtos de complemento.
 */

import { formatPrice } from "./data.js";
import {
  PRODUCTS,
  getStartingPrice,
  getBestsellers,
} from "./products.js";
import {
  applyPromo,
  cartLineMarkup,
  freeShippingMarkup,
  getAppliedPromo,
  getCart,
  getCartItemDetails,
  getTotals,
  removeItem,
  removePromo,
  summaryLine,
  updateQty,
  upsellItem,
} from "./cart.js";
import {
  escapeHtml,
  icon,
  observeReveals,
  productCard,
} from "./components.js";
import { track } from "./analytics.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const content = qs("[data-cart-page-content]");
const summary = qs("[data-cart-page-summary]");
const layout = qs(".cart-layout");
const headMeta = qs("[data-cart-head-meta]");

let promoFeedback = null;
let focusRequest = null;

const addonsMarkup = () => {
  const inCart = new Set(getCart().map((line) => line.productId));
  const suggestions = PRODUCTS.filter(
    (product) =>
      !inCart.has(product.id) &&
      product.stock > 0 &&
      ["capsulas", "acessorios"].includes(product.category)
  )
    .sort((a, b) => getStartingPrice(a) - getStartingPrice(b))
    .slice(0, 2);
  if (!suggestions.length) return "";
  return `
    <section class="cart-addons" aria-labelledby="cart-addons-title">
      <div class="cart-addons__head">
        <h2 id="cart-addons-title">Para a próxima chávena</h2>
        <a href="loja.html?categoria=acessorios">Ver todos os acessórios</a>
      </div>
      <div class="cart-addons__grid">
        ${suggestions.map((product) => upsellItem(product)).join("")}
      </div>
    </section>`;
};

const emptyMarkup = () => {
  const suggestions = getBestsellers(4);
  return `
    <div class="cart-empty">
      <div class="cart-empty__card">
        <span class="cart-empty__mark">${icon("bag", "", 30)}</span>
        <h2>O carrinho está à espera.</h2>
        <p>Ainda não escolheste café. Começa pelos lotes que mais saem da torrefação ou deixa o guia encontrar o teu perfil.</p>
        <div class="cart-empty__actions">
          <a class="btn" href="loja.html">Escolher café ${icon("arrowRight")}</a>
          <a class="btn btn--outline" href="index.html#guia">Abrir o guia de escolha</a>
        </div>
      </div>
    </div>
    <section class="cart-empty-suggestions" aria-labelledby="cart-suggestions-title">
      <div class="between" style="flex-wrap:wrap;gap:1rem;margin-bottom:1.4rem">
        <div>
          <span class="eyebrow">Bons pontos de partida</span>
          <h2 class="section-title" id="cart-suggestions-title" style="font-size:clamp(1.8rem,1.4rem+1.5vw,2.6rem);margin-top:.7rem">Os favoritos da casa.</h2>
        </div>
        <a class="link-arrow" href="loja.html">Ver toda a loja ${icon("arrowRight")}</a>
      </div>
      <div class="product-grid product-grid--3">
        ${suggestions.map((product, index) => productCard(product, { index })).join("")}
      </div>
    </section>`;
};

const summaryMarkup = (totals) => {
  const applied = getAppliedPromo();
  return `
    <div class="cart-summary">
      <h2>Resumo</h2>
      <div class="summary-lines">
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
          "Portes estimados",
          totals.freeShipping ? "Grátis" : formatPrice(totals.shipping),
          totals.freeShipping ? "summary-line--free" : ""
        )}
      </div>
      <div class="summary-total">
        <span>Total</span>
        <strong data-cart-total>${formatPrice(totals.total)}</strong>
      </div>
      <p class="summary-vat">IVA incluído. Os portes são confirmados na etapa seguinte.${
        totals.subscriptionSaving > 0
          ? ` Inclui ${formatPrice(totals.subscriptionSaving)} de poupança em subscrições.`
          : ""
      }</p>

      ${
        applied
          ? `<div class="promo-applied is-visible">
              ${icon("check")} ${escapeHtml(applied.code)} · ${escapeHtml(applied.label)}
              <button type="button" data-remove-promo>Remover</button>
            </div>`
          : `<form class="promo-form" data-promo-form novalidate>
              <label class="field__label" for="promo-code">Tens um código?</label>
              <div class="promo-form__row">
                <input class="input" id="promo-code" name="promo" type="text" placeholder="Ex.: BEMVINDO10" autocomplete="off" aria-describedby="promo-message">
                <button class="btn btn--outline" type="submit">Aplicar</button>
              </div>
              <p class="form-message ${promoFeedback ? `form-message--${promoFeedback.type} is-visible` : ""}" id="promo-message" data-promo-message role="status">${promoFeedback ? escapeHtml(promoFeedback.text) : ""}</p>
            </form>`
      }

      <a class="btn" href="checkout.html">Continuar para o checkout ${icon("arrowRight")}</a>
      <p class="cart-summary__secure">${icon("lock")} Pagamento simulado e seguro</p>
      <div class="cart-summary__methods" aria-label="Métodos de pagamento">
        <span class="payment-mark">Visa</span>
        <span class="payment-mark">MC</span>
        <span class="payment-mark">MB WAY</span>
        <span class="payment-mark">Multibanco</span>
        <span class="payment-mark">PayPal</span>
      </div>
      <p class="cart-summary__help">Precisas de ajuda com a encomenda? <a href="contactos.html">Fala connosco</a>.</p>
    </div>`;
};

const focusAfterRender = () => {
  if (!focusRequest) return;
  const line = qs(`[data-line-id="${CSS.escape(focusRequest.lineId)}"]`);
  const target = line ? qs(focusRequest.selector, line) : null;
  if (target) target.focus({ preventScroll: true });
  else qs("[data-cart-page-content]")?.focus?.({ preventScroll: true });
  focusRequest = null;
};

const render = () => {
  if (!content || !summary) return;
  const cart = getCart();
  const totals = getTotals();
  const empty = cart.length === 0;

  layout?.classList.toggle("is-empty", empty);
  if (summary) summary.hidden = empty;
  if (headMeta) {
    headMeta.textContent = empty
      ? "Nenhum artigo por agora."
      : `${totals.count} ${totals.count === 1 ? "artigo" : "artigos"} · ${
          totals.freeShipping ? "portes grátis desbloqueados" : "portes calculados no checkout"
        }`;
  }
  document.title = empty
    ? "Carrinho — Torra Lusa"
    : `Carrinho (${totals.count}) — Torra Lusa`;

  if (empty) {
    content.innerHTML = emptyMarkup();
    summary.innerHTML = "";
    observeReveals(content);
    return;
  }

  content.innerHTML = `
    ${freeShippingMarkup(totals)}
    <div class="cart-lines">
      ${cart.map((line) => cartLineMarkup(line)).join("")}
    </div>
    <div class="mt-3">
      <a class="link-arrow" href="loja.html">${icon("arrowLeft")} Continuar a comprar</a>
    </div>
    ${addonsMarkup()}`;
  summary.innerHTML = summaryMarkup(totals);
  focusAfterRender();
  observeReveals(content);
};

const handleClick = (event) => {
  const lineElement = event.target.closest("[data-line-id]");
  if (lineElement) {
    const lineId = lineElement.dataset.lineId;
    const line = getCart().find((item) => item.id === lineId);
    if (line) {
      if (event.target.closest("[data-cart-increment]")) {
        focusRequest = { lineId, selector: "[data-cart-increment]" };
        updateQty(lineId, Math.min(line.qty + 1, 20));
        track("cart_quantity_change", { product: line.productId, quantity: line.qty + 1 });
      } else if (event.target.closest("[data-cart-decrement]")) {
        focusRequest = {
          lineId,
          selector: line.qty <= 1 ? "[data-cart-remove]" : "[data-cart-decrement]",
        };
        updateQty(lineId, line.qty - 1);
        track("cart_quantity_change", { product: line.productId, quantity: line.qty - 1 });
      } else if (event.target.closest("[data-cart-remove]")) {
        const details = getCartItemDetails(line);
        focusRequest = null;
        removeItem(lineId);
        if (details) track("cart_remove", { product: details.product.id });
      }
    }
  }

  if (event.target.closest("[data-remove-promo]")) {
    removePromo();
    promoFeedback = { type: "success", text: "Código removido." };
    render();
  }
};

const initPromo = () => {
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-promo-form]");
    if (!form) return;
    event.preventDefault();
    const input = qs('input[name="promo"]', form);
    const result = applyPromo(input?.value || "");
    promoFeedback = {
      type: result.ok ? "success" : "error",
      text: result.message,
    };
    if (result.ok) track("promo_applied", { code: input.value.trim().toUpperCase() });
    render();
  });
};

export const init = () => {
  render();
  document.addEventListener("click", handleClick);
  initPromo();
  document.addEventListener("cart:changed", render);
  document.addEventListener("cart:removed", (event) => {
    const product = event.detail?.product;
    if (product) {
      promoFeedback = null;
    }
  });
};
