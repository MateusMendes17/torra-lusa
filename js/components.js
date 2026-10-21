/**
 * Torra Lusa — componentes partilhados
 * -------------------------------------------------
 * Templates de interface usados por todas as páginas: cabeçalho,
 * rodapé, ícones, carimbos, cartões de produto e elementos flutuantes.
 * Os módulos de página importam apenas o que precisam.
 */

import { SITE, WHATSAPP_URL, formatPrice } from "./data.js";
import {
  CATEGORIES,
  getStartingPrice,
  isAvailable,
  isLowStock,
  getProduct,
} from "./products.js";

/* Ícones ------------------------------------------------------------------ */
const ICON_PATHS = {
  arrowRight: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5"/><path d="m11 6-6 6 6 6"/>',
  arrowUp: '<path d="M12 20V5"/><path d="m6 11 6-6 6 6"/>',
  arrowUpRight: '<path d="M6 18 18 6"/><path d="M8 6h10v10"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  menu: '<path d="M3.5 7h17"/><path d="M3.5 12h17"/><path d="M3.5 17h17"/>',
  close: '<path d="m5 5 14 14"/><path d="M19 5 5 19"/>',
  bag: '<path d="M5.5 8.5h13l-1 11h-11l-1-11Z"/><path d="M9 8.5V6a3 3 0 0 1 6 0v2.5"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  truck: '<path d="M3 6h11v11H3z"/><path d="M14 9.5h3.4l3.1 3.2v4.3H14z"/><circle cx="7" cy="18.5" r="1.6"/><circle cx="17.5" cy="18.5" r="1.6"/>',
  leaf: '<path d="M20 4c-8 0-14 3.5-14 10a5 5 0 0 0 5 5c6.5 0 9-6 9-15Z"/><path d="M4 21c2.8-5.5 6.5-9 12-12"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.7-4L3 10"/><path d="M3 4v6h6"/><path d="M4 13a8 8 0 0 0 14.7 4L21 14"/><path d="M21 20v-6h-6"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.7 12 2.2 2.2 4.5-4.6"/>',
  lock: '<rect x="4.5" y="10" width="15" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9.5h18"/><path d="M7 15h3"/>',
  pin: '<path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.3l3.2 2"/>',
  phone: '<path d="M7.3 3.8 4.8 5.5c-1.7 1.2.2 6.5 3.9 10.2 3.7 3.7 9 5.6 10.2 3.9l1.7-2.5-4.3-3-2 2a18 18 0 0 1-3.4-3.4l2-2-3-4.3Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4"/><path d="M16.5 3v4"/><path d="M3.5 9.5h17"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  filter: '<path d="M4 7h16"/><path d="M7 12h10"/><path d="M10 17h4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  play: '<path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  share: '<circle cx="18" cy="5" r="2.3"/><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="19" r="2.3"/><path d="m8 11 8-5"/><path d="m8 13 8 5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  star: '<path d="m12 3 2.7 5.9 6.3.7-4.7 4.4 1.3 6.2L12 17l-5.6 3.2L7.7 14 3 9.6l6.3-.7L12 3Z"/>',
  bean: '<ellipse cx="12" cy="12" rx="6.8" ry="9.2" transform="rotate(38 12 12)"/><path d="M7.2 6.7c3.9 2.2 5.7 7.7 9.6 10.6"/>',
  cup: '<path d="M4 8h13v6.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9.5h1.6a2.8 2.8 0 0 1 0 5.6H17"/><path d="M7 4.5c-.6.8-.6 1.7 0 2.5"/><path d="M11 3.5c-.7 1-.7 2 0 3"/>',
  grinder: '<path d="M9 3.5h6v4H9z"/><path d="M8 7.5h8l1.5 7.5h-11L8 7.5Z"/><path d="M10 15h4v3h-4z"/><path d="M7 21h10"/>',
  filterCone: '<path d="M4 4h16l-6.5 8v6l-3 2v-8L4 4Z"/>',
  press: '<path d="M6 3h12"/><path d="M8.5 3v4h7V3"/><path d="M8.5 7h7v3h-7z"/><path d="M7 10h10v10H7z"/><path d="M10 13h4"/>',
  mug: '<path d="M5 7h11v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7Z"/><path d="M16 9h1.7a3 3 0 0 1 0 6H16"/><path d="M8 3.5c-.5.6-.5 1.2 0 1.8"/><path d="M12 3c-.5.6-.5 1.2 0 1.8"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M2.5 5.5h19V9h-19z"/><path d="M12 5.5V20"/><path d="M12 5.5C10.5 2 6 2.5 6.5 5.5H12Z"/><path d="M12 5.5C13.5 2 18 2.5 17.5 5.5H12Z"/>',
  whatsapp: '<path d="M20.7 11.7a8.7 8.7 0 0 1-12.9 7.7L3 21l1.7-4.6a8.7 8.7 0 1 1 16-4.7Z"/><path d="M8.3 7.7c.3-.6.6-.6.8-.6h.6c.2 0 .4.1.6.4l.8 2c.1.2 0 .4-.1.5l-.7.8c-.1.2-.2.3 0 .6a9.3 9.3 0 0 0 3.1 2.6c.3.2.5.1.6 0l1-1.2c.2-.2.4-.2.6-.1l2 1c.3.1.4.2.4.4 0 .2 0 .9-.3 1.4-.3.6-1.4 1.1-2 1.1-.5 0-1 .2-2.9-.6a11 11 0 0 1-4.7-4.1c-.3-.5-.9-1.4-.9-2.6 0-1.3.7-1.9 1.1-1.8Z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.4 6.6h.01"/>',
  spark: '<path d="M12 2.5c.5 5.4 3.1 8 8.5 8.5-5.4.5-8 3.1-8.5 8.5-.5-5.4-3.1-8-8.5-8.5 5.4-.5 8-3.1 8.5-8.5Z"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5"/><path d="M12 12v9"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',
  map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z"/><path d="M9 4v13.5M15 6.5V20"/>',
  giftTag: '<path d="M3 12 12 3l9 9-9 9-9-9Z"/><circle cx="12" cy="12" r="2"/>',
};

