/**
 * Torra Lusa — arranque do site
 * -------------------------------------------------
 * Injeta a navegação e o rodapé partilhados, liga pesquisa, menu mobile,
 * adição rápida, carrinho, newsletter, consentimento e formulários comuns.
 * No fim, carrega o módulo específico da página através de data-page.
 */

import { formatPrice, SITE } from "./data.js";
import {
  headerMarkup,
  footerMarkup,
  cartDrawerMarkup,
  floatingMarkup,
  icon,
  observeReveals,
  safe,
} from "./components.js";
import {
  GRINDS,
  getFormat,
  getProduct,
  getStartingPrice,
  isAvailable,
  searchProducts,
} from "./products.js";
import {
  addItem,
  getTotals,
  initCartUI,
  openCartDrawer,
} from "./cart.js";
import { getConsent, setConsent, track } from "./analytics.js";

const page = document.body?.dataset.page || "";
const NEWSLETTER_KEY = "torraLusaNewsletter:v1";

let lastFocusedElement = null;
let quickAddProductId = null;

/* Utilitários -------------------------------------------------------------- */
const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const trapFocus = (event, container) => {
  if (event.key !== "Tab" || !container) return;
  const focusable = [...container.querySelectorAll(focusableSelector)].filter(
    (element) => element.offsetParent !== null || element === document.activeElement
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

const restoreFocus = () => {
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus({ preventScroll: true });
  }
  lastFocusedElement = null;
};

const isMenuOpen = () => qs("#mobile-nav")?.classList.contains("is-open");
const isSearchOpen = () => qs("#search-overlay")?.getAttribute("aria-hidden") === "false";
const isQuickAddOpen = () =>
  qs("#quick-add-dialog")?.getAttribute("aria-hidden") === "false";

const syncPageScroll = () => {
  const shouldLock =
    isMenuOpen() ||
    isSearchOpen() ||
    isQuickAddOpen() ||
    Boolean(qs("#cart-drawer")?.classList.contains("is-open"));
  document.body.classList.toggle("no-scroll", shouldLock);
};

const toast = (message, { product = null, link = null } = {}) => {
  let region = qs("#toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }
  const element = document.createElement("div");
  element.className = "toast";
  element.innerHTML = `
    ${
      product
        ? `<img src="${product.images[0].src}" alt="" width="38" height="48">`
        : `<span class="toast__icon">${icon("check")}</span>`
    }
    <span>${safe(message)}</span>
    ${link ? `<a href="${link.href}">${safe(link.label)}</a>` : ""}
  `;
  region.append(element);
  window.setTimeout(() => {
    element.classList.add("is-leaving");
    window.setTimeout(() => element.remove(), 280);
  }, 4200);
};

/* Estrutura partilhada ------------------------------------------------------ */
const mountChrome = () => {
  const headerSlot = qs("[data-site-header]");
  if (headerSlot) headerSlot.innerHTML = headerMarkup(page);

  const footerSlot = qs("[data-site-footer]");
  if (footerSlot) footerSlot.innerHTML = footerMarkup();

  const cartSlot = qs("[data-site-cart]");
  if (cartSlot) cartSlot.innerHTML = cartDrawerMarkup();

  const floatingSlot = qs("[data-site-floating]");
  if (floatingSlot) floatingSlot.innerHTML = floatingMarkup();

  // Estado atual no menu mobile, que é mais simples do que a navegação principal.
  const path = window.location.pathname.split("/").pop() || "index.html";
  qsa("#mobile-nav a[href]").forEach((link) => {
    const hrefPath = link.getAttribute("href").split("?")[0].split("#")[0];
    if (hrefPath === path && !link.getAttribute("href").includes("?")) {
      link.setAttribute("aria-current", "page");
    }
  });
};

/* Menu mobile --------------------------------------------------------------- */
const initMobileMenu = () => {
  const menu = qs("#mobile-nav");
  if (!menu) return;
  const openButtons = qsa("[data-open-menu]");
  const closeButtons = qsa("[data-close-menu]", menu);

  const openMenu = (trigger) => {
    lastFocusedElement = trigger || document.activeElement;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    openButtons.forEach((button) => button.setAttribute("aria-expanded", "true"));
    syncPageScroll();
    window.requestAnimationFrame(() => qs(".mobile-nav__top .icon-btn", menu)?.focus());
  };

  const closeMenu = () => {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    openButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
    syncPageScroll();
    if (lastFocusedElement) restoreFocus();
  };

  openButtons.forEach((button) =>
    button.addEventListener("click", () => openMenu(button))
  );
  closeButtons.forEach((button) => button.addEventListener("click", closeMenu));

  qsa("[data-open-search]", menu).forEach((button) => {
    button.addEventListener("click", () => {
      closeMenu();
      window.setTimeout(() => openSearch(button), 30);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    } else {
      trapFocus(event, menu.querySelector(".mobile-nav__panel"));
    }
  });
};

/* Pesquisa ------------------------------------------------------------------ */
let closeSearch = () => {};
let openSearch = () => {};

const initSearch = () => {
  const overlay = qs("#search-overlay");
  if (!overlay) return;
  const input = qs("#site-search-input", overlay);
  const results = qs("#live-search-results", overlay);
  const triggers = qsa("[data-open-search]");

  const renderResults = () => {
    if (!results) return;
    const query = input.value.trim();
    if (query.length < 2) {
      results.innerHTML = "";
      return;
    }
    const matches = searchProducts(query).slice(0, 4);
    if (!matches.length) {
      results.innerHTML = `<p class="text-small" style="grid-column:1/-1;color:var(--ink-soft)">Não encontrámos resultados para “${safe(query)}”. Experimenta uma origem, um sabor ou “acessórios”.</p>`;
      return;
    }
    results.innerHTML = matches
      .map(
        (product) => `
        <a class="search-result" href="produto.html?id=${product.id}">
          <img src="${product.images[0].src}" alt="" width="55" height="68" loading="lazy">
          <span>
            <strong>${safe(product.name)}</strong>
            <small>${safe(product.origin || "Torra Lusa")} · ${formatPrice(getStartingPrice(product))}</small>
          </span>
        </a>`
      )
      .join("");
  };

  openSearch = (trigger) => {
    lastFocusedElement = trigger || document.activeElement;
    overlay.setAttribute("aria-hidden", "false");
    triggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
    syncPageScroll();
    track("search_open");
    window.requestAnimationFrame(() => {
      input?.focus();
      input?.select();
    });
  };

  closeSearch = () => {
    if (overlay.getAttribute("aria-hidden") === "true") return;
    overlay.setAttribute("aria-hidden", "true");
    triggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (results) results.innerHTML = "";
    syncPageScroll();
    restoreFocus();
  };

  triggers.forEach((button) =>
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openSearch(button);
    })
  );

  qsa("[data-close-search]", overlay).forEach((button) =>
    button.addEventListener("click", closeSearch)
  );

  input?.addEventListener("input", renderResults);

  qs(".search-form", overlay)?.addEventListener("submit", () => {
    track("search_submit", { query: input?.value.trim() || "" });
    closeSearch();
  });

  overlay.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeSearch();
  });

  document.addEventListener("keydown", (event) => {
    if (overlay.getAttribute("aria-hidden") !== "true") {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      } else {
        trapFocus(event, qs(".search-panel", overlay));
      }
    }
  });
};

