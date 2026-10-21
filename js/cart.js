/**
 * Torra Lusa — carrinho
 * -------------------------------------------------
 * Estado persistente em localStorage, cálculo de totais, códigos
 * promocionais e interface do painel lateral. A página completa do
 * carrinho vive em cart-page.js e usa as mesmas funções.
 */

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_OPTIONS,
  PROMO_CODES,
  formatPrice,
} from "./data.js";
import {
  PRODUCTS,
  getProduct,
  getFormat,
  getUnitPrice,
  getStartingPrice,
  isAvailable,
  isLowStock,
  getBestsellers,
  GRINDS,
} from "./products.js";
import { icon, freeShippingUpsell, upsellItem, escapeHtml } from "./components.js";

const CART_KEY = "torraLusaCart:v1";
const PROMO_KEY = "torraLusaPromo:v1";
const MAX_QTY_PER_LINE = 20;

const storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Sem localStorage: a loja continua a funcionar apenas nesta página.
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // silencioso por design
    }
  },
};

const makeLineId = ({ productId, formatId, grindId = "", subscription = false }) =>
  `${productId}::${formatId}::${grindId || "sem-moagem"}::${subscription ? "sub" : "unica"}`;

const normalizeLine = (line) => {
  const product = getProduct(line.productId);
  if (!product) return null;
  const format = getFormat(product, line.formatId);
  if (!format) return null;
  const grindId =
    product.grinds && line.grindId && product.grinds.some((grind) => grind.id === line.grindId)
      ? line.grindId
      : product.grinds
        ? product.grinds[0].id
        : "";
  const subscription = Boolean(line.subscription && product.subscription);
  return {
    ...line,
    formatId: format.id,
    grindId,
    subscription,
    qty: Math.max(1, Math.min(Number(line.qty) || 1, MAX_QTY_PER_LINE, Math.max(product.stock, 1))),
    id: makeLineId({ productId: product.id, formatId: format.id, grindId, subscription }),
  };
};

const loadCart = () => {
  const stored = storage.get(CART_KEY, []);
  if (!Array.isArray(stored)) return [];
  const seen = new Set();
  return stored
    .map(normalizeLine)
    .filter((line) => {
      if (!line || seen.has(line.id) || !isAvailable(getProduct(line.productId))) return false;
      seen.add(line.id);
      return true;
    });
};

let cart = loadCart();
let promoCode = storage.get(PROMO_KEY, null);

const persist = ({ reason = "update", line = null } = {}) => {
  storage.set(CART_KEY, cart);
  if (promoCode) storage.set(PROMO_KEY, promoCode);
  else storage.remove(PROMO_KEY);
  document.dispatchEvent(
    new CustomEvent("cart:changed", {
      detail: { reason, line, items: getCart(), totals: getTotals() },
    })
  );
};

export const getCart = () => cart.map((line) => ({ ...line }));

export const getCartCount = () => cart.reduce((sum, line) => sum + line.qty, 0);

export const getCartItemDetails = (line) => {
  const product = getProduct(line.productId);
  if (!product) return null;
  const format = getFormat(product, line.formatId);
  const grind = line.grindId ? GRINDS[line.grindId] : null;
  const unitPrice = getUnitPrice(product, format.id, line.subscription);
  const regularPrice = format.price;
  return {
    product,
    format,
    grind,
    unitPrice,
    regularPrice,
    lineTotal: Math.round(unitPrice * line.qty * 100) / 100,
    saving: Math.round((regularPrice - unitPrice) * line.qty * 100) / 100,
  };
};

const getPromoDetails = (code = promoCode) => {
  if (!code) return null;
  const promo = PROMO_CODES[String(code).toUpperCase()];
  if (!promo) return null;
  const subtotal = cart.reduce((sum, line) => {
    const details = getCartItemDetails(line);
    return sum + (details ? details.lineTotal : 0);
  }, 0);
  if (subtotal < promo.minSubtotal) return { promo, eligible: false, subtotal };
  return { promo, eligible: true, subtotal };
};