export const icon = (name, className = "", size = 20) => {
  const paths = ICON_PATHS[name] || ICON_PATHS.bean;
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
};

export const logoMark = () =>
  `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18.2" stroke="currentColor" stroke-width="1"/><ellipse cx="20" cy="20" rx="6.7" ry="11.2" transform="rotate(38 20 20)" stroke="currentColor" stroke-width="1.25"/><path d="M13.5 12.6c4.8 2.7 7.4 9.8 12.8 13.2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M27.8 8.5c1.5 1.2 2.7 2.7 3.5 4.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".55"/></svg>`;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const safe = escapeHtml;

/* Estrelas ----------------------------------------------------------------- */
export const stars = (rating = 0, count = null, { paper = false, showCount = true } = {}) => {
  const rounded = Math.round(Number(rating));
  const starMarkup = Array.from({ length: 5 }, (_, index) => {
    const filled = index < rounded;
    return `<svg viewBox="0 0 24 24" class="${filled ? "" : "is-empty"}" aria-hidden="true"><path d="m12 3 2.7 5.9 6.3.7-4.7 4.4 1.3 6.2L12 17l-5.6 3.2L7.7 14 3 9.6l6.3-.7L12 3Z" ${filled ? "" : 'fill="none" stroke="currentColor" stroke-width="1.3"'} /></svg>`;
  }).join("");
  const countMarkup = count !== null && showCount ? `<span>(${count})</span>` : "";
  return `<span class="rating ${paper ? "rating--paper" : ""}" aria-label="Avaliação ${Number(rating).toFixed(1).replace(".", ",")} de 5${count ? `, ${count} avaliações` : ""}"><span class="rating__stars" aria-hidden="true">${starMarkup}</span>${countMarkup}</span>`;
};