/* Adição rápida ------------------------------------------------------------- */
const quickAddMarkup = (product) => {
  const formats = product.formats;
  const grinds = product.grinds;
  const firstFormat = formats[0];
  const saving = product.formats.length > 1 ? product.formats[product.formats.length - 1] : null;
  return `
    <div class="quick-add-dialog__backdrop" data-close-quick-add></div>
    <div class="quick-add-modal" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
      <div class="quick-add-modal__head">
        <div class="quick-add-modal__product">
          <img src="${product.images[0].src}" alt="" width="58" height="72">
          <div class="quick-add-modal__product-copy">
            <span>Adicionar depressa</span>
            <h2 id="quick-add-title">${safe(product.name)}</h2>
          </div>
        </div>
        <button class="icon-btn" type="button" data-close-quick-add aria-label="Fechar adição rápida">${icon("close")}</button>
      </div>
      <form data-quick-add-form novalidate>
        <div class="variant-group">
          <div class="variant-group__head">
            <span class="variant-group__label">Formato</span>
            <span class="variant-group__selected" data-quick-format-label>${safe(firstFormat.label)}</span>
          </div>
          <div class="format-options ${formats.length === 2 ? "format-options--2" : ""}" role="radiogroup" aria-label="Formato">
            ${formats
              .map(
                (format, index) => `
                <label class="option">
                  <input type="radio" name="quick-format" value="${format.id}" ${index === 0 ? "checked" : ""}>
                  <span class="option__box">
                    <span class="option__title">${safe(format.label)}</span>
                    <span class="option__meta">${formatPrice(format.price)}</span>
                    ${saving && format.id === saving.id ? `<span class="option__tag">melhor valor</span>` : ""}
                  </span>
                </label>`
              )
              .join("")}
          </div>
        </div>
        ${
          grinds
            ? `<div class="variant-group">
                <div class="variant-group__head">
                  <span class="variant-group__label">Moagem</span>
                  <span class="variant-group__selected" data-quick-grind-label>${safe(grinds[0].label)}</span>
                </div>
                <div class="grind-options" role="radiogroup" aria-label="Moagem">
                  ${grinds
                    .map(
                      (grind, index) => `
                      <label class="option">
                        <input type="radio" name="quick-grind" value="${grind.id}" ${index === 0 ? "checked" : ""}>
                        <span class="option__box"><span class="option__title">${safe(grind.short || grind.label)}</span></span>
                      </label>`
                    )
                    .join("")}
                </div>
              </div>`
            : ""
        }
        <div class="product-qty-row">
          <div class="qty-stepper" aria-label="Quantidade">
            <button type="button" data-quick-step="-1" aria-label="Diminuir quantidade">${icon("minus")}</button>
            <input type="text" inputmode="numeric" value="1" data-quick-qty aria-label="Quantidade">
            <button type="button" data-quick-step="1" aria-label="Aumentar quantidade">${icon("plus")}</button>
          </div>
          <button class="btn" type="submit">${icon("bag")} Adicionar ao carrinho</button>
        </div>
        <div class="quick-add-modal__price">
          <span>Preço total</span>
          <span class="price" data-quick-price>${formatPrice(firstFormat.price)}</span>
        </div>
        <p class="quick-add-modal__trust">${icon("truck")} Portes grátis a partir de ${SITE.freeShippingThreshold} € · Devolução em 14 dias</p>
      </form>
    </div>
  `;
};

