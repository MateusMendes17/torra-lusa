/**
 * Torra Lusa — dados globais da loja
 * -------------------------------------------------
 * Preços, portes, códigos promocionais e conteúdos editáveis
 * estão centralizados aqui. Alterar apenas este ficheiro para
 * atualizar a comunicação comercial em todo o site.
 */

export const SITE = {
  name: "Torra Lusa",
  legalName: "Torra Lusa — Torrefação de Café, Lda.",
  slogan: "Café de especialidade, torrado em Portugal.",
  description:
    "Café de especialidade torrado semanalmente no Porto. Origens únicas, blends da casa, cápsulas compatíveis e acessórios para o teu ritual.",
  email: "ola@torralusa.pt",
  phone: "22 345 67 89",
  phoneLink: "+351223456789",
  whatsapp: "351912678345",
  whatsappDisplay: "912 678 345",
  address: "Rua Miguel Bombarda, 215",
  postalCode: "4050-377",
  city: "Porto",
  country: "Portugal",
  hours: "Terça a Sábado, 10h00–19h00",
  instagram: "torralusa.cafe",
  instagramUrl: "https://www.instagram.com/torralusa.cafe/",
  founded: 2019,
  freeShippingThreshold: 35,
  vatNote: "Preços com IVA incluído à taxa legal em vigor.",
  legal: {
    nif: "[NIF da empresa a preencher]",
    crc: "[Número de registo comercial a preencher]",
    capital: "[Capital social a preencher]",
    complaints:
      "https://www.livroreclamacoes.pt/inicio/complaint",
    dispute:
      "https://www.consumidor.gov.pt/",
  },
};

export const FREE_SHIPPING_THRESHOLD = SITE.freeShippingThreshold;

/** Meios de envio simulados. O preço dos CTT fica gratuito a partir de 35 €. */
export const SHIPPING_OPTIONS = {
  ctt: {
    id: "ctt",
    name: "CTT Standard",
    description: "Entrega em 2–4 dias úteis",
    price: 3.9,
    freeOverThreshold: true,
  },
  expresso: {
    id: "expresso",
    name: "Entrega Expresso",
    description: "1–2 dias úteis depois do envio",
    price: 6.5,
    freeOverThreshold: false,
  },
  pickup: {
    id: "pickup",
    name: "Levantamento na loja do Porto",
    description: "Rua Miguel Bombarda, 215 — após preparação",
    price: 0,
    freeOverThreshold: false,
  },
};

export const PAYMENT_METHODS = {
  card: { id: "card", label: "Cartão de crédito ou débito", note: "Visa, Mastercard, American Express" },
  mbway: { id: "mbway", label: "MB WAY", note: "Pedido de pagamento no telemóvel" },
  multibanco: { id: "multibanco", label: "Referência Multibanco", note: "Pagamento até 48 horas" },
  paypal: { id: "paypal", label: "PayPal", note: "Conta PayPal ou cartão associado" },
};

/**
 * Códigos promocionais.
 * type: percent | fixed. Aplicam-se ao subtotal elegível antes dos portes.
 */
export const PROMO_CODES = {
  BEMVINDO10: {
    code: "BEMVINDO10",
    type: "percent",
    value: 10,
    label: "10 % na primeira compra",
    minSubtotal: 0,
  },
  CAFE5: {
    code: "CAFE5",
    type: "fixed",
    value: 5,
    label: "5 € de desconto",
    minSubtotal: 25,
  },
};