/* Sinete circular ---------------------------------------------------------- */
let stampCounter = 0;
export const stamp = ({
  top = "Torra desta semana",
  line1 = "LOTE",
  line2 = "042",
  bottom = "PORTO · 2026",
  className = "",
} = {}) => {
  stampCounter += 1;
  const id = `stamp-arc-${stampCounter}`;
  return `<div class="stamp ${className}" aria-hidden="true"><svg viewBox="0 0 120 120" fill="none"><defs><path id="${id}" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><circle cx="60" cy="60" r="57" stroke="currentColor" stroke-width="1"/><circle cx="60" cy="60" r="49" stroke="currentColor" stroke-width="1" stroke-dasharray="1 4" opacity=".6"/><text fill="currentColor" font-size="8.4" font-family="DM Sans, sans-serif" font-weight="600" letter-spacing="1.7"><textPath href="#${id}" startOffset="1%">${escapeHtml(top)} · ${escapeHtml(bottom)} ·</textPath></text><text x="60" y="56" text-anchor="middle" fill="currentColor" font-size="7" font-family="DM Sans, sans-serif" letter-spacing="1.5">${escapeHtml(line1)}</text><text x="60" y="75" text-anchor="middle" fill="currentColor" font-size="23" font-family="Fraunces, Georgia, serif" letter-spacing="-.5">${escapeHtml(line2)}</text></svg></div>`;
};

/* Cabeçalho --------------------------------------------------------------- */
const navItems = [
  { key: "loja", label: "Loja", href: "loja.html" },
  { key: "grao", label: "Café em grão", href: "loja.html?moagem=grao" },
  { key: "moido", label: "Moído", href: "loja.html?moagem=moagem" },
  { key: "capsulas", label: "Cápsulas", href: "loja.html?categoria=capsulas" },
  { key: "acessorios", label: "Acessórios", href: "loja.html?categoria=acessorios" },
  { key: "ofertas", label: "Ofertas", href: "loja.html?categoria=packs", extraClass: "main-nav__link--sale" },
  { key: "sobre", label: "Sobre", href: "sobre.html" },
];

const isCurrent = (key, page) => {
  if (key === "loja" && ["shop", "product", "cart", "checkout", "confirmation"].includes(page)) return true;
  if (key === "sobre" && page === "sobre") return true;
  return false;
};

export const headerMarkup = (page = "") => `
  <a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>
  <div class="announcement">
    <div class="container announcement__inner">
      <span>${icon("truck")} Portes grátis em compras a partir de ${SITE.freeShippingThreshold} €</span>
      <span>Torra semanal no Porto</span>
    </div>
  </div>
  <header class="site-header" id="topo">
    <div class="container site-header__inner">
      <button class="icon-btn mobile-menu-toggle" type="button" data-open-menu aria-label="Abrir menu" aria-controls="mobile-nav" aria-expanded="false">
        ${icon("menu")}
      </button>
      <a class="brand" href="index.html" aria-label="Torra Lusa — página inicial">
        <span class="brand__mark">${logoMark()}</span>
        <span class="brand__text"><span class="brand__name">Torra Lusa</span><span class="brand__sub">Torrefação · Porto · 2019</span></span>
      </a>
      <nav class="main-nav" aria-label="Navegação principal">
        <ul class="main-nav__list">
          ${navItems
            .map(
              (item) =>
                `<li><a class="main-nav__link ${item.extraClass || ""}" href="${item.href}" ${isCurrent(item.key, page) ? 'aria-current="page"' : ""}>${item.label}</a></li>`
            )
            .join("")}
        </ul>
      </nav>
      <div class="header-actions">
        <button class="icon-btn header-actions__search" type="button" data-open-search aria-label="Pesquisar no site" aria-controls="search-overlay" aria-expanded="false">
          ${icon("search")}
        </button>
        <button class="icon-btn" type="button" data-open-cart aria-label="Abrir carrinho" aria-controls="cart-drawer" aria-expanded="false">
          ${icon("bag")}
          <span class="cart-count is-empty" data-cart-count aria-live="polite">0</span>
        </button>
      </div>
    </div>
  </header>
  ${mobileNavMarkup()}
  ${searchOverlayMarkup()}
`;