export const getAppliedPromo = () => {
  const details = getPromoDetails();
  return details?.eligible ? details.promo : null;
};

export const applyPromo = (code) => {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) {
    return { ok: false, message: "Escreve o código promocional." };
  }
  if (!PROMO_CODES[normalized]) {
    return { ok: false, message: "Esse código não existe. Verifica as letras e tenta novamente." };
  }
  const details = getPromoDetails(normalized);
  if (!details.eligible) {
    return {
      ok: false,
      message: `O código ${normalized} só é válido para compras a partir de ${formatPrice(details.promo.minSubtotal)}.`,
    };
  }
  promoCode = normalized;
  persist({ reason: "promo" });
  return { ok: true, message: `${PROMO_CODES[normalized].label} aplicado.`, promo: PROMO_CODES[normalized] };
};

export const removePromo = () => {
  promoCode = null;
  persist({ reason: "promo" });
};

/**
 * Calcula todos os valores do carrinho.
 * Os portes gratuitos são decididos pelo subtotal antes de descontos.
 */
export const getTotals = ({ shippingId = "ctt" } = {}) => {
  const subtotal = cart.reduce((sum, line) => {
    const details = getCartItemDetails(line);
    return sum + (details ? details.lineTotal : 0);
  }, 0);
  const count = getCartCount();
  const subscriptionSaving = cart.reduce((sum, line) => {
    const details = getCartItemDetails(line);
    if (!details || !line.subscription) return sum;
    return sum + Math.round((details.regularPrice - details.unitPrice) * line.qty * 100) / 100;
  }, 0);

  let discount = 0;
  let appliedPromo = null;
  const promoDetails = getPromoDetails();
  if (promoDetails?.eligible) {
    appliedPromo = promoDetails.promo;
    discount =
      appliedPromo.type === "percent"
        ? Math.round(subtotal * (appliedPromo.value / 100) * 100) / 100
        : Math.min(appliedPromo.value, subtotal);
  }

  const shippingOption = SHIPPING_OPTIONS[shippingId] || SHIPPING_OPTIONS.ctt;
  let shipping = count === 0 ? 0 : shippingOption.price;
  const freeShipping =
    count > 0 && shippingOption.freeOverThreshold && subtotal >= FREE_SHIPPING_THRESHOLD;
  if (freeShipping) shipping = 0;

  const total = Math.max(0, Math.round((subtotal - discount + shipping) * 100) / 100);
  const freeShippingRemaining = Math.max(
    0,
    Math.round((FREE_SHIPPING_THRESHOLD - subtotal) * 100) / 100
  );

  return {
    count,
    subtotal,
    discount,
    appliedPromo,
    shipping,
    shippingOption,
    freeShipping,
    freeShippingRemaining,
    freeShippingProgress: Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100),
    subscriptionSaving,
    total,
  };
};

export const addItem = ({
  productId,
  formatId,
  grindId = "",
  subscription = false,
  qty = 1,
  openDrawer = true,
}) => {
  const product = getProduct(productId);
  if (!product) return { ok: false, message: "Não encontrámos esse produto." };
  if (!isAvailable(product)) return { ok: false, message: "Este produto está esgotado." };
  const format = getFormat(product, formatId);
  if (!format) return { ok: false, message: "Escolhe um formato válido." };
  if (product.grinds && !grindId) grindId = product.grinds[0].id;
  if (product.grinds && !product.grinds.some((grind) => grind.id === grindId)) {
    return { ok: false, message: "Escolhe uma moagem válida." };
  }
  const sub = Boolean(subscription && product.subscription);
  const id = makeLineId({ productId, formatId: format.id, grindId, subscription: sub });
  const quantity = Math.max(1, Number(qty) || 1);
  const existing = cart.find((line) => line.id === id);
  if (existing) {
    existing.qty = Math.min(existing.qty + quantity, MAX_QTY_PER_LINE);
  } else {
    cart.push({
      id,
      productId,
      formatId: format.id,
      grindId: product.grinds ? grindId : "",
      subscription: sub,
      qty: Math.min(quantity, MAX_QTY_PER_LINE),
      addedAt: new Date().toISOString(),
    });
  }
  persist({ reason: "add", line: { ...id, productId } });
  const addedLine = cart.find((line) => line.id === id);
  document.dispatchEvent(
    new CustomEvent("cart:added", {
      detail: {
        product,
        line: { ...addedLine },
        quantity,
        openDrawer,
      },
    })
  );
  return { ok: true, product, line: { ...addedLine } };
};