export const PRODUCT_REVIEWS = [
  {
    name: "Inês M.",
    city: "Porto",
    rating: 5,
    title: "Chegou com cheiro a torra fresca",
    text: "Encomendei na segunda e recebi na quarta. A data de torra estava mesmo na embalagem e o café abriu maravilhosamente ao terceiro dia. Já é a minha rotina semanal.",
    date: "2026-09-18",
    verified: true,
  },
  {
    name: "Tiago R.",
    city: "Lisboa",
    rating: 5,
    title: "Finalmente um espresso equilibrado",
    text: "O Blend Ribeira deu na minha máquina um café com corpo, sem aquela amargura que costumo apanhar nos cafés de supermercado. A embalagem também é bonita em cima da bancada.",
    date: "2026-08-30",
    verified: true,
  },
  {
    name: "Marta e João",
    city: "Braga",
    rating: 5,
    title: "O pack foi um presente certeiro",
    text: "Oferecemos o Pack Presente aos nossos pais e ainda recebemos mensagem a dizer que era o melhor café de casa deles. O cartão escrito à mão faz diferença.",
    date: "2026-09-06",
    verified: true,
  },
  {
    name: "Rui A.",
    city: "Coimbra",
    rating: 4,
    title: "Muito bom para filtro",
    text: "O Etiópia Guji tem uma acidez viva e notas florais muito limpas. Preferia a moagem um pouco mais grossa para V60, mas o apoio respondeu-me no mesmo dia com uma recomendação.",
    date: "2026-07-22",
    verified: true,
  },
  {
    name: "Sofia L.",
    city: "Porto",
    rating: 5,
    title: "A assinatura que me estragou os cafés todos",
    text: "Recebo sempre antes de acabar o pacote anterior. Ainda por cima descobri o Quénia Nyeri, que nunca teria escolhido sozinha. Serviço caloroso, coisas boas.",
    date: "2026-09-28",
    verified: true,
  },
  {
    name: "André C.",
    city: "Faro",
    rating: 5,
    title: "Acessórios com atenção ao detalhe",
    text: "A V60 e os filtros vieram muito bem embalados e a moagem sugerida no cartão acertou em cheio. Nota-se que provam o café que vendem.",
    date: "2026-08-11",
    verified: true,
  },
];

/** Testemunhos da página inicial — curtos e humanos. */
export const HOME_TESTIMONIALS = [
  {
    quote:
      "Abri o pacote e a cozinha ficou com cheiro a pão quente e fruta. É esse momento que me faz continuar a comprar.",
    name: "Inês Marques",
    detail: "Cliente desde 2021 · Porto",
    product: "Etiópia Guji",
    rating: 5,
  },
  {
    quote:
      "Gosto de saber de onde vem, quem o cultivou e quando foi torrado. A Torra Lusa conta-nos isso sem fazer um espetáculo.",
    name: "Tiago Ramos",
    detail: "Assinante mensal · Lisboa",
    product: "Blend Ribeira",
    rating: 5,
  },
  {
    quote:
      "Encomendei às onze da noite e na quinta-feira de manhã estava à porta. Ainda vinha um cartão escrito à mão.",
    name: "Sofia Leite",
    detail: "Cliente desde 2023 · Matosinhos",
    product: "Pack Presente",
    rating: 5,
  },
  {
    quote:
      "Tenho uma máquina simples e pouca paciência. Os guias de moagem que vêm com o café tornaram tudo fácil.",
    name: "Rui Azevedo",
    detail: "Cliente desde 2024 · Coimbra",
    product: "Cápsulas Blend Ribeira",
    rating: 4,
  },
];

export const SUBSCRIPTION_COPY = {
  saving: 10,
  title: "Café fresco, à porta, sem pensares nisso.",
  description:
    "Escolhes o café, a moagem e a periodicidade. Nós torramos na semana do envio e podes pausar ou cancelar quando quiseres.",
  highlights: [
    "Poupa 10 % em cada entrega",
    "Torra programada para a semana do envio",
    "Muda, pausa ou cancela quando quiseres",
    "Portes grátis em todas as entregas a partir de 35 €",
  ],
};

/** Informação de contacto para o botão flutuante de WhatsApp. */
export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
  "Olá Torra Lusa! Gostaria de saber mais sobre o café e a subscrição."
)}`;

/** Formatação portuguesa consistente em todo o site. */
export const formatPrice = (value) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (isoDate, options = {}) => {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
};

export const formatShortDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/\sde\s/g, " ");
};

export const slugify = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