const mobileNavMarkup = () => `
  <div class="mobile-nav" id="mobile-nav" aria-hidden="true">
    <div class="mobile-nav__backdrop" data-close-menu></div>
    <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Menu principal">
      <div class="mobile-nav__top">
        <a class="brand" href="index.html" aria-label="Torra Lusa — página inicial">
          <span class="brand__mark">${logoMark()}</span>
          <span class="brand__text"><span class="brand__name">Torra Lusa</span><span class="brand__sub">Torrefação · Porto · 2019</span></span>
        </a>
        <button class="icon-btn" type="button" data-close-menu aria-label="Fechar menu">${icon("close")}</button>
      </div>
      <nav aria-label="Menu mobile">
        <ul class="mobile-nav__links">
          <li><a href="loja.html">Loja</a></li>
          <li><a href="loja.html?moagem=grao">Café em grão</a></li>
          <li><a href="loja.html?moagem=moagem">Moído</a></li>
          <li><a href="loja.html?categoria=capsulas">Cápsulas</a></li>
          <li><a href="loja.html?categoria=acessorios">Acessórios</a></li>
          <li><a href="loja.html?categoria=packs">Ofertas</a></li>
          <li><a href="sobre.html">Sobre</a></li>
          <li><a href="contactos.html">Contactos</a></li>
        </ul>
      </nav>
      <button class="search-trigger-mobile btn btn--outline btn--wide" type="button" data-open-search>${icon("search")} Procurar café</button>
      <div class="mobile-nav__foot">
        <strong>Na torrefação</strong>
        <p>${SITE.address}<br>${SITE.postalCode} ${SITE.city}<br>${SITE.hours}</p>
        <p class="mt-2"><a href="tel:${SITE.phoneLink}">${SITE.phone}</a> · <a href="mailto:${SITE.email}">${SITE.email}</a></p>
        <div class="footer-brand__social mt-3">
          <a class="footer-social" href="${SITE.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram da Torra Lusa">${icon("instagram")}</a>
          <a class="footer-social" href="${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="WhatsApp da Torra Lusa">${icon("whatsapp")}</a>
        </div>
      </div>
    </div>
  </div>
`;

const searchOverlayMarkup = () => `
  <div class="search-overlay" id="search-overlay" aria-hidden="true">
    <div class="search-overlay__backdrop" data-close-search></div>
    <div class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div class="container">
        <div class="search-panel__head">
          <div>
            <span class="eyebrow eyebrow--plain">Encontra o teu café</span>
            <h2 id="search-title">O que te apetece hoje?</h2>
          </div>
          <button class="icon-btn" type="button" data-close-search aria-label="Fechar pesquisa">${icon("close")}</button>
        </div>
        <form class="search-form" action="loja.html" method="get" role="search">
          ${icon("search")}
          <label class="sr-only" for="site-search-input">Pesquisar produtos</label>
          <input id="site-search-input" name="q" type="search" placeholder="Origem, sabor, acessório…" autocomplete="off">
          <button class="btn btn--sm" type="submit">Ver resultados</button>
        </form>
        <div class="search-suggestions">
          <span class="search-suggestions__label">Sugestões</span>
          <a class="search-suggestion" href="loja.html?q=etiopia">Etiópia</a>
          <a class="search-suggestion" href="loja.html?q=chocolate">Chocolate</a>
          <a class="search-suggestion" href="loja.html?categoria=capsulas">Cápsulas</a>
          <a class="search-suggestion" href="loja.html?categoria=packs">Para oferecer</a>
          <a class="search-suggestion" href="loja.html?categoria=acessorios">Acessórios</a>
        </div>
        <div class="search-results" id="live-search-results" aria-live="polite"></div>
      </div>
    </div>
  </div>
`;

/* Cartões de produto ------------------------------------------------------- */
const flagClass = (label) => {
  if (/novo|edição/i.test(label)) return "product-flag--olive";
  if (/vendido/i.test(label)) return "product-flag--dark";
  return "";
};