export const updateQty = (lineId, qty) => {
  const line = cart.find((item) => item.id === lineId);
  if (!line) return;
  const next = Math.max(0, Math.min(Number(qty) || 0, MAX_QTY_PER_LINE));
  if (next === 0) {
    cart = cart.filter((item) => item.id !== lineId);
  } else {
    line.qty = next;
  }
  persist({ reason: "qty" });
};

export const removeItem = (lineId) => {
  const removed = cart.find((line) => line.id === lineId);
  cart = cart.filter((line) => line.id !== lineId);
  persist({ reason: "remove" });
  if (removed) {
    const product = getProduct(removed.productId);
    document.dispatchEvent(new CustomEvent("cart:removed", { detail: { product } }));
  }
};

export const clearCart = ({ keepPromo = false } = {}) => {
  cart = [];
  if (!keepPromo) promoCode = null;
  persist({ reason: "clear" });
};

export const getShippingOption = (id) => SHIPPING_OPTIONS[id] || SHIPPING_OPTIONS.ctt;

/* Linhas ------------------------------------------------------------------- */
export const cartLineMarkup = (line, { compact = false } = {}) => {
  const details = getCartItemDetails(line);
  if (!details) return "";
  const { product, format, grind, unitPrice, lineTotal } = details;
  const variant = [format.label, grind?.label, line.subscription ? "Subscrição mensal −10 %" : null]
    .filter(Boolean)
    .join(" · ");
  return `<article class="cart-line" data-line-id="${line.id}">
    <a class="cart-line__image" href="produto.html?id=${product.id}" tabindex="-1" aria-hidden="true">
      <img src="${product.images[0].src}" alt="" width="180" height="225" loading="lazy">
    </a>
    <div class="cart-line__body">
      <div class="cart-line__head">
        <div>
          <h3 class="cart-line__title"><a href="produto.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
          <p class="cart-line__variant"><span>${escapeHtml(format.label)}</span>${grind ? `<span>${escapeHtml(grind.label)}</span>` : ""}${line.subscription ? "<span>Subscrição −10 %</span>" : ""}</p>
        </div>
        <div class="cart-line__price">
          <strong>${formatPrice(lineTotal)}</strong>
          ${line.qty > 1 || line.subscription ? `<small>${formatPrice(unitPrice)} / un.</small>` : ""}
        </div>
      </div>
      ${line.subscription ? `<span class="cart-line__subscription">${icon("refresh")} ${formatPrice(details.saving)} poupados nesta entrega</span>` : ""}
      <div class="cart-line__actions">
        <div class="cart-line__qty" aria-label="Quantidade de ${escapeHtml(product.name)}">
          <button type="button" data-cart-decrement aria-label="Diminuir quantidade">−</button>
          <input type="text" inputmode="numeric" value="${line.qty}" data-cart-qty aria-label="Quantidade" readonly>
          <button type="button" data-cart-increment aria-label="Aumentar quantidade">+</button>
        </div>
        <button class="cart-line__remove" type="button" data-cart-remove>Remover</button>
      </div>
    </div>
    <div class="cart-line__total-mobile">
      <span>${compact ? "" : `${line.qty} × ${formatPrice(unitPrice)}`}</span>
      <strong>${formatPrice(lineTotal)}</strong>
    </div>
  </article>`;
};