const initQuickAdd = () => {
  const dialog = qs("#quick-add-dialog");
  if (!dialog) return;
  const closeButtons = [];

  const updatePrice = () => {
    const product = getProduct(quickAddProductId);
    if (!product) return;
    const checked = qs('input[name="quick-format"]:checked', dialog);
    const format = getFormat(product, checked?.value || product.formats[0].id);
    const quantity = Number(qs("[data-quick-qty]", dialog)?.value) || 1;
    const price = qs("[data-quick-price]", dialog);
    if (price) price.textContent = formatPrice(format.price * quantity);
    const formatLabel = qs("[data-quick-format-label]", dialog);
    if (formatLabel) formatLabel.textContent = format.label;
  };

  const open = (productId, trigger) => {
    const product = getProduct(productId);
    if (!product) return;
    if (!isAvailable(product)) {
      toast("Este produto está esgotado. Podes avisar-nos se quiseres saber quando volta.");
      return;
    }
    lastFocusedElement = trigger || document.activeElement;
    quickAddProductId = product.id;
    dialog.innerHTML = quickAddMarkup(product);
    dialog.setAttribute("aria-hidden", "false");
    syncPageScroll();
    track("quick_add_open", { product: product.id });
    window.requestAnimationFrame(() => {
      qs("[data-close-quick-add]", dialog)?.focus();
    });
    qsa("[data-quick-step]", dialog).forEach((button) => {
      button.addEventListener("click", () => {
        const input = qs("[data-quick-qty]", dialog);
        if (!input) return;
        input.value = Math.max(
          1,
          Math.min(20, (Number(input.value) || 1) + Number(button.dataset.quickStep))
        );
        updatePrice();
      });
    });
    qsa('input[name="quick-format"]', dialog).forEach((input) =>
      input.addEventListener("change", updatePrice)
    );
    qsa('input[name="quick-grind"]', dialog).forEach((input) =>
      input.addEventListener("change", () => {
        const label = qs("[data-quick-grind-label]", dialog);
        if (label) label.textContent = GRINDS[input.value]?.label || "";
      })
    );
    qs("[data-quick-qty]", dialog)?.addEventListener("input", (event) => {
      event.target.value = event.target.value.replace(/[^0-9]/g, "");
    });
    qsa("[data-close-quick-add]", dialog).forEach((button) =>
      button.addEventListener("click", close)
    );
    qs("[data-quick-add-form]", dialog)?.addEventListener("submit", (event) => {
      event.preventDefault();
      handleQuickSubmit();
    });
    closeButtons.length = 0;
    closeButtons.push(...qsa("[data-close-quick-add]", dialog));
  };

  const close = () => {
    if (!dialog || dialog.getAttribute("aria-hidden") === "true") return;
    dialog.setAttribute("aria-hidden", "true");
    dialog.innerHTML = "";
    quickAddProductId = null;
    syncPageScroll();
    restoreFocus();
  };

  const handleQuickSubmit = () => {
    const product = getProduct(quickAddProductId);
    if (!product) return;
    const formatId = qs('input[name="quick-format"]:checked', dialog)?.value;
    const grindId = qs('input[name="quick-grind"]:checked', dialog)?.value || "grao";
    const qty = Number(qs("[data-quick-qty]", dialog)?.value) || 1;
    const result = addItem({
      productId: product.id,
      formatId,
      grindId: product.grinds ? grindId : "",
      qty,
      openDrawer: true,
    });
    if (!result.ok) {
      toast(result.message || "Não foi possível adicionar este produto.");
      return;
    }
    close();
  };

  closeButtons.length = 0;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-quick-add]");
    if (trigger) {
      event.preventDefault();
      open(trigger.dataset.quickAdd, trigger);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!dialog || dialog.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else {
      trapFocus(event, qs(".quick-add-modal", dialog));
    }
  });
};

