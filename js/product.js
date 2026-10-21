/**
 * Torra Lusa — página de produto
 * -------------------------------------------------
 * Lê o produto do URL (?id=…), constrói a galeria, variantes, compra,
 * subscrição, ficha de origem, avaliações e sugestões relacionadas.
 * O carrinho é sempre o mesmo módulo partilhado (cart.js).
 */

import { SITE, formatDate, formatPrice } from "./data.js";
import {
  CATEGORIES,
  GRINDS,
  PRODUCT_FAQS,
  ROAST_LEVELS,
  getFormat,
  getPairings,
  getProduct,
  getProductReviews,
  getRelatedProducts,
  getSavingPer100g,
  getSubscriptionSaving,
  getUnitPrice,
  isAvailable,
  isLowStock,
} from "./products.js";
import {
  breadcrumbsMarkup,
  escapeHtml,
  icon,
  observeReveals,
  productCard,
  productMiniCard,
  safe,
  stars,
} from "./components.js";
import { addItem } from "./cart.js";
import { track } from "./analytics.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const root = qs("[data-product-root]");
const params = new URLSearchParams(window.location.search);
const product = getProduct(params.get("id") || "");

const state = {
  formatId: product?.formats[0]?.id || "",
  grindId: product?.grinds?.[0]?.id || "",
  subscription: false,
  quantity: 1,
  imageIndex: 0,
};

/* Utilitários de página ----------------------------------------------------- */
const setMetaContent = (selector, value) => {
  const element = qs(selector);
  if (element) element.setAttribute("content", value);
};

const updateHead = () => {
  if (!product) {
    document.title = "Produto não encontrado — Torra Lusa";
    return;
  }
  const title = `${product.name} — Torra Lusa`;
  const description = `${product.subtitle}. ${product.shortNotes}. Torrado no Porto, com data de torra impressa.`;
  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:image"]', `https://torra-lusa.vercel.app/${product.images[0].src}`);
  setMetaContent('meta[property="og:url"]', `https://torra-lusa.vercel.app/produto.html?id=${product.id}`);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  const canonical = qs('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", `https://torra-lusa.vercel.app/produto.html?id=${product.id}`);
};

const addStructuredData = () => {
  if (!product) return;
  const format = getFormat(product, product.formats[0].id);
  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => `https://torra-lusa.vercel.app/${image.src}`),
    sku: `TL-${product.id.toUpperCase()}`,
    brand: { "@type": "Brand", name: "Torra Lusa" },
    category: CATEGORIES[product.category]?.label,
    offers: {
      "@type": "Offer",
      url: `https://torra-lusa.vercel.app/produto.html?id=${product.id}`,
      priceCurrency: "EUR",
      price: format.price.toFixed(2),
      availability: isAvailable(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "product-structured-data";
  script.textContent = JSON.stringify(structured).replaceAll("<", "\\u003c");
  document.head.append(script);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: "https://torra-lusa.vercel.app/index.html",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Loja",
        item: "https://torra-lusa.vercel.app/loja.html",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://torra-lusa.vercel.app/produto.html?id=${product.id}`,
      },
    ],
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRODUCT_FAQS.slice(0, 3).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  [breadcrumb, faq].forEach((data) => {
    const node = document.createElement("script");
    node.type = "application/ld+json";
    node.textContent = JSON.stringify(data).replaceAll("<", "\\u003c");
    document.head.append(node);
  });
};

const flagMarkup = () => {
  const flags = [];
  if (!isAvailable(product)) {
    flags.push({ label: "Esgotado", className: "product-flag--out" });
  } else {
    if (isLowStock(product)) {
      flags.push({ label: "Últimas unidades", className: "product-flag--low" });
    }
    (product.labels || []).slice(0, 2).forEach((label) => {
      flags.push({
        label,
        className: /novo|edição/i.test(label)
          ? "product-flag--olive"
          : /vendido/i.test(label)
            ? "product-flag--dark"
            : "",
      });
    });
  }
  return flags
    .map(
      (flag) =>
        `<span class="product-flag ${flag.className}">${escapeHtml(flag.label)}</span>`
    )
    .join("");
};