const freeShippingMarkup = (totals, { compact = false } = {}) => {
  const remaining = totals.freeShippingRemaining;
  let suggestion = null;
  if (remaining > 0) {
    const candidates = PRODUCTS.filter(
      (product) =>
        product.stock > 0 &&
        ["acessorios", "capsulas"].includes(product.category) &&
        getStartingPrice(product) <= remaining + 15
    );
    suggestion = candidates.sort((a, b) => getStartingPrice(a) - getStartingPrice(b))[0] || null;
  }
  return `<div class="free-shipping">
    <div class="free-shipping__top">
      <strong>${totals.freeShipping ? "Portes grátis desbloqueados ✓" : `Faltam ${formatPrice(remaining)} para portes grátis`}</strong>
      <span>${totals.freeShipping ? "Boa escolha." : `Envio CTT por nossa conta a partir de ${FREE_SHIPPING_THRESHOLD} €.`}</span>
    </div>
    <div class="free-shipping__bar" role="progressbar" aria-valuemin="0" aria-valuemax="${FREE_SHIPPING_THRESHOLD}" aria-valuenow="${Math.min(totals.subtotal, FREE_SHIPPING_THRESHOLD).toFixed(2)}" aria-label="Progresso para portes grátis">
      <span style="width:${totals.freeShippingProgress}%"></span>
    </div>
    ${!compact && suggestion ? freeShippingUpsell(suggestion) : ""}
  </div>`;
};

const summaryLine = (label, value, className = "") =>
  `<div class="summary-line ${className}"><span>${label}</span><strong>${value}</strong></div>`;

const drawerEmptyMarkup = () => {
  const suggestions = getBestsellers(2);
  return `<div class="cart-drawer__empty">
    <span class="cart-empty__mark">${icon("bag", "", 28)}</span>
    <h3>O carrinho está à espera.</h3>
    <p>Começa pelo café que mais sai da torrefação ou explora os lotes desta semana.</p>
    <a class="btn" href="loja.html">Escolher café ${icon("arrowRight")}</a>
    <div class="cart-addons__grid" style="width:100%;margin-top:1.5rem;text-align:left;">
      ${suggestions
        .map(
          (product) =>
            `<div class="cart-addon">
              <img src="${product.images[0].src}" alt="" width="96" height="120" loading="lazy">
              <span class="cart-addon__copy"><strong>${escapeHtml(product.name)}</strong><span>${formatPrice(getStartingPrice(product))}</span></span>
              <button type="button" data-add-to-cart="${product.id}" data-format="${product.formats[0].id}" data-grind="grao" data-qty="1" aria-label="Adicionar ${escapeHtml(product.name)} ao carrinho">${icon("plus")}</button>
            </div>`
        )
        .join("")}
    </div>
  </div>`;
};

const drawerMarkup = () => {
  const totals = getTotals();
  if (!totals.count) {
    return { body: drawerEmptyMarkup(), foot: "" };
  }
  const body = `
    <div class="cart-drawer__progress">${freeShippingMarkup(totals, { compact: true })}</div>
    <div class="cart-lines">${cart.map((line) => cartLineMarkup(line, { compact: true })).join("")}</div>
  `;
  const foot = `
    <div class="cart-drawer__summary">
      ${summaryLine("Subtotal", formatPrice(totals.subtotal))}
      ${totals.discount > 0 ? summaryLine(`Desconto ${totals.appliedPromo?.code || ""}`, `−${formatPrice(totals.discount)}`, "summary-line--discount") : ""}
      ${summaryLine("Portes (CTT)", totals.freeShipping ? "Grátis" : formatPrice(totals.shipping), totals.freeShipping ? "summary-line--free" : "")}
      <div class="summary-total"><span>Total</span><strong>${formatPrice(totals.total)}</strong></div>
      <p class="summary-vat" style="text-align:left;">IVA incluído. Portes finais confirmados no checkout.</p>
    </div>
    <a class="btn" href="checkout.html">Finalizar compra ${icon("arrowRight")}</a>
    <a class="btn btn--text" href="carrinho.html" style="width:100%;justify-content:center;margin-top:.55rem;">Ver carrinho completo</a>
    <p class="cart-drawer__fine">Pagamento seguro · Devolução em 14 dias</p>
  `;
  return { body, foot };
};

