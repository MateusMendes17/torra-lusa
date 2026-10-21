/**
 * Torra Lusa — loja
 * -------------------------------------------------
 * Filtros por categoria, preparação, torra, preço e disponibilidade.
 * Todo o estado é refletido no URL para permitir partilhar a seleção.
 */

import {
  CATEGORIES,
  PRODUCTS,
  ROAST_LEVELS,
  getStartingPrice,
  isAvailable,
  normalizeText,
} from "./products.js";
import { formatPrice } from "./data.js";
import {
  productCard,
  icon,
  observeReveals,
  escapeHtml,
} from "./components.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const PRICE_RANGES = {
  "under-10": { label: "Até 10 €", test: (price) => price < 10 },
  "10-20": { label: "10 € – 20 €", test: (price) => price >= 10 && price < 20 },
  "20-35": { label: "20 € – 35 €", test: (price) => price >= 20 && price < 35 },
  "over-35": { label: "Mais de 35 €", test: (price) => price >= 35 },
};

const state = {
  categories: new Set(),
  grinds: new Set(),
  roasts: new Set(),
  prices: new Set(),
  inStock: false,
  query: "",
  sort: "destaque",
};

let lastFocused = null;

/* Estado inicial a partir do URL ------------------------------------------- */
const readUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const categories = (params.get("categoria") || "").split(",").filter(Boolean);
  categories.forEach((category) => {
    if (CATEGORIES[category]) state.categories.add(category);
  });
  const grind = params.get("moagem");
  if (grind === "grao" || grind === "moagem") state.grinds.add(grind);
  const roast = (params.get("torra") || "").split(",").filter(Boolean);
  roast.forEach((level) => {
    if (ROAST_LEVELS[level]) state.roasts.add(level);
  });
  const price = (params.get("preco") || "").split(",").filter(Boolean);
  price.forEach((range) => {
    if (PRICE_RANGES[range]) state.prices.add(range);
  });
  state.inStock = params.get("disponivel") === "1";
  state.query = params.get("q") || "";
  state.sort = params.get("ordenar") || "destaque";
};

const writeUrl = () => {
  const params = new URLSearchParams();
  if (state.categories.size) params.set("categoria", [...state.categories].join(","));
  if (state.grinds.size) params.set("moagem", [...state.grinds][0]);
  if (state.roasts.size) params.set("torra", [...state.roasts].join(","));
  if (state.prices.size) params.set("preco", [...state.prices].join(","));
  if (state.inStock) params.set("disponivel", "1");
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.sort !== "destaque") params.set("ordenar", state.sort);
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState({}, "", next);
};

/* Filtragem ----------------------------------------------------------------- */
const countProducts = (filterKey, value) => {
  return PRODUCTS.filter((product) => {
    if (!isAvailable(product) && state.inStock) return false;
    if (filterKey === "category") return product.category === value;
    if (filterKey === "grind") {
      if (value === "grao") return Boolean(product.grinds);
      if (value === "moagem") return Boolean(product.grinds);
    }
    if (filterKey === "roast") return product.roast === value;
    return true;
  }).length;
};

const matches = (product) => {
  if (state.categories.size && !state.categories.has(product.category)) return false;
  if (state.grinds.size) {
    if (!product.grinds) return false;
    if (state.grinds.has("grao") && state.grinds.has("moagem")) {
      // Ambos selecionados: aceita qualquer café que possa ser comprado nas duas formas.
    }
  }
  if (state.roasts.size && !state.roasts.has(product.roast)) return false;
  if (state.prices.size) {
    const price = getStartingPrice(product);
    const inRange = [...state.prices].some((range) => PRICE_RANGES[range]?.test(price));
    if (!inRange) return false;
  }
  if (state.inStock && !isAvailable(product)) return false;
  if (state.query.trim()) {
    const term = normalizeText(state.query);
    const haystack = normalizeText(
      [
        product.name,
        product.subtitle,
        product.origin,
        product.region,
        product.story,
        ...product.notes,
        CATEGORIES[product.category]?.label,
      ].join(" ")
    );
    if (!haystack.includes(term)) return false;
  }
  return true;
};