/* Galeria ------------------------------------------------------------------- */
const galleryMarkup = () => `
  <div class="product-gallery" aria-label="Imagens de ${escapeHtml(product.name)}">
    <div class="product-gallery__thumbs" aria-label="Escolher imagem">
      ${product.images
        .map(
          (image, index) => `
          <button class="product-thumb ${index === 0 ? "is-active" : ""}" type="button" data-gallery-thumb="${index}" aria-label="Ver imagem ${index + 1} de ${product.images.length}" aria-pressed="${index === 0}">
            <img src="${image.src}" alt="" width="152" height="190" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
          </button>`
        )
        .join("")}
    </div>
    <div class="product-gallery__main" data-gallery-main>
      <div class="product-gallery__flags">${flagMarkup()}</div>
      <img src="${product.images[0].src}" alt="${escapeHtml(product.images[0].alt)}" width="900" height="1125" fetchpriority="high" data-gallery-image>
      <span class="product-gallery__note">${icon("bean")} ${product.roastDate ? `Torrado a ${formatDate(product.roastDate, { day: "numeric", month: "short" })}` : "Escolhido pela casa"}</span>
      <button class="product-gallery__zoom" type="button" data-open-lightbox aria-label="Ampliar imagem">
        ${icon("eye")} Ampliar
      </button>
    </div>
  </div>
`;

/* Compra -------------------------------------------------------------------- */
const optionFormatMarkup = () =>
  product.formats
    .map((format, index) => {
      const saving = getSavingPer100g(product, format.id);
      return `
        <label class="option">
          <input type="radio" name="pdp-format" value="${format.id}" ${index === 0 ? "checked" : ""}>
          <span class="option__box">
            <span class="option__title">${escapeHtml(format.label)}</span>
            <span class="option__meta">${formatPrice(format.price)}</span>
            ${saving ? `<span class="option__tag">poupa ${saving} % / 100 g</span>` : ""}
          </span>
        </label>`;
    })
    .join("");

const grindMarkup = () =>
  product.grinds
    ? `<div class="variant-group">
        <div class="variant-group__head">
          <span class="variant-group__label">Moagem</span>
          <span class="variant-group__selected" data-selected-grind>${escapeHtml(product.grinds[0].label)}</span>
        </div>
        <div class="grind-options" role="radiogroup" aria-label="Moagem">
          ${product.grinds
            .map(
              (grind, index) => `
              <label class="option">
                <input type="radio" name="pdp-grind" value="${grind.id}" ${index === 0 ? "checked" : ""}>
                <span class="option__box"><span class="option__title">${escapeHtml(grind.label)}</span></span>
              </label>`
            )
            .join("")}
        </div>
      </div>`
    : "";

const purchaseMarkup = () =>
  product.subscription
    ? `<div class="variant-group">
        <div class="variant-group__head">
          <span class="variant-group__label">Como queres receber</span>
          <span class="variant-group__selected" data-selected-purchase>Compra única</span>
        </div>
        <div class="purchase-options" role="radiogroup" aria-label="Tipo de compra">
          <label class="option purchase-option">
            <input type="radio" name="pdp-purchase" value="single" checked>
            <span class="option__box">
              <span class="purchase-option__head"><span class="option__title">Compra única</span></span>
              <span class="option__meta">Recebe uma vez, sem compromisso.</span>
            </span>
          </label>
          <label class="option purchase-option">
            <input type="radio" name="pdp-purchase" value="subscription">
            <span class="option__box">
              <span class="purchase-option__head">
                <span class="option__title">Subscrição mensal</span>
                <span class="purchase-option__badge">−10 %</span>
              </span>
              <span class="option__meta">Uma entrega por mês. Pausa ou cancela quando quiseres.</span>
            </span>
          </label>
        </div>
      </div>
      <p class="subscription-note" data-subscription-note hidden>
        ${icon("refresh")} O desconto de 10 % é aplicado em cada entrega. A periodicidade pode ser ajustada mais tarde por email ou WhatsApp.
      </p>`
    : "";

