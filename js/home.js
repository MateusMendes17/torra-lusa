/**
 * Torra Lusa — página inicial
 * -------------------------------------------------
 * Produtos em destaque, guia de escolha em três passos, testemunhos
 * com pausa acessível e pequenos detalhes editoriais da torra.
 */

import { formatPrice, HOME_TESTIMONIALS } from "./data.js";
import {
  productCard,
  icon,
  stars,
  stamp,
  observeReveals,
  escapeHtml,
} from "./components.js";
import {
  getBestsellers,
  getStartingPrice,
  getProduct,
  recommendCoffees,
} from "./products.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

/* Produtos em destaque ----------------------------------------------------- */
const renderBestsellers = () => {
  const grid = qs("[data-home-bestsellers]");
  if (!grid) return;
  grid.innerHTML = getBestsellers(4)
    .map((product, index) => productCard(product, { index }))
    .join("");
  observeReveals(grid);
};

/* Guia de escolha ----------------------------------------------------------- */
const GUIDE_STEPS = [
  {
    key: "brew",
    question: "Como preparas o café em casa?",
    options: [
      { value: "espresso", label: "Máquina de espresso", icon: "cup" },
      { value: "filtro", label: "Filtro ou V60", icon: "filterCone" },
      { value: "prensa", label: "Prensa francesa", icon: "press" },
      { value: "explorar", label: "Ainda estou a descobrir", icon: "spark" },
    ],
  },
  {
    key: "flavour",
    question: "Que sabor te chama mais?",
    options: [
      { value: "frutado", label: "Floral e frutado", icon: "leaf" },
      { value: "doce", label: "Doce e redondo", icon: "star" },
      { value: "intenso", label: "Intenso e encorpado", icon: "mug" },
      { value: "equilibrado", label: "Equilibrado, sem surpresas", icon: "bean" },
    ],
  },
  {
    key: "format",
    question: "Grão ou já moído?",
    options: [
      { value: "grao", label: "Em grão, moí-lo em casa", icon: "bean" },
      { value: "moagem", label: "Já moído para o meu método", icon: "grinder" },
      { value: "sem-preferencia", label: "Tanto faz, escolham por mim", icon: "spark" },
    ],
  },
];

const guideState = {
  step: 0,
  answers: { brew: "filtro", flavour: "equilibrado", format: "grao" },
};

const guideDotMarkup = () =>
  GUIDE_STEPS.map((_, index) => {
    const status =
      index === guideState.step ? "is-active" : index < guideState.step ? "is-done" : "";
    return `<span class="guide__dot ${status}"></span>`;
  }).join("");

const renderGuide = () => {
  const container = qs("[data-guide-content]");
  if (!container) return;
  const step = GUIDE_STEPS[guideState.step];
  const dots = qs("[data-guide-dots]");
  if (dots) dots.innerHTML = guideDotMarkup();
  const counter = qs("[data-guide-step]");
  if (counter) counter.textContent = `Passo ${guideState.step + 1} de ${GUIDE_STEPS.length}`;

  if (guideState.step >= GUIDE_STEPS.length) {
    renderGuideResult(container);
    return;
  }

  const options = qs("[data-guide-options]", container);
  const question = qs("[data-guide-question]", container);
  if (question) {
    question.textContent = step.question;
  } else {
    container.innerHTML = initialGuideMarkup();
    return;
  }
  if (options) {
    options.innerHTML = step.options
      .map(
        (option) => `
        <button class="guide-option" type="button" data-guide-answer="${option.value}">
          <span class="guide-option__icon">${icon(option.icon)}</span>
          ${escapeHtml(option.label)}
        </button>`
      )
      .join("");
  }
  const back = qs("[data-guide-back]", container);
  if (back) back.hidden = guideState.step === 0;
  const result = qs("[data-guide-result]", container);
  if (result) result.hidden = true;
};