export const productCard = (product, { index = 0, reveal = true } = {}) => {
  const available = isAvailable(product);
  const price = getStartingPrice(product);
  const labels = [...(product.labels || [])];
  const flags = [];
  if (!available) {
    flags.push({ text: "Esgotado", cls: "product-flag--out" });
  } else {
    if (isLowStock(product)) flags.push({ text: "Últimas unidades", cls: "product-flag--low" });
    labels.slice(0, 2).forEach((label) => flags.push({ text: label, cls: flagClass(label) }));
  }
  const origin = product.origin || CATEGORIES[product.category]?.short || "Torra Lusa";
  const addLabel = available ? "Adicionar" : "Esgotado";
  return `
    <article class="product-card ${!available ? "is-sold-out" : ""} ${reveal ? "reveal" : ""}" style="--reveal-delay:${Math.min(index * 70, 280)}ms" data-product-id="${product.id}">
      <div class="product-card__media">
        <a class="product-card__cover" href="produto.html?id=${product.id}" aria-label="Ver ${escapeHtml(product.name)}"></a>
        <span class="product-card__flags">
          ${flags.map((flag) => `<span class="product-flag ${flag.cls}">${escapeHtml(flag.text)}</span>`).join("")}
        </span>
        <img class="product-card__img product-card__img--primary" src="${product.images[0].src}" alt="${escapeHtml(product.images[0].alt)}" width="900" height="1125" loading="lazy" decoding="async">
        <img class="product-card__img product-card__img--secondary" src="${product.images[1].src}" alt="" width="900" height="1125" loading="lazy" decoding="async">
        ${
          available
            ? `<button class="product-card__quick" type="button" data-quick-add="${product.id}">${icon("plus")} Adicionar rápido</button>`
            : ""
        }
      </div>
      <div class="product-card__body">
        <div class="product-card__meta">
          <span class="product-card__origin">${escapeHtml(origin)}${product.region ? ` · ${escapeHtml(product.region)}` : ""}</span>
          ${stars(product.rating, product.reviewCount)}
        </div>
        <h3 class="product-card__title"><a href="produto.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
        <div class="product-card__notes">
          ${product.notes.slice(0, 3).map((note) => `<span class="note-label">${escapeHtml(note)}</span>`).join("")}
        </div>
        <div class="product-card__footer">
          <div>
            ${product.formats.length > 1 ? '<span class="price-from">Desde</span>' : ""}
            <span class="price">${formatPrice(price)}</span>
          </div>
          ${
            available
              ? `<button class="product-card__add-mobile" type="button" data-quick-add="${product.id}">${icon("plus")} Adicionar</button>`
              : `<span class="pill pill--outline">Esgotado</span>`
          }
        </div>
      </div>
    </article>`;
};

export const productMiniCard = (product, { className = "" } = {}) => `
  <a class="also-card ${className}" href="produto.html?id=${product.id}">
    <img src="${product.images[0].src}" alt="${escapeHtml(product.images[0].alt)}" width="132" height="164" loading="lazy" decoding="async">
    <span class="also-card__copy">
      <strong>${escapeHtml(product.name)}</strong>
      <span>${escapeHtml(product.shortNotes || (product.origin || "Torra Lusa"))}</span>
      <span class="price">${formatPrice(getStartingPrice(product))}</span>
    </span>
  </a>
`;

export const upsellItem = (product) => {
  const format = product.formats[0];
  return `<div class="cart-addon">
    <img src="${product.images[0].src}" alt="" width="96" height="120" loading="lazy">
    <span class="cart-addon__copy"><strong>${escapeHtml(product.name)}</strong><span>${formatPrice(getStartingPrice(product))}</span></span>
    <button type="button" data-add-to-cart="${product.id}" data-format="${format.id}" data-grind="grao" data-qty="1" aria-label="Adicionar ${escapeHtml(product.name)} ao carrinho">${icon("plus")}</button>
  </div>`;
};

export const freeShippingUpsell = (product) => {
  if (!product) return "";
  const format = product.formats[0];
  return `<div class="free-shipping__upsell">
    <img src="${product.images[0].src}" alt="" width="76" height="96" loading="lazy">
    <p><strong>${escapeHtml(product.name)}</strong> — chega para os portes grátis?</p>
    <button type="button" data-add-to-cart="${product.id}" data-format="${format.id}" data-grind="grao" data-qty="1">Adicionar</button>
  </div>`;
};