const sortProducts = (products) => {
  const sorted = [...products];
  switch (state.sort) {
    case "preco-asc":
      return sorted.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    case "preco-desc":
      return sorted.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    case "avaliacao":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "novidades":
      return sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.bestseller) - Number(a.bestseller) ||
          Number(b.newArrival) - Number(a.newArrival) ||
          b.rating - a.rating
      );
  }
};

/* Markup dos filtros -------------------------------------------------------- */
const filterGroup = (title, content, { open = true } = {}) => `
  <fieldset class="filter-group">
    <button class="filter-group__toggle" type="button" data-filter-toggle aria-expanded="${open}">
      ${title}
      ${icon("chevronDown")}
    </button>
    <div class="filter-group__content" ${open ? "" : "hidden"}>
      ${content}
    </div>
  </fieldset>
`;

const checkMarkup = ({ name, value, label, checked = false, count = null }) => `
  <label class="filter-check">
    <input type="checkbox" name="${name}" value="${value}" ${checked ? "checked" : ""}>
    <span class="filter-check__box" aria-hidden="true"></span>
    <span>${escapeHtml(label)}</span>
    ${count !== null ? `<span class="filter-check__count">${count}</span>` : ""}
  </label>
`;

const filtersMarkup = (scope = "desktop") => `
  <div class="shop-filters__head">
    <h2>Filtrar</h2>
    <button class="shop-filters__clear" type="button" data-filter-clear>Tudo limpo</button>
  </div>
  <form data-filter-form>
    <div class="filter-search">
      ${icon("search", "filter-search__icon")}
      <label class="sr-only" for="shop-filter-search-${scope}">Pesquisar na loja</label>
      <input class="input" id="shop-filter-search-${scope}" type="search" name="filter-search" placeholder="Procurar café, sabor…" value="${escapeHtml(state.query)}" autocomplete="off">
    </div>

    ${filterGroup(
      "Categoria",
      Object.values(CATEGORIES)
        .map((category) =>
          checkMarkup({
            name: "category",
            value: category.id,
            label: category.plural,
            checked: state.categories.has(category.id),
            count: PRODUCTS.filter((product) => product.category === category.id).length,
          })
        )
        .join("")
    )}

    ${filterGroup(
      "Preparação",
      `${checkMarkup({ name: "grind", value: "grao", label: "Café em grão", checked: state.grinds.has("grao"), count: countProducts("grind", "grao") })}
       ${checkMarkup({ name: "grind", value: "moagem", label: "Já moído", checked: state.grinds.has("moagem"), count: countProducts("grind", "moagem") })}`
    )}

    ${filterGroup(
      "Torra",
      Object.values(ROAST_LEVELS)
        .map((level) =>
          checkMarkup({
            name: "roast",
            value: level.id,
            label: level.label,
            checked: state.roasts.has(level.id),
            count: countProducts("roast", level.id),
          })
        )
        .join(""),
      { open: false }
    )}

    ${filterGroup(
      "Preço",
      Object.entries(PRICE_RANGES)
        .map(([id, range]) =>
          checkMarkup({
            name: "price",
            value: id,
            label: range.label,
            checked: state.prices.has(id),
          })
        )
        .join(""),
      { open: false }
    )}

    <div class="filter-group">
      <label class="filter-check">
        <input type="checkbox" name="inStock" value="1" ${state.inStock ? "checked" : ""}>
        <span class="filter-check__box" aria-hidden="true"></span>
        <span>Só produtos disponíveis</span>
      </label>
    </div>
  </form>
  <p class="shop-note">
    ${icon("info")}
    <span>Preços com IVA incluído. A data de torra está impressa em cada embalagem e é indicada na página do produto.</span>
  </p>
`;