/* Adições diretas ao carrinho ---------------------------------------------- */
const initDirectAdd = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) return;
    event.preventDefault();
    if (button.disabled) return;
    const productId = button.dataset.addToCart;
    const result = addItem({
      productId,
      formatId: button.dataset.format,
      grindId: button.dataset.grind || "",
      qty: Number(button.dataset.qty) || 1,
      subscription: button.dataset.subscription === "true",
      openDrawer: true,
    });
    if (!result.ok) {
      toast(result.message || "Não foi possível adicionar este produto.");
    }
  });
};

/* Newsletter ---------------------------------------------------------------- */
const initNewsletter = () => {
  qsa("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = qs('input[type="email"]', form);
      const message = qs("[data-newsletter-message]", form);
      const email = input?.value.trim() || "";
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!valid) {
        if (message) {
          message.textContent = "Escreve um email válido, por favor.";
          message.className = "form-message form-message--error is-visible";
        }
        input?.setAttribute("aria-invalid", "true");
        input?.focus();
        return;
      }
      try {
        const stored = JSON.parse(window.localStorage.getItem(NEWSLETTER_KEY) || "[]");
        const list = Array.isArray(stored) ? stored : [];
        if (!list.includes(email.toLowerCase())) list.push(email.toLowerCase());
        window.localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
      } catch {
        // A subscrição simulada não precisa de storage para confirmar na sessão.
      }
      if (message) {
        message.textContent = "Estás na lista. Usa BEMVINDO10 no checkout para 10 % na primeira compra.";
        message.className = "form-message form-message--success is-visible";
      }
      input?.removeAttribute("aria-invalid");
      form.reset();
      track("newsletter_signup", { source: form.dataset.source || "site" });
      toast("Subscrição registada. Código BEMVINDO10 para 10 % na primeira compra.");
    });
  });
};