const initialGuideMarkup = () => `
  <div class="guide__result-head">
    <div>
      <h3>Uma sugestão para a tua chávena.</h3>
      <p>Três perguntas rápidas. Sem certo nem errado.</p>
    </div>
    ${stamp({ top: "Guia da casa", line1: "ESCOLHA", line2: "3×", bottom: "PORTO", className: "" })}
  </div>
  <div data-guide-question class="guide__question">Como preparas o café em casa?</div>
  <div class="guide__options" data-guide-options></div>
  <button class="guide__back btn btn--text" type="button" data-guide-back hidden>← Voltar</button>
  <div data-guide-result hidden></div>
`;

const renderGuideResult = (container) => {
  const { coffees } = recommendCoffees({
    brew: guideState.answers.brew,
    flavour: guideState.answers.flavour,
    format: guideState.answers.format,
  });
  const dots = qs("[data-guide-dots]");
  if (dots) dots.innerHTML = GUIDE_STEPS.map(() => `<span class="guide__dot is-done"></span>`).join("");
  const counter = qs("[data-guide-step]");
  if (counter) counter.textContent = "A tua seleção";

  const textByBrew = {
    espresso: "com corpo suficiente para a chávena curta",
    filtro: "limpos, doces e com acidez viva",
    prensa: "generosos e táteis, feitos para durar",
    explorar: "uma porta de entrada para a especialidade",
  };

  container.innerHTML = `
    <div class="guide__result" role="status">
      <div class="guide__result-head">
        <div>
          <span class="eyebrow eyebrow--plain">Sugestão da casa</span>
          <h3>Começa por estes dois.</h3>
          <p>Escolhemos cafés ${textByBrew[guideState.answers.brew] || "equilibrados"} para o teu perfil${
            guideState.answers.format === "moagem" ? ", e indicamos a moagem certa." : "."
          }</p>
        </div>
        ${stamp({ top: "Feito para ti", line1: "LOTE", line2: "TL", bottom: "PORTO · 2026", className: "" })}
      </div>
      <div class="guide__result-grid">
        ${coffees
          .map(
            (product) => `
            <article class="guide-product">
              <a class="guide-product__media" href="produto.html?id=${product.id}" tabindex="-1" aria-hidden="true">
                <img src="${product.images[0].src}" alt="" width="400" height="500" loading="lazy">
              </a>
              <div class="guide-product__body">
                <h4><a href="produto.html?id=${product.id}">${escapeHtml(product.name)}</a></h4>
                <p>${escapeHtml(product.shortNotes)}</p>
                <span class="price">${formatPrice(getStartingPrice(product))}</span>
                <button class="btn btn--outline btn--sm" type="button" data-quick-add="${product.id}">${icon("plus")} Adicionar</button>
              </div>
            </article>`
          )
          .join("")}
      </div>
      <button class="guide__restart" type="button" data-guide-restart>Recomeçar o guia</button>
    </div>
  `;
};

const initGuide = () => {
  const container = qs("[data-guide-tool]");
  if (!container) return;
  const content = qs("[data-guide-content]", container);
  if (content) content.innerHTML = initialGuideMarkup();
  renderGuide();

  container.addEventListener("click", (event) => {
    const answer = event.target.closest("[data-guide-answer]");
    if (answer) {
      const step = GUIDE_STEPS[guideState.step];
      guideState.answers[step.key] = answer.dataset.guideAnswer;
      guideState.step += 1;
      renderGuide();
      return;
    }
    if (event.target.closest("[data-guide-back]")) {
      guideState.step = Math.max(0, guideState.step - 1);
      renderGuide();
      return;
    }
    if (event.target.closest("[data-guide-restart]")) {
      guideState.step = 0;
      content.innerHTML = initialGuideMarkup();
      renderGuide();
    }
  });
};