const activeFiltersMarkup = () => {
  const chips = [];
  state.categories.forEach((category) => {
    chips.push({ type: "category", value: category, label: CATEGORIES[category]?.plural || category });
  });
  state.grinds.forEach((grind) => {
    chips.push({
      type: "grind",
      value: grind,
      label: grind === "grao" ? "Café em grão" : "Já moído",
    });
  });
  state.roasts.forEach((roast) => {
    chips.push({ type: "roast", value: roast, label: `Torra ${ROAST_LEVELS[roast]?.label.toLowerCase()}` });
  });
  state.prices.forEach((range) => {
    chips.push({ type: "price", value: range, label: PRICE_RANGES[range]?.label || range });
  });
  if (state.inStock) chips.push({ type: "inStock", value: "1", label: "Disponíveis" });
  if (state.query.trim()) chips.push({ type: "query", value: state.query, label: `Pesquisa: “${state.query.trim()}”` });

  if (!chips.length) return "";
  return `
    ${chips
      .map(
        (chip) => `
        <span class="active-filter">
          ${escapeHtml(chip.label)}
          <button type="button" data-remove-filter="${chip.type}" data-filter-value="${escapeHtml(chip.value)}" aria-label="Remover filtro ${escapeHtml(chip.label)}">×</button>
        </span>`
      )
      .join("")}
    <button class="active-filters__clear" type="button" data-filter-clear>Limpar tudo</button>
  `;
};

/* Render -------------------------------------------------------------------- */
const renderFilters = () => {
  const desktop = qs("[data-shop-filters]");
  const mobile = qs("[data-filter-drawer-body]");
  if (desktop) desktop.innerHTML = filtersMarkup("desktop");
  if (mobile) mobile.innerHTML = filtersMarkup("mobile");
};

const renderProducts = () => {
  const grid = qs("[data-shop-grid]");
  const count = qs("[data-shop-count]");
  const active = qs("[data-active-filters]");
  const mobileCount = qs("[data-filter-open-count]");
  if (!grid) return;

  const products = sortProducts(PRODUCTS.filter(matches));
  const totalSelected =
    state.categories.size +
    state.grinds.size +
    state.roasts.size +
    state.prices.size +
    Number(state.inStock) +
    Number(Boolean(state.query.trim()));

  if (count) {
    count.innerHTML = `<strong>${products.length}</strong> ${products.length === 1 ? "produto" : "produtos"}`;
  }
  if (mobileCount) {
    mobileCount.textContent = totalSelected || "";
    mobileCount.hidden = totalSelected === 0;
  }
  if (active) active.innerHTML = activeFiltersMarkup();

  grid.classList.add("is-filtering");
  window.setTimeout(() => {
    if (!products.length) {
      grid.innerHTML = `
        <div class="shop-empty" style="grid-column:1/-1">
          <span class="shop-empty__mark">${icon("search")}</span>
          <h2>Nada por aqui, ainda.</h2>
          <p>Não encontrámos produtos com esta combinação. Tenta alargar os filtros ou fala connosco — sabemos onde está o café certo.</p>
          <button class="btn" type="button" data-filter-clear>Limpar os filtros</button>
        </div>`;
    } else {
      grid.innerHTML = products.map((product, index) => productCard(product, { index })).join("");
    }
    grid.classList.remove("is-filtering");
    observeReveals(grid);
  }, 120);
};

const syncControls = () => {
  qsa("[data-filter-form]").forEach((form) => {
    qsa('input[type="checkbox"]', form).forEach((input) => {
      if (input.name === "category") input.checked = state.categories.has(input.value);
      if (input.name === "grind") input.checked = state.grinds.has(input.value);
      if (input.name === "roast") input.checked = state.roasts.has(input.value);
      if (input.name === "price") input.checked = state.prices.has(input.value);
      if (input.name === "inStock") input.checked = state.inStock;
    });
    const search = qs('input[name="filter-search"]', form);
    if (search) search.value = state.query;
  });
  const sort = qs("#shop-sort");
  if (sort) sort.value = state.sort;
};