/* Cookies ------------------------------------------------------------------- */
const initCookies = () => {
  const banner = qs("#cookie-banner");
  if (!banner) return;
  const consent = getConsent();
  if (!consent) {
    window.setTimeout(() => {
      banner.hidden = false;
    }, 1400);
  }
  qsa("[data-cookie]", banner).forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.cookie;
      setConsent(choice === "all" ? "all" : "essential");
      banner.hidden = true;
      toast(
        choice === "all"
          ? "Obrigado. A medição anónima está ativa."
          : "Apenas o essencial. O carrinho continua a funcionar."
      );
    });
  });

  qsa("[data-cookie-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        window.localStorage.removeItem("torraLusaConsent:v1");
        window.localStorage.removeItem("torraLusaAnalytics:v1");
      } catch {
        // Sem armazenamento, a escolha volta a ser pedida nesta sessão.
      }
      banner.hidden = false;
      banner.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      toast("Preferências repostas. Escolhe novamente o que queres permitir.");
    });
  });

  qsa("[data-clear-local-data]").forEach((button) => {
    button.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Apagar o carrinho, a newsletter, as mensagens e as preferências guardadas neste navegador? Esta ação não pode ser desfeita."
      );
      if (!confirmed) return;
      try {
        [
          "torraLusaCart:v1",
          "torraLusaPromo:v1",
          "torraLusaConsent:v1",
          "torraLusaAnalytics:v1",
          "torraLusaNewsletter:v1",
          "torraLusaMessages:v1",
          "torraLusaOrder:v1",
        ].forEach((key) => window.localStorage.removeItem(key));
        window.sessionStorage.removeItem("torraLusaOrder:v1");
      } catch {
        // Sem armazenamento não há dados a apagar.
      }
      window.location.reload();
    });
  });
};

/* Formulário de contacto (quando existe na página) ------------------------- */
const initDemoForms = () => {
  qsa("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = qs("[data-form-message]", form);
      const required = qsa("[required]", form);
      let valid = true;
      required.forEach((field) => {
        if (!field.value.trim() || (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value))) {
          valid = false;
          field.closest(".field")?.classList.add("has-error");
          const error = field.closest(".field")?.querySelector(".field__error");
          if (error) error.textContent = "Preenche este campo corretamente.";
        } else {
          field.closest(".field")?.classList.remove("has-error");
        }
      });
      if (!valid) {
        if (message) {
          message.textContent = "Faltou preencher um ou mais campos.";
          message.className = "form-message form-message--error is-visible";
        }
        return;
      }
      const subject = form.dataset.demoForm || "mensagem";
      if (message) {
        message.textContent =
          "Mensagem registada. Esta é uma demonstração: numa loja real seguiria para a equipa e responderíamos em 1 dia útil.";
        message.className = "form-message form-message--success is-visible";
      }
      form.reset();
      track("form_submit", { form: subject });
    });
  });
};

/* Acordeões ---------------------------------------------------------------- */
const initAccordions = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".accordion__button");
    if (!button) return;
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    panel.setAttribute("aria-hidden", String(expanded));
  });
};