const accordionItem = (id, title, content, open = false) => `
  <div class="accordion__item">
    <button class="accordion__button" type="button" aria-expanded="${open}" aria-controls="${id}">
      ${escapeHtml(title)}
      <span class="accordion__symbol" aria-hidden="true"></span>
    </button>
    <div class="accordion__panel" id="${id}" aria-hidden="${!open}">
      <div class="accordion__inner"><div class="accordion__content">${content}</div></div>
    </div>
  </div>
`;

const detailsFacts = () => {
  const rows = [
    ["Origem", product.origin],
    ["Região", product.region],
    ["Produtor", product.producer],
    ["Altitude", product.altitude],
    ["Variedade", product.variety],
    ["Processo", product.process],
  ].filter(([, value]) => value);
  return rows.length
    ? `<div class="origin-facts">${rows
        .slice(0, 4)
        .map(
          ([label, value]) =>
            `<div class="origin-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
        )
        .join("")}</div>`
    : "";
};

const accordionsMarkup = () => {
  const historyTitle =
    product.category === "acessorios"
      ? "Porque o escolhemos"
      : product.category === "packs"
        ? "O que vem nesta caixa"
        : "A história deste lote";
  const history = `<p>${escapeHtml(product.description)}</p>${
    product.story ? `<p class="mt-2">${escapeHtml(product.story)}</p>` : ""
  }`;
  const origin = `
    <p>${escapeHtml(product.story || product.description)}</p>
    <div class="origin-facts">
      ${[
        ["Produtor / fabrico", product.producer],
        ["Origem", product.origin || "Portugal"],
        ["Altitude", product.altitude],
        ["Processo / detalhes", product.process],
      ]
        .filter(([, value]) => value)
        .map(
          ([label, value]) =>
            `<div class="origin-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
        )
        .join("")}
    </div>`;
  const prep = `
    <p>${escapeHtml(product.brewSuggestion || "Prepara com água fresca e uma balança. Pequenos ajustes fazem uma grande diferença.")}</p>
    <p class="mt-2">Se tiveres dúvidas sobre a moagem certa, fala connosco antes de encomendar. Ajustamos a moagem ao teu método e máquina.</p>`;
  const shipping = `
    <p>Enviamos à segunda, terça e quinta-feira. Os portes CTT são gratuitos em compras a partir de ${SITE.freeShippingThreshold} € e a entrega demora normalmente 2 a 4 dias úteis. Podes levantar gratuitamente na loja do Porto, na Rua Miguel Bombarda, 215.</p>
    <p class="mt-2">Se mudares de ideias, tens 14 dias para devolver. Basta escrever para <a href="mailto:ola@torralusa.pt">ola@torralusa.pt</a>.</p>`;
  return `
    <div class="accordion product-accordions" data-accordion>
      ${accordionItem(`pdp-historia-${product.id}`, historyTitle, history, true)}
      ${accordionItem(`pdp-origem-${product.id}`, "Origem e ficha técnica", origin)}
      ${accordionItem(`pdp-preparacao-${product.id}`, "Preparação e moagem", prep)}
      ${accordionItem(`pdp-envios-${product.id}`, "Envios e devoluções", shipping)}
    </div>`;
};

const buyboxMarkup = () => {
  const available = isAvailable(product);
  const format = getFormat(product, product.formats[0].id);
  const unit = getUnitPrice(product, format.id, false);
  const category = CATEGORIES[product.category];
  return `
    <div class="product-info__eyebrow">
      <span class="eyebrow eyebrow--plain">${escapeHtml(category?.label || "Torra Lusa")}</span>
      <span class="product-info__origin">${escapeHtml(product.origin || category?.short || "Porto")}${product.region ? ` · ${escapeHtml(product.region)}` : ""}</span>
    </div>
    <h1>${escapeHtml(product.name)}</h1>
    <p class="product-info__subtitle">${escapeHtml(product.subtitle)}</p>
    <div class="product-info__rating">
      ${stars(product.rating, product.reviewCount)}
      <a href="#avaliacoes">Ler avaliações</a>
    </div>
    <div class="product-info__price">
      <span class="price" data-pdp-price>${formatPrice(unit)}</span>
      <span class="product-info__saving" data-pdp-saving ${product.subscription ? "" : "hidden"}></span>
    </div>
    <div class="product-info__freshness">
      <span>${icon("calendar")} ${product.roastDate ? `Torra de ${formatDate(product.roastDate)}` : "Preparado ao ritmo da casa"}</span>
      <span>${icon("leaf")} ${product.roast ? `Torra ${ROAST_LEVELS[product.roast]?.label.toLowerCase()}` : "Materiais escolhidos para durar"}</span>
    </div>
    <div class="product-info__stock">
      ${
        available
          ? `<span class="stock-badge ${isLowStock(product) ? "stock-badge--low" : ""}">${isLowStock(product) ? `Últimas ${product.stock} unidades` : "Disponível"}</span>`
          : '<span class="stock-badge stock-badge--out">Esgotado</span>'
      }
      <span class="text-small" style="color:var(--ink-soft)">${available ? "Expedição em 1–2 dias úteis" : "Avisa-nos e damos-te notícias"}</span>
    </div>

    <form class="product-buybox" data-pdp-buybox novalidate>
      <div class="variant-group">
        <div class="variant-group__head">
          <span class="variant-group__label">Formato</span>
          <span class="variant-group__selected" data-selected-format>${escapeHtml(format.label)}</span>
        </div>
        <div class="format-options ${product.formats.length === 2 ? "format-options--2" : ""}" role="radiogroup" aria-label="Formato">
          ${optionFormatMarkup()}
        </div>
      </div>
      ${grindMarkup()}
      ${purchaseMarkup()}
      <div class="product-qty-row">
        <div class="qty-stepper" aria-label="Quantidade">
          <button type="button" data-pdp-step="-1" aria-label="Diminuir quantidade">${icon("minus")}</button>
          <input type="text" inputmode="numeric" value="1" data-pdp-qty aria-label="Quantidade" ${available ? "" : "disabled"}>
          <button type="button" data-pdp-step="1" aria-label="Aumentar quantidade">${icon("plus")}</button>
        </div>
        <button class="btn ${available ? "" : "is-unavailable"}" type="submit" data-pdp-add ${available ? "" : "disabled"}>
          ${icon("bag")} <span data-pdp-add-label>${available ? `Adicionar · ${formatPrice(unit)}` : "Esgotado"}</span>
        </button>
      </div>
      <div class="product-trust">
        <span>${icon("truck")} Portes grátis a partir de ${SITE.freeShippingThreshold} € · envio CTT em 2–4 dias úteis</span>
        <span>${icon("refresh")} Devolução durante 14 dias, sem complicações</span>
        <span>${icon("shield")} Pagamento seguro · cartão, MB WAY ou Multibanco</span>
      </div>
    </form>
  `;
};

const infoMarkup = () => `
  <div class="product-info">
    ${buyboxMarkup()}
    ${accordionsMarkup()}
  </div>
`;

/* Perfil, origem e sugestões ------------------------------------------------ */
const flavourMarkup = () => {
  if (!product) return "";
  const isCoffee = Boolean(product.profile);
  const title = isCoffee
    ? product.origin === "Multiorigem"
      ? "Construído para a chávena."
      : "Porque voltamos a este lote."
    : "Escolhido para o ritual.";
  const profileMarkup = product.profile
    ? `<div class="profile" aria-label="Perfil de prova">
        ${Object.entries(product.profile)
          .map(([key, value]) => {
            const labels = { acidez: "Acidez", corpo: "Corpo", doçura: "Doçura", amargor: "Amargor" };
            return `<div class="profile-row">
              <div class="profile-row__head"><span>${labels[key] || key}</span><span>${value} / 5</span></div>
              <div class="profile-bar" role="img" aria-label="${labels[key] || key}: ${value} de 5"><span style="width:${(value / 5) * 100}%"></span></div>
            </div>`;
          })
          .join("")}
      </div>`
    : `<div class="profile">
        ${[
          ["Fabrico", product.producer],
          ["Detalhes", product.process],
          ["Como usar", product.brewSuggestion],
        ]
          .filter(([, value]) => value)
          .map(
            ([label, value]) =>
              `<div class="profile-row">
                <div class="profile-row__head"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>
              </div>`
          )
          .join("")}
      </div>`;
  return `
    <section class="flavour-section" aria-labelledby="perfil-title">
      <div class="flavour-layout">
        <div class="flavour-copy reveal">
          <span class="eyebrow">${isCoffee ? "Perfil de prova" : "Feito para durar"}</span>
          <h2 id="perfil-title">${escapeHtml(title)}</h2>
          <p>${escapeHtml(product.description)}</p>
          <div class="flavour-notes" aria-label="Notas e materiais">
            ${product.notes.map((note) => `<span class="flavour-note">${escapeHtml(note)}</span>`).join("")}
          </div>
          ${isCoffee ? `<p class="text-small mt-3" style="color:var(--ink-soft)">${escapeHtml(product.brewSuggestion)}</p>` : ""}
        </div>
        <div class="reveal" style="--reveal-delay:90ms">
          ${profileMarkup}
        </div>
      </div>
    </section>`;
};

const originMarkup = () => {
  if (!product.story) return "";
  const facts = detailsFacts();
  return `
    <section class="origin-card reveal" aria-labelledby="origem-title">
      <div class="origin-card__image">
        <img src="${product.images[1].src}" alt="${escapeHtml(product.images[1].alt)}" width="900" height="675" loading="lazy" decoding="async">
      </div>
      <div class="origin-card__copy">
        <span class="eyebrow eyebrow--plain">${product.origin ? "Da origem à torra" : "A nossa escolha"}</span>
        <h3 id="origem-title">${escapeHtml(product.tagline)}</h3>
        <p>${escapeHtml(product.story)}</p>
        ${facts}
      </div>
    </section>`;
};

const pairingsMarkup = () => {
  const pairings = getPairings(product, 3);
  if (!pairings.length) return "";
  return `
    <section class="section section--tight" aria-labelledby="combina-title">
      <div class="between" style="margin-bottom:1.4rem;flex-wrap:wrap;gap:1rem">
        <div>
          <span class="eyebrow">Combina bem com</span>
          <h2 class="section-title" id="combina-title" style="font-size:clamp(1.8rem,1.4rem+1.5vw,2.6rem);margin-top:.7rem">Para completar a chávena.</h2>
        </div>
        <a class="link-arrow" href="loja.html?categoria=acessorios">Ver acessórios ${icon("arrowRight")}</a>
      </div>
      <div class="also-grid">${pairings.map((item) => productMiniCard(item)).join("")}</div>
    </section>`;
};

const reviewsMarkup = () => {
  const reviews = getProductReviews(product);
  const distribution = [
    ["5", 78],
    ["4", 18],
    ["3", 3],
    ["2", 1],
    ["1", 0],
  ];
  return `
    <section class="reviews-section" id="avaliacoes" aria-labelledby="avaliacoes-title">
      <div class="reviews-layout">
        <div class="reviews-summary reveal">
          <span class="eyebrow">Quem já provou</span>
          <h2 id="avaliacoes-title" class="sr-only">Avaliações de ${escapeHtml(product.name)}</h2>
          <div class="reviews-summary__score">
            <strong>${Number(product.rating).toFixed(1).replace(".", ",")}</strong>
            <span>${stars(product.rating, null, { showCount: false })}<br>${product.reviewCount} avaliações verificadas</span>
          </div>
          <div class="reviews-summary__bars" aria-label="Distribuição das avaliações">
            ${distribution
              .map(
                ([score, percent]) => `
                <div class="review-bar">
                  <span>${score}</span>
                  <span class="review-bar__track"><span style="width:${percent}%"></span></span>
                  <span>${percent} %</span>
                </div>`
              )
              .join("")}
          </div>
          <a class="btn btn--outline btn--sm" href="mailto:ola@torralusa.pt?subject=${encodeURIComponent(`Avaliação — ${product.name}`)}">Partilhar a tua experiência</a>
        </div>
        <div class="review-list reveal" style="--reveal-delay:80ms">
          ${reviews
            .map(
              (review) => `
              <article class="review">
                <div class="review__head">
                  <span class="review__author"><span class="review__avatar" aria-hidden="true">${escapeHtml(review.name.charAt(0))}</span>${escapeHtml(review.name)}</span>
                  <span class="review__meta">${stars(review.rating, null, { showCount: false })} · ${escapeHtml(review.city)}</span>
                </div>
                <h3 class="review__title">${escapeHtml(review.title)}</h3>
                <p class="review__text">${escapeHtml(review.text)}</p>
                ${review.verified ? `<span class="review__verified">${icon("check")} Compra verificada</span>` : ""}
              </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
};

const faqMarkup = () => `
  <section class="product-mini-faq" aria-labelledby="pdp-faq-title">
    <span class="eyebrow">Antes de encomendar</span>
    <h2 id="pdp-faq-title" style="font-size:clamp(1.9rem,1.5rem+1.5vw,2.7rem);margin-top:.7rem">Perguntas com resposta direta.</h2>
    <div class="mt-3">
      ${PRODUCT_FAQS.concat([
        {
          q: "Posso juntar este produto a outra encomenda?",
          a: "Sim. Podes juntar cafés, cápsulas e acessórios no mesmo carrinho. Os portes são calculados uma única vez no checkout.",
        },
        {
          q: "Como funciona a subscrição?",
          a: "Escolhes a subscrição no produto, recebes 10 % de desconto em cada entrega e podes pausar, mudar a moagem ou cancelar quando quiseres, sem penalização.",
        },
      ])
        .slice(0, 5)
        .map(
          (item, index) => `
          <details class="faq-item" ${index === 0 ? "open" : ""}>
            <summary>${escapeHtml(item.q)}</summary>
            <div class="faq-answer"><p>${escapeHtml(item.a)}</p></div>
          </details>`
        )
        .join("")}
    </div>
  </section>`;

const relatedMarkup = () => {
  const related = getRelatedProducts(product, 3);
  if (!related.length) return "";
  return `
    <section class="section section--paper section--tight" aria-labelledby="relacionados-title">
      <div class="container">
        <div class="between" style="margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <div>
            <span class="eyebrow">Se gostaste deste</span>
            <h2 class="section-title" id="relacionados-title" style="font-size:clamp(1.9rem,1.5rem+1.5vw,2.8rem);margin-top:.7rem">Talvez gostes também.</h2>
          </div>
          <a class="link-arrow" href="loja.html">Ver toda a loja ${icon("arrowRight")}</a>
        </div>
        <div class="product-grid product-grid--3">${related
          .map((item, index) => productCard(item, { index }))
          .join("")}</div>
      </div>
    </section>`;
};

const stickyMarkup = () => `
  <div class="sticky-buy" data-sticky-buy aria-hidden="true">
    <div class="sticky-buy__info">
      <strong>${escapeHtml(product.name)}</strong>
      <span data-sticky-meta>${escapeHtml(getFormat(product, state.formatId).label)}${product.grinds ? ` · ${escapeHtml(GRINDS[state.grindId]?.short || "")}` : ""} · <span data-sticky-price>${formatPrice(getUnitPrice(product, state.formatId, false))}</span></span>
    </div>
    <button class="btn" type="button" data-sticky-add ${isAvailable(product) ? "" : "disabled"}>${icon("bag")} ${isAvailable(product) ? "Adicionar" : "Esgotado"}</button>
  </div>`;

/* Render -------------------------------------------------------------------- */
const render = () => {
  if (!product) {
    if (root) {
      root.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__card">
            <span class="cart-empty__mark">${icon("search")}</span>
            <h1>Não encontrámos esse café.</h1>
            <p>O link pode estar incompleto ou o produto pode ter mudado de nome. A loja continua aqui, com todos os lotes desta semana.</p>
            <div class="cart-empty__actions">
              <a class="btn" href="loja.html">Voltar à loja ${icon("arrowRight")}</a>
              <a class="btn btn--outline" href="contactos.html">Falar connosco</a>
            </div>
          </div>
        </div>`;
    }
    return;
  }

  if (root) {
    root.innerHTML = `
      <div class="product-detail">
        ${galleryMarkup()}
        ${infoMarkup()}
      </div>
      ${flavourMarkup()}
      ${originMarkup()}
      ${pairingsMarkup()}
      ${reviewsMarkup()}
      ${faqMarkup()}
    `;
    const relatedSlot = qs("[data-product-related]");
    if (relatedSlot) relatedSlot.innerHTML = relatedMarkup();
    document.body.insertAdjacentHTML("beforeend", stickyMarkup());
    qs("[data-product-breadcrumbs]").innerHTML = breadcrumbsMarkup([
      { label: "Início", href: "index.html" },
      { label: "Loja", href: "loja.html" },
      {
        label: CATEGORIES[product.category]?.plural || "Produto",
        href: `loja.html?categoria=${product.category}`,
      },
      { label: product.name },
    ]);
  }

  updateSummary();
  initGallery();
  initBuybox();
  initStickyBuy();
  observeReveals(document);
};

/* Estado da compra ---------------------------------------------------------- */
const clampQuantity = (value) => {
  const max = Math.max(1, Math.min(20, product?.stock || 1));
  return Math.max(1, Math.min(Number(value) || 1, max));
};

const updateSummary = () => {
  if (!product) return;
  const format = getFormat(product, state.formatId);
  const grind = GRINDS[state.grindId];
  const unitPrice = getUnitPrice(product, state.formatId, state.subscription);
  const subscriptionSaving = getSubscriptionSaving(product, state.formatId);
  const total = unitPrice * state.quantity;
  const savedPer100 = getSavingPer100g(product, state.formatId);
  const price = qs("[data-pdp-price]");
  if (price) price.textContent = formatPrice(unitPrice);
  const saving = qs("[data-pdp-saving]");
  if (saving) {
    const text = state.subscription
      ? `−${formatPrice(subscriptionSaving)} por entrega`
      : savedPer100
        ? `Poupa ${savedPer100} % por 100 g`
        : "";
    saving.textContent = text;
    saving.hidden = !text;
  }
  const selectedFormat = qs("[data-selected-format]");
  if (selectedFormat) selectedFormat.textContent = format.label;
  const selectedGrind = qs("[data-selected-grind]");
  if (selectedGrind) selectedGrind.textContent = grind?.label || "";
  const selectedPurchase = qs("[data-selected-purchase]");
  if (selectedPurchase) {
    selectedPurchase.textContent = state.subscription ? "Subscrição mensal −10 %" : "Compra única";
  }
  const note = qs("[data-subscription-note]");
  if (note) note.hidden = !state.subscription;
  const qty = qs("[data-pdp-qty]");
  if (qty) qty.value = state.quantity;
  const addLabel = qs("[data-pdp-add-label]");
  if (addLabel && isAvailable(product)) addLabel.textContent = `Adicionar · ${formatPrice(total)}`;
  const stickyMeta = qs("[data-sticky-meta]");
  if (stickyMeta) {
    stickyMeta.innerHTML = `${escapeHtml(format.label)}${product.grinds ? ` · ${escapeHtml(grind?.short || "")}` : ""}${state.subscription ? " · Subscrição −10 %" : ""} · <span data-sticky-price>${formatPrice(unitPrice * state.quantity)}</span>`;
  }
  const stickyButton = qs("[data-sticky-add]");
  if (stickyButton) stickyButton.disabled = !isAvailable(product);
};

const syncQuantity = () => {
  state.quantity = clampQuantity(state.quantity);
  updateSummary();
};

const handleAdd = (source = "pdp") => {
  if (!product || !isAvailable(product)) return;
  const result = addItem({
    productId: product.id,
    formatId: state.formatId,
    grindId: product.grinds ? state.grindId : "",
    subscription: state.subscription,
    qty: state.quantity,
    openDrawer: true,
  });
  if (!result.ok) {
    window.alert(result.message || "Não foi possível adicionar o produto.");
    return;
  }
  track("product_add_to_cart", {
    product: product.id,
    format: state.formatId,
    subscription: state.subscription,
    quantity: state.quantity,
    source,
  });
};

/* Interações ---------------------------------------------------------------- */
const initBuybox = () => {
  qsa('input[name="pdp-format"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.formatId = input.value;
      updateSummary();
    });
  });
  qsa('input[name="pdp-grind"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.grindId = input.value;
      updateSummary();
    });
  });
  qsa('input[name="pdp-purchase"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.subscription = input.value === "subscription";
      updateSummary();
    });
  });
  qsa("[data-pdp-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.quantity = clampQuantity(state.quantity + Number(button.dataset.pdpStep));
      updateSummary();
    });
  });
  qs("[data-pdp-qty]")?.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/[^0-9]/g, "");
  });
  qs("[data-pdp-qty]")?.addEventListener("change", (event) => {
    state.quantity = clampQuantity(event.target.value);
    syncQuantity();
  });
  qs("[data-pdp-buybox]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAdd("buybox");
  });
};

let setGalleryImage = null;

const initGallery = () => {
  const mainImage = qs("[data-gallery-image]");
  const thumbs = qsa("[data-gallery-thumb]");
  setGalleryImage = (index) => {
    if (!mainImage || !product.images[index]) return;
    state.imageIndex = index;
    const image = product.images[index];
    mainImage.src = image.src;
    mainImage.alt = image.alt;
    thumbs.forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-pressed", String(active));
    });
  };
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => setGalleryImage(Number(thumb.dataset.galleryThumb)));
  });
  qs("[data-gallery-main]")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-lightbox]")) return;
    openLightbox(state.imageIndex);
  });
  qs("[data-open-lightbox]")?.addEventListener("click", () => openLightbox(state.imageIndex));
};

let lightboxElement = null;
let lightboxLastFocus = null;

const closeLightbox = () => {
  if (!lightboxElement) return;
  lightboxElement.remove();
  lightboxElement = null;
  document.body.classList.remove("no-scroll");
  if (lightboxLastFocus && typeof lightboxLastFocus.focus === "function") {
    lightboxLastFocus.focus({ preventScroll: true });
  }
};

const updateLightboxImage = (index) => {
  if (!lightboxElement) return;
  const image = product.images[index];
  state.imageIndex = index;
  const picture = qs(".lightbox__figure img", lightboxElement);
  const caption = qs("figcaption", lightboxElement);
  if (picture) {
    picture.src = image.src;
    picture.alt = image.alt;
  }
  if (caption) caption.textContent = image.alt;
  setGalleryImage?.(index);
};

const openLightbox = (index = 0) => {
  if (!product) return;
  lightboxLastFocus = document.activeElement;
  if (!lightboxElement) {
    lightboxElement = document.createElement("div");
    lightboxElement.className = "lightbox";
    lightboxElement.setAttribute("role", "dialog");
    lightboxElement.setAttribute("aria-modal", "true");
    lightboxElement.setAttribute("aria-label", "Imagem ampliada");
    lightboxElement.innerHTML = `
      <div class="lightbox__backdrop" data-lightbox-close></div>
      <button class="lightbox__close" type="button" data-lightbox-close aria-label="Fechar imagem">${icon("close")}</button>
      <figure class="lightbox__figure">
        <img src="${product.images[index].src}" alt="${escapeHtml(product.images[index].alt)}" width="900" height="1125">
        <figcaption>${escapeHtml(product.images[index].alt)}</figcaption>
      </figure>
    `;
    document.body.append(lightboxElement);
    document.body.classList.add("no-scroll");
    qsa("[data-lightbox-close]", lightboxElement).forEach((button) =>
      button.addEventListener("click", closeLightbox)
    );
    lightboxElement.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        updateLightboxImage((state.imageIndex + 1) % product.images.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        updateLightboxImage((state.imageIndex - 1 + product.images.length) % product.images.length);
      } else if (event.key === "Tab") {
        event.preventDefault();
        qs(".lightbox__close", lightboxElement)?.focus();
      }
    });
  } else {
    updateLightboxImage(index);
  }
  window.requestAnimationFrame(() => qs(".lightbox__close", lightboxElement)?.focus());
};

const initStickyBuy = () => {
  const sticky = qs("[data-sticky-buy]");
  const buybox = qs("[data-pdp-buybox]");
  if (!sticky || !buybox) return;
  const show = () => {
    if (window.innerWidth > 860) return;
    sticky.classList.add("is-visible");
    sticky.setAttribute("aria-hidden", "false");
  };
  const hide = () => {
    sticky.classList.remove("is-visible");
    sticky.setAttribute("aria-hidden", "true");
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) hide();
        else show();
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    observer.observe(buybox);
  }
  qs("[data-sticky-add]")?.addEventListener("click", () => handleAdd("sticky"));
};

export const init = () => {
  updateHead();
  addStructuredData();
  render();
};