const apply = () => {
  writeUrl();
  renderProducts();
};

const clearFilters = ({ keepQuery = false } = {}) => {
  state.categories.clear();
  state.grinds.clear();
  state.roasts.clear();
  state.prices.clear();
  state.inStock = false;
  if (!keepQuery) state.query = "";
  syncControls();
  apply();
};

/* Interação ---------------------------------------------------------------- */
const initFilters = () => {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-filter-clear]")) {
      event.preventDefault();
      clearFilters();
      return;
    }

    const toggle = event.target.closest("[data-filter-toggle]");
    if (toggle) {
      const content = toggle.nextElementSibling;
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      if (content) content.hidden = expanded;
      return;
    }

    const remove = event.target.closest("[data-remove-filter]");
    if (remove) {
      const type = remove.dataset.removeFilter;
      const value = remove.dataset.filterValue;
      if (type === "category") state.categories.delete(value);
      if (type === "grind") state.grinds.delete(value);
      if (type === "roast") state.roasts.delete(value);
      if (type === "price") state.prices.delete(value);
      if (type === "inStock") state.inStock = false;
      if (type === "query") state.query = "";
      syncControls();
      apply();
    }
  });

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.closest("[data-filter-form]")) return;
    if (input.name === "category") {
      if (input.checked) state.categories.add(input.value);
      else state.categories.delete(input.value);
    }
    if (input.name === "grind") {
      if (input.checked) state.grinds.add(input.value);
      else state.grinds.delete(input.value);
    }
    if (input.name === "roast") {
      if (input.checked) state.roasts.add(input.value);
      else state.roasts.delete(input.value);
    }
    if (input.name === "price") {
      if (input.checked) state.prices.add(input.value);
      else state.prices.delete(input.value);
    }
    if (input.name === "inStock") state.inStock = input.checked;
    syncControls();
    apply();
  });

  let searchTimer = null;
  document.addEventListener("input", (event) => {
    if (!event.target.matches('[data-filter-form] input[name="filter-search"]')) return;
    const value = event.target.value;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      state.query = value;
      syncControls();
      apply();
    }, 180);
  });

  qs("#shop-sort")?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    apply();
  });

  qs("[data-filter-drawer-open]")?.addEventListener("click", openDrawer);
};

/* Drawer mobile ------------------------------------------------------------- */
const openDrawer = () => {
  const drawer = qs("#filter-drawer");
  if (!drawer) return;
  lastFocused = document.activeElement;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  window.requestAnimationFrame(() => qs("[data-filter-drawer-close]", drawer)?.focus());
};

const closeDrawer = () => {
  const drawer = qs("#filter-drawer");
  if (!drawer?.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  lastFocused = null;
};

const initDrawer = () => {
  const drawer = qs("#filter-drawer");
  if (!drawer) return;
  qsa("[data-filter-drawer-close]", drawer).forEach((button) =>
    button.addEventListener("click", closeDrawer)
  );
  qs("[data-filter-drawer-apply]", drawer)?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key === "Tab") {
      const focusables = [...drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter(
        (element) => element.offsetParent !== null
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
};

/* Arranque ------------------------------------------------------------------ */
export const init = () => {
  readUrl();
  renderFilters();
  syncControls();
  renderProducts();
  initFilters();
  initDrawer();

  if (!state.query) {
    const search = qs('input[name="filter-search"]');
    if (search && window.innerWidth > 1023) {
      // O foco não é roubado ao carregar; o campo está apenas pronto.
    }
  }

  const clear = qs("[data-empty-clear]");
  clear?.addEventListener("click", () => clearFilters());

  // Entrada direta com um termo de pesquisa no URL.
  if (state.query) {
    document.title = `Pesquisa: ${state.query} — Torra Lusa`;
  }

  observeReveals(document);
  document.dispatchEvent(new CustomEvent("shop:ready", { detail: { count: PRODUCTS.filter(matches).length } }));
};