/* Newsletter prompt flutuante (desktop, após alguma navegação) ------------ */
const initNewsPrompt = () => {
  if (window.matchMedia("(max-width: 860px)").matches) return;
  const prompt = document.createElement("aside");
  prompt.className = "news-prompt";
  prompt.setAttribute("aria-label", "Subscrever a carta da torra");
  prompt.hidden = true;
  prompt.innerHTML = `
    <button class="news-prompt__close" type="button" aria-label="Fechar">${icon("close")}</button>
    <span class="eyebrow">A carta da torra</span>
    <h2>Um bom café também se lê.</h2>
    <p>Novos lotes e 10 % na primeira compra. Uma mensagem por mês, sem ruído.</p>
    <a class="btn btn--sm" href="index.html#newsletter">Quero receber</a>
  `;
  document.body.append(prompt);

  const dismissed = sessionStorage.getItem("torraLusaNewsPrompt");
  if (!dismissed) {
    const show = () => {
      if (window.scrollY > 1200) {
        prompt.hidden = false;
        window.removeEventListener("scroll", show);
      }
    };
    window.addEventListener("scroll", show, { passive: true });
  }
  qs(".news-prompt__close", prompt)?.addEventListener("click", () => {
    prompt.hidden = true;
    try {
      sessionStorage.setItem("torraLusaNewsPrompt", "1");
    } catch {
      // sem persistência, fecha apenas nesta visita
    }
  });
};

/* Estado comum da interface ------------------------------------------------ */
const initChrome = () => {
  initMobileMenu();
  initSearch();
  initQuickAdd();
  initDirectAdd();
  initNewsletter();
  initCookies();
  initDemoForms();
  initAccordions();
  initNewsPrompt();

  const header = qs(".site-header");
  const backToTop = qs("[data-back-to-top]");
  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
    backToTop?.classList.toggle("is-visible", window.scrollY > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href");
      if (id && id !== "#" && qs(id)) {
        // O scroll-padding global trata do cabeçalho fixo.
      }
    });
  });

  document.addEventListener("cart:added", (event) => {
    const { product, quantity, openDrawer } = event.detail || {};
    if (product) {
      toast(`${quantity > 1 ? `${quantity} × ` : ""}${product.name} no carrinho.`, {
        product,
        link: { href: "carrinho.html", label: "Ver carrinho" },
      });
      track("add_to_cart", { product: product.id, quantity });
    }
    if (openDrawer !== false) {
      window.setTimeout(() => openCartDrawer(), 120);
    }
  });

  document.addEventListener("cart:changed", () => {
    window.requestAnimationFrame(syncPageScroll);
  });

  // Sincroniza o contador visível no primeiro carregamento.
  const totals = getTotals();
  qsa("[data-cart-count]").forEach((count) => {
    count.textContent = totals.count;
    count.classList.toggle("is-empty", totals.count === 0);
  });
};

/* Página específica --------------------------------------------------------- */
const PAGE_MODULES = {
  home: "./home.js",
  loja: "./shop.js",
  produto: "./product.js",
  carrinho: "./cart-page.js",
  checkout: "./checkout.js",
  confirmacao: "./confirmation.js",
  contactos: "./contact.js",
};

const start = async () => {
  mountChrome();
  initCartUI();
  initChrome();
  track("page_view", { page });

  const modulePath = PAGE_MODULES[page];
  if (modulePath) {
    try {
      const module = await import(new URL(modulePath, import.meta.url));
      if (typeof module.init === "function") await module.init();
    } catch (error) {
      console.error(`[Torra Lusa] Falha ao iniciar a página "${page}":`, error);
    }
  }

  observeReveals(document);

  // Pequeno atraso para os módulos que renderizam conteúdos dinâmicos.
  window.setTimeout(() => observeReveals(document), 120);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}

export { toast, qs, qsa, focusableSelector, trapFocus };