/* Rodapé ------------------------------------------------------------------ */
const footerCol = (title, links) => `
  <div class="footer-col">
    <h3>${title}</h3>
    <ul>
      ${links.map(([label, href, attrs = ""]) => `<li><a href="${href}" ${attrs}>${label}</a></li>`).join("")}
    </ul>
  </div>`;

export const footerMarkup = () => `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-main">
        <div class="footer-brand">
          <a class="brand" href="index.html" aria-label="Torra Lusa — página inicial">
            <span class="brand__mark">${logoMark()}</span>
            <span class="brand__text"><span class="brand__name">Torra Lusa</span><span class="brand__sub">Torrefação · Porto · 2019</span></span>
          </a>
          <p>Café de especialidade torrado semanalmente no Porto. Origens honestas, lotes pequenos e todo o tempo do mundo para uma boa chávena.</p>
          <div class="footer-brand__contact">
            <a href="${SITE.instagramUrl}" target="_blank" rel="noopener">${SITE.instagramUrl.replace("https://www.instagram.com/", "@").replace(/\/$/, "")} ↗</a>
            <a href="tel:${SITE.phoneLink}">${SITE.phone}</a>
            <a href="${WHATSAPP_URL}" target="_blank" rel="noopener">WhatsApp ${SITE.whatsappDisplay}</a>
            <a href="mailto:${SITE.email}">${SITE.email}</a>
          </div>
          <div class="footer-brand__social">
            <a class="footer-social" href="${SITE.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram @torralusa.cafe">${icon("instagram")}</a>
            <a class="footer-social" href="${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="WhatsApp Torra Lusa">${icon("whatsapp")}</a>
            <a class="footer-social" href="mailto:${SITE.email}" aria-label="Enviar email à Torra Lusa">${icon("mail")}</a>
          </div>
        </div>
        ${footerCol("O café", [
          ["Todos os cafés", "loja.html"],
          ["Café em grão", "loja.html?moagem=grao"],
          ["Já moído", "loja.html?moagem=moagem"],
          ["Cápsulas", "loja.html?categoria=capsulas"],
          ["Acessórios", "loja.html?categoria=acessorios"],
          ["Packs e ofertas", "loja.html?categoria=packs"],
          ["Subscrição mensal", "index.html#subscricao"],
        ])}
        ${footerCol("Apoio ao cliente", [
          ["Perguntas frequentes", "faq.html"],
          ["Envios e devoluções", "envios-devolucoes.html"],
          ["Contactos", "contactos.html"],
          ["Como preparar", "faq.html#preparar"],
          ["Prazo de 14 dias", "envios-devolucoes.html#devolucoes"],
          ["WhatsApp", WHATSAPP_URL, 'target="_blank" rel="noopener"'],
        ])}
        ${footerCol("A casa", [
          ["Sobre a torrefação", "sobre.html"],
          ["Os nossos produtores", "sobre.html#produtores"],
          ["Sustentabilidade", "sobre.html#sustentabilidade"],
          ["Contactos", "contactos.html"],
          ["Instagram", SITE.instagramUrl, 'target="_blank" rel="noopener"'],
          ["Design system", "design-system.html"],
        ])}
        <div class="footer-newsletter">
          <h3 class="footer-col-title">A carta da torra</h3>
          <p>Uma mensagem por mês: novos lotes, histórias de origem e 10 % na primeira compra.</p>
          <form class="newsletter-form" data-newsletter-form data-source="footer" novalidate>
            <label class="sr-only" for="footer-news-email">O teu email</label>
            <div class="newsletter-form__row">
              <input id="footer-news-email" name="email" type="email" placeholder="o.teu@email.pt" autocomplete="email" required>
              <button class="btn" type="submit" aria-label="Subscrever a newsletter">${icon("arrowRight")}</button>
            </div>
            <p class="form-message" data-newsletter-message role="status"></p>
            <p class="text-small" style="color:rgba(246,239,228,.42);font-size:.61rem;line-height:1.5;">Sem spam. Cancela quando quiseres. Ao subscrever aceitas a <a href="privacidade.html" style="color:inherit;text-decoration:underline;">política de privacidade</a>.</p>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <div>
          <span>© 2026 Torra Lusa. Todos os direitos reservados.</span>
          <div class="footer-legal">
            <span>NIF [a preencher]</span>
            <span>·</span>
            <span>${SITE.address}, ${SITE.postalCode} ${SITE.city}</span>
            <span>·</span>
            <span>${SITE.hours}</span>
          </div>
          <div class="footer-payments" aria-label="Métodos de pagamento aceites">
            <span class="payment-mark">Visa</span>
            <span class="payment-mark">MC</span>
            <span class="payment-mark">MB WAY</span>
            <span class="payment-mark">Multibanco</span>
            <span class="payment-mark">PayPal</span>
          </div>
        </div>
        <div class="footer-bottom__links">
          <a href="privacidade.html">Privacidade</a>
          <a href="privacidade.html#cookies">Cookies</a>
          <a href="termos.html">Termos</a>
          <a href="${SITE.legal.complaints}" target="_blank" rel="noopener">Livro de Reclamações</a>
          <a href="${SITE.legal.dispute}" target="_blank" rel="noopener">Resolução de litígios</a>
        </div>
      </div>
    </div>
  </footer>
`;