/* Interface do painel lateral --------------------------------------------- */
let lastFocused = null;
let initialized = false;

const drawerEl = () => document.getElementById("cart-drawer");

const renderDrawer = () => {
  const drawer = drawerEl();
  if (!drawer) return;
  const body = drawer.querySelector("[data-drawer-body]");
  const foot = drawer.querySelector("[data-drawer-foot]");
  const drawerCount = drawer.querySelector("[data-drawer-count]");
  const totals = getTotals();
  const content = drawerMarkup();
  if (body) body.innerHTML = content.body;
  if (foot) foot.innerHTML = content.foot;
  if (drawerCount) drawerCount.textContent = totals.count ? `${totals.count} ${totals.count === 1 ? "artigo" : "artigos"}` : "";
};

export const openCartDrawer = () => {
  const drawer = drawerEl();
  if (!drawer) return;
  lastFocused = document.activeElement;
  renderDrawer();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.querySelectorAll("[data-open-cart]").forEach((button) => button.setAttribute("aria-expanded", "true"));
  requestAnimationFrame(() => drawer.querySelector("[data-close-cart]")?.focus());
};

export const closeCartDrawer = () => {
  const drawer = drawerEl();
  if (!drawer || !drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  document.querySelectorAll("[data-open-cart]").forEach((button) => button.setAttribute("aria-expanded", "false"));
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
};

const trapFocus = (event, container) => {
  if (event.key !== "Tab") return;
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const handleDrawerClick = (event) => {
  const lineEl = event.target.closest("[data-line-id]");
  if (!lineEl) return;
  const lineId = lineEl.dataset.lineId;
  const line = cart.find((item) => item.id === lineId);
  if (!line) return;
  if (event.target.closest("[data-cart-increment]")) {
    updateQty(lineId, line.qty + 1);
  } else if (event.target.closest("[data-cart-decrement]")) {
    updateQty(lineId, line.qty - 1);
  } else if (event.target.closest("[data-cart-remove]")) {
    removeItem(lineId);
  }
};

export const initCartUI = () => {
  if (initialized) return;
  initialized = true;
  renderDrawer();

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open-cart]");
    if (openButton) {
      event.preventDefault();
      openCartDrawer();
      return;
    }
    if (event.target.closest("[data-close-cart]")) {
      event.preventDefault();
      closeCartDrawer();
      return;
    }
    const drawer = drawerEl();
    if (drawer && drawer.contains(event.target)) handleDrawerClick(event);
  });

  document.addEventListener("keydown", (event) => {
    const drawer = drawerEl();
    if (!drawer?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeCartDrawer();
    } else {
      trapFocus(event, drawer);
    }
  });

  document.addEventListener("cart:changed", () => {
    renderDrawer();
    const totals = getTotals();
    document.querySelectorAll("[data-cart-count]").forEach((count) => {
      count.textContent = totals.count;
      count.classList.toggle("is-empty", totals.count === 0);
    });
  });

  document.addEventListener("cart:added", (event) => {
    if (!event.detail?.closeDrawer) {
      // A abertura do painel é orquestrada em main.js para ter também toast.
    }
  });
};

export { freeShippingMarkup, summaryLine, drawerMarkup, isLowStock, upsellItem };
