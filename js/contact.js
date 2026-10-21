/**
 * Torra Lusa — formulário de contacto
 * -------------------------------------------------
 * Validação, contador de caracteres, campos condicionais e simulação
 * de envio. As mensagens ficam apenas no navegador de quem as escreve.
 */

import { track } from "./analytics.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const CONTACT_KEY = "torraLusaMessages:v1";
const TOPICS = {
  encomenda: "Uma encomenda",
  devolucao: "Devolução ou troca",
  subscricao: "Subscrição de café",
  preparacao: "Como preparar o café",
  imprensa: "Imprensa e colaborações",
  outro: "Outro assunto",
};

const form = qs("[data-contact-form]");

const setError = (input, message = "") => {
  const field = input.closest(".field");
  if (!field) return;
  field.classList.toggle("has-error", Boolean(message));
  const error = qs(".field__error", field);
  if (error) error.textContent = message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
};

const setFormMessage = (text, type = "success") => {
  const message = qs("[data-contact-message]", form);
  if (!message) return;
  message.textContent = text;
  message.className = `form-message form-message--${type} is-visible`;
};

const updateOrderField = () => {
  if (!form) return;
  const topic = qs('select[name="topic"]', form)?.value;
  const orderField = qs("[data-order-field]", form);
  const orderInput = qs('input[name="orderNumber"]', form);
  const show = ["encomenda", "devolucao"].includes(topic);
  if (orderField) orderField.hidden = !show;
  if (orderInput) orderInput.required = false;
};

const updateCount = () => {
  const textarea = qs('textarea[name="message"]', form);
  const count = qs("[data-contact-count]", form);
  if (!textarea || !count) return;
  count.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
};

const prefillTopic = () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("assunto");
  if (!topic || !TOPICS[topic]) return;
  const select = qs('select[name="topic"]', form);
  if (!select) return;
  select.value = topic;
  updateOrderField();
  const message = qs('textarea[name="message"]', form);
  if (message && !message.value) {
    const prefill = {
      encomenda: "Olá! Gostaria de ajuda com a encomenda número ",
      devolucao: "Olá! Gostaria de tratar de uma devolução. O número da encomenda é ",
      subscricao: "Olá! Gostaria de saber mais sobre a subscrição de café.",
      preparacao: "Olá! Gostaria de uma sugestão de preparação para o café ",
      imprensa: "Olá! Gostaria de falar convosco sobre uma colaboração.",
      outro: "",
    }[topic];
    message.value = prefill;
    updateCount();
  }
};

const validate = () => {
  if (!form) return false;
  let valid = true;

  qsa("input[required], select[required], textarea[required]", form).forEach((input) => {
    if (input.type === "checkbox") {
      if (!input.checked) {
        setError(input, "Aceita a política de privacidade para enviar a mensagem.");
        valid = false;
      } else setError(input, "");
      return;
    }
    const value = input.value.trim();
    if (!value) {
      setError(input, "Preenche este campo, por favor.");
      valid = false;
      return;
    }
    if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(input, "Escreve um email válido, por exemplo nome@email.pt.");
      valid = false;
      return;
    }
    if (input.name === "message" && value.length < 12) {
      setError(input, "Conte-nos um pouco mais: pelo menos 12 caracteres.");
      valid = false;
      return;
    }
    setError(input, "");
  });

  if (!valid) {
    const firstError = qs(".field.has-error input, .field.has-error select, .field.has-error textarea", form);
    firstError?.focus();
  }
  return valid;
};

const saveMessage = (payload) => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CONTACT_KEY) || "[]");
    const list = Array.isArray(stored) ? stored : [];
    list.push(payload);
    window.localStorage.setItem(CONTACT_KEY, JSON.stringify(list.slice(-10)));
  } catch {
    // A demonstração confirma na mesma a mensagem nesta sessão.
  }
};

export const init = () => {
  if (!form) return;

  prefillTopic();
  updateOrderField();
  updateCount();

  qs('select[name="topic"]', form)?.addEventListener("change", updateOrderField);
  const textarea = qs('textarea[name="message"]', form);
  textarea?.addEventListener("input", updateCount);

  qsa("input, select, textarea", form).forEach((input) => {
    const clear = () => {
      if (input.closest(".field")?.classList.contains("has-error")) setError(input, "");
    };
    input.addEventListener("input", clear);
    input.addEventListener("change", clear);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) {
      setFormMessage("Confirma os campos assinalados antes de enviar.", "error");
      return;
    }

    const data = new FormData(form);
    const payload = {
      createdAt: new Date().toISOString(),
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      topic: String(data.get("topic") || "outro"),
      orderNumber: String(data.get("orderNumber") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };
    saveMessage(payload);
    track("contact_submit", { topic: payload.topic });

    setFormMessage(
      "Mensagem registada. Esta é uma demonstração: numa loja real seguiria para a equipa e responderíamos em menos de um dia útil.",
      "success"
    );
    form.reset();
    updateOrderField();
    updateCount();
    qsa(".field.has-error", form).forEach((field) => field.classList.remove("has-error"));
  });
};