/* Estruturas flutuantes ---------------------------------------------------- */
export const cartDrawerMarkup = () => `
  <div class="cart-drawer" id="cart-drawer" aria-hidden="true">
    <div class="drawer-backdrop cart-drawer__backdrop" data-close-cart></div>
    <aside class="cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <div class="cart-drawer__head">
        <h2 id="cart-drawer-title">O teu carrinho <span data-drawer-count></span></h2>
        <button class="icon-btn" type="button" data-close-cart aria-label="Fechar carrinho">${icon("close")}</button>
      </div>
      <div class="cart-drawer__body" data-drawer-body></div>
      <div class="cart-drawer__foot" data-drawer-foot></div>
    </aside>
  </div>
`;

export const floatingMarkup = () => `
  <a class="whatsapp-float" href="${WHATSAPP_URL}" target="_blank" rel="noopener" aria-label="Falar com a Torra Lusa no WhatsApp">
    ${icon("whatsapp")}<span>Falar connosco</span>
  </a>
  <button class="back-to-top" type="button" data-back-to-top aria-label="Voltar ao topo">${icon("arrowUp")}</button>
  <div class="toast-region" id="toast-region" role="status" aria-live="polite" aria-atomic="false"></div>
  <div class="cookie-banner" id="cookie-banner" role="region" aria-label="Consentimento de cookies" hidden>
    <p>Usamos apenas cookies essenciais para guardar o teu carrinho. Com o teu consentimento, gostaríamos de medir visitas de forma anónima para melhorar a loja. <a href="privacidade.html#cookies">Saber mais</a>.</p>
    <div class="cookie-banner__actions">
      <button class="btn btn--ghost-light btn--sm" type="button" data-cookie="essential">Só essenciais</button>
      <button class="btn btn--sm" type="button" data-cookie="all">Aceitar</button>
    </div>
  </div>
  <div class="quick-add-dialog" id="quick-add-dialog" aria-hidden="true"></div>
`;

export const paymentMarks = () =>
  ["VISA", "MC", "MB WAY", "MULTIBANCO", "PAYPAL"]
    .map((method) => `<span class="payment-mark">${method}</span>`)
    .join("");

export const breadcrumbsMarkup = (items) =>
  `<nav aria-label="Trilho de navegação"><ol class="breadcrumbs">${items
    .map((item, index) =>
      index === items.length - 1
        ? `<li><span aria-current="page">${escapeHtml(item.label)}</span></li>`
        : `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`
    )
    .join("")}</ol></nav>`;

/* Revelações ao entrar no ecrã -------------------------------------------- */
let revealObserver = null;

export const observeReveals = (root = document) => {
  const elements = root.querySelectorAll(".reveal:not(.is-visible)");
  if (!elements.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" }
    );
  }

  elements.forEach((element) => revealObserver.observe(element));
};

export { escapeHtml, getProduct };