/* Testemunhos --------------------------------------------------------------- */
const renderTestimonials = () => {
  const carousel = qs("[data-testimonials]");
  if (!carousel) return;
  carousel.innerHTML = HOME_TESTIMONIALS.map(
    (testimonial, index) => `
      <figure class="testimonial ${index === 0 ? "is-active" : ""}" data-testimonial>
        <blockquote>“${escapeHtml(testimonial.quote)}”</blockquote>
        <figcaption class="testimonial__footer">
          <span class="testimonial__author">
            <strong>${escapeHtml(testimonial.name)}</strong>
            <span>${escapeHtml(testimonial.detail)}</span>
          </span>
          <span class="testimonial__product">${escapeHtml(testimonial.product)}</span>
        </figcaption>
      </figure>`
  ).join("");

  const dots = qs("[data-testimonial-dots]");
  if (dots) {
    dots.innerHTML = HOME_TESTIMONIALS.map(
      (testimonial, index) => `
        <button class="testimonial-dot ${index === 0 ? "is-active" : ""}" type="button" data-testimonial-dot="${index}" aria-label="Ver testemunho de ${escapeHtml(testimonial.name)}" ${index === 0 ? 'aria-current="true"' : ""}></button>`
    ).join("");
  }
};

const initTestimonials = () => {
  const carousel = qs("[data-testimonials]");
  if (!carousel) return;
  renderTestimonials();
  const all = qsa("[data-testimonial]", carousel);
  const dots = qsa("[data-testimonial-dot]");
  const play = qs("[data-testimonial-play]");
  if (!all.length) return;

  let active = 0;
  let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;

  const setActive = (index) => {
    active = (index + all.length) % all.length;
    all.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === active);
      item.setAttribute("aria-hidden", itemIndex === active ? "false" : "true");
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === active);
      if (dotIndex === active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (!playing) return;
    timer = window.setInterval(() => setActive(active + 1), 7500);
  };

  const updatePlayButton = () => {
    if (!play) return;
    play.innerHTML = playing ? icon("pause") : icon("play");
    play.setAttribute("aria-label", playing ? "Pausar rotação dos testemunhos" : "Retomar rotação dos testemunhos");
    play.setAttribute("aria-pressed", playing ? "false" : "true");
  };

  qsa("[data-testimonial-prev]").forEach((button) =>
    button.addEventListener("click", () => {
      setActive(active - 1);
      start();
    })
  );
  qsa("[data-testimonial-next]").forEach((button) =>
    button.addEventListener("click", () => {
      setActive(active + 1);
      start();
    })
  );
  dots.forEach((dot) =>
    dot.addEventListener("click", () => {
      setActive(Number(dot.dataset.testimonialDot));
      start();
    })
  );
  play?.addEventListener("click", () => {
    playing = !playing;
    updatePlayButton();
    if (playing) start();
    else stop();
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) start();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  setActive(0);
  updatePlayButton();
  start();
};

/* Pequenas notas de frescura ------------------------------------------------ */
const renderFreshness = () => {
  const slots = qsa("[data-roast-freshness]");
  if (!slots.length) return;
  const latest = getProduct("etiopia-guji");
  slots.forEach((slot) => {
    slot.textContent = latest?.roastDate
      ? "Lote torrado a 15 de outubro de 2026"
      : "Torrado esta semana no Porto";
  });
};

const renderStamps = () => {
  const heroStamp = qs("[data-hero-stamp]");
  if (heroStamp) {
    heroStamp.innerHTML = stamp({
      top: "Torra desta semana",
      line1: "LOTE",
      line2: "08",
      bottom: "PORTO · 2026",
    });
  }
  const storyStamp = qs("[data-story-stamp]");
  if (storyStamp) {
    storyStamp.innerHTML = stamp({
      top: "Café de especialidade",
      line1: "DESDE",
      line2: "2019",
      bottom: "PORTO · PORTUGAL",
    });
  }
};

export const init = async () => {
  renderStamps();
  renderBestsellers();
  initGuide();
  initTestimonials();
  renderFreshness();
  observeReveals(document);
};
