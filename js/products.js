/**
 * Torra Lusa — catálogo
 * -------------------------------------------------
 * Catálogo fictício, pronto a editar. Cada produto segue a mesma forma,
 * para que os cartões, filtros, página de produto e carrinho continuem
 * a funcionar sem alterações de código.
 *
 * IMAGENS
 * As embalagens dos cafés, cápsulas e packs são maquetas editoriais da
 * marca (ficheiros em /images/products). Devem ser substituídas por
 * fotografia real de produto quando existir, mantendo a proporção 4:5.
 * As fotografias de ambiente são placeholders do Unsplash ( /images ),
 * com crédito no README. Trocar os caminhos em `images`.
 *
 * DATAS DE TORRA
 * A data de torra é fictícia e está visível na página de produto.
 * Atualizar `lastRoast` a cada lote real.
 */

import { PRODUCT_REVIEWS } from "./data.js";

export const GRINDS = {
  grao: { id: "grao", label: "Grão inteiro", short: "Grão", description: "Conserva o aroma durante mais tempo." },
  espresso: { id: "espresso", label: "Espresso", short: "Espresso", description: "Moagem fina para máquina." },
  filtro: { id: "filtro", label: "Filtro / V60", short: "Filtro", description: "Moagem média para café de filtro." },
  moka: { id: "moka", label: "Moka", short: "Moka", description: "Moagem média-fina para cafeteira italiana." },
  prensa: { id: "prensa", label: "Prensa francesa", short: "Prensa", description: "Moagem grossa para infusão." },
};

export const ROAST_LEVELS = {
  clara: { id: "clara", label: "Clara", description: "Acidez viva e aromas delicados." },
  media: { id: "media", label: "Média", description: "Doçura e equilíbrio no centro." },
  "media-escura": { id: "media-escura", label: "Média-escura", description: "Corpo e notas de cacau." },
  escura: { id: "escura", label: "Escura", description: "Intensidade e um final longo." },
};

export const CATEGORIES = {
  cafe: {
    id: "cafe",
    label: "Café",
    plural: "Cafés",
    short: "Café",
    description: "Origens únicas e blends torrados todas as semanas no Porto.",
  },
  capsulas: {
    id: "capsulas",
    label: "Cápsulas",
    plural: "Cápsulas",
    short: "Cápsulas",
    description: "O mesmo café, em cápsulas compatíveis com Nespresso®.",
  },
  acessorios: {
    id: "acessorios",
    label: "Acessórios",
    plural: "Acessórios",
    short: "Acessórios",
    description: "Ferramentas simples e bonitas para preparar melhor café.",
  },
  packs: {
    id: "packs",
    label: "Packs",
    plural: "Packs",
    short: "Packs",
    description: "Para descobrir, oferecer ou começar um novo ritual.",
  },
};

export const PRODUCT_FAQS = [
  {
    q: "Quando é que o café é torrado?",
    a: "Torramos às quintas-feiras em pequenos lotes. A data exata do teu lote está impressa na etiqueta e na página do produto. Os pedidos com café em grão seguem depois da torra, à segunda, terça ou quinta-feira seguinte.",
  },
  {
    q: "Qual é a diferença entre compra única e subscrição?",
    a: "Na compra única recebes o café uma vez. Na subscrição recebes o mesmo café com 10 % de desconto e com uma periodicidade à tua escolha. Podes pausar, alterar ou cancelar a qualquer momento, sem compromisso.",
  },
  {
    q: "Como devo conservar o café?",
    a: "Num local fresco, seco e ao abrigo da luz, com a embalagem bem fechada. Não é necessário guardar no frigorífico. O café está no seu melhor entre 7 e 35 dias depois da torra.",
  },
  {
    q: "Posso pedir uma moagem diferente?",
    a: "Sim. Escolhe o formato e a moagem na página do produto. Se tiveres dúvidas, fala connosco por WhatsApp antes de encomendar — ajudamos a afinar a moagem para o teu método.",
  },
];

/** Ajuda a escolher a moagem; usada no guia e nos cartões. */
const COFFEE_GRINDS = Object.values(GRINDS);

/*
 * NOTA SOBRE IMAGENS:
 * - imagens `/images/products/*.webp` são maquetas 4:5 da Torra Lusa;
 * - imagens `/images/*.webp` são placeholders fotográficos do Unsplash.
 *   Substituir por fotografia própria antes de publicar.
 */
export const PRODUCTS = [
  {
    id: "etiopia-guji",
    name: "Etiópia Guji",
    subtitle: "Floral, luminoso e cheio de fruta",
    category: "cafe",
    kind: "coffee",
    origin: "Etiópia",
    region: "Guji",
    roast: "clara",
    notes: ["Jasmim", "Frutos vermelhos", "Mel"],
    shortNotes: "Jasmim · frutos vermelhos · mel",
    tagline: "O café que nos fez apaixonar por origens únicas.",
    description:
      "Um café de altitude, cultivado por pequenos produtores na zona de Guji. A torra clara realça o jasmim e a framboesa, com uma doçura de mel que fica no fim. É delicado sem ser tímido.",
    story:
      "Trabalhamos com a Buku Sayisa e a cooperativa de Guji desde a nossa primeira colheita, em 2019. Os lotes são escolhidos pela limpeza da chávena e pela consistência entre colheitas. Pagamos acima do preço de mercado pelo café em cereja e mantemos uma relação direta com quem o cultiva.",
    profile: { acidez: 5, corpo: 2, doçura: 4, amargor: 1 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 9.9 },
      { id: "500g", label: "500 g", grams: 500, price: 17.9 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 32.9 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 7,
    labels: ["Origem única", "Torra clara"],
    rating: 4.9,
    reviewCount: 84,
    roastDate: "2026-10-14",
    producer: "Buku Sayisa · Cooperativa Guji",
    altitude: "1 950 m",
    variety: "Heirloom",
    process: "Lavado",
    brewSuggestion: "V60, Chemex ou Aeropress. Água a 92–94 °C.",
    images: [
      { src: "images/products/etiopia-guji.webp", alt: "Embalagem creme da Torra Lusa para o café Etiópia Guji, lote 01 de 2026" },
      { src: "images/cup-steam.webp", alt: "Mão a segurar uma chávena de café fumegante junto à janela" },
      { src: "images/beans-sack.webp", alt: "Grãos de café acabados de torrar dentro de um saco de juta" },
    ],
    addedAt: "2026-09-02",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "colombia-huila",
    name: "Colômbia Huila",
    subtitle: "Caramelo, cacau e uma laranja madura",
    category: "cafe",
    kind: "coffee",
    origin: "Colômbia",
    region: "Huila",
    roast: "media",
    notes: ["Caramelo", "Cacau", "Laranja"],
    shortNotes: "Caramelo · cacau · laranja",
    tagline: "O equilíbrio que nunca cansa.",
    description:
      "Doce e redondo, com a acidez certa para acompanhar a manhã. Este Huila é o café que costumamos recomendar a quem está a começar na especialidade: perdoa pequenos desvios e continua delicioso.",
    story:
      "O lote vem de uma pequena associação de famílias em Pitalito, no sul da Colômbia. A secagem em camas elevadas dá-lhe uma limpidez que se nota logo na primeira prova. Compramos a colheita inteira antes de a torrar, para garantir preço justo ao produtor.",
    profile: { acidez: 3, corpo: 4, doçura: 5, amargor: 2 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 8.9 },
      { id: "500g", label: "500 g", grams: 500, price: 16.2 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 29.9 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 34,
    labels: ["Origem única"],
    rating: 4.8,
    reviewCount: 116,
    roastDate: "2026-10-14",
    producer: "Famílias de Pitalito · Asociación El Mirador",
    altitude: "1 750 m",
    variety: "Castillo e Caturra",
    process: "Lavado",
    brewSuggestion: "Espresso, moka ou filtro. Experimenta 18 g para 36 g de café.",
    images: [
      { src: "images/products/colombia-huila.webp", alt: "Embalagem bordô da Torra Lusa para o café Colômbia Huila, lote 02 de 2026" },
      { src: "images/latte-art.webp", alt: "Café com leite servido numa chávena branca sobre madeira" },
      { src: "images/hands-latte.webp", alt: "Duas mãos a brindar com chávenas de café com latte art" },
    ],
    addedAt: "2026-08-22",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "brasil-cerrado",
    name: "Brasil Cerrado",
    subtitle: "Chocolate, avelã e um final macio",
    category: "cafe",
    kind: "coffee",
    origin: "Brasil",
    region: "Cerrado Mineiro",
    roast: "media-escura",
    notes: ["Chocolate", "Avelã", "Melaço"],
    shortNotes: "Chocolate · avelã · melaço",
    tagline: "O abraço de uma chávena bem cheia.",
    description:
      "Doçura profunda, corpo sedoso e notas claras de chocolate negro. O Brasil Cerrado é o nosso café de todos os dias: brilha no espresso, mas também faz um café de filtro generoso e acolhedor.",
    story:
      "Cultivado em altitude média no Cerrado Mineiro, por uma quinta familiar que pratica agricultura regenerativa. A colheita seletiva e a secagem natural dão ao café uma doçura de melaço e uma estrutura muito estável.",
    profile: { acidez: 2, corpo: 5, doçura: 5, amargor: 3 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 7.9 },
      { id: "500g", label: "500 g", grams: 500, price: 14.5 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 26.9 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 42,
    labels: ["Mais vendido"],
    rating: 4.8,
    reviewCount: 142,
    roastDate: "2026-10-14",
    producer: "Fazenda Boa Esperança · Patrocínio",
    altitude: "1 100 m",
    variety: "Mundo Novo",
    process: "Natural",
    brewSuggestion: "Espresso, prensa francesa ou moka. Fica especialmente bem com leite.",
    images: [
      { src: "images/products/brasil-cerrado.webp", alt: "Embalagem castanho-escura da Torra Lusa para o café Brasil Cerrado, lote 03 de 2026" },
      { src: "images/espresso-tools.webp", alt: "Preparação de espresso numa bancada de madeira, com porta-filtros e chávena" },
      { src: "images/coffee-cup.webp", alt: "Chávena de café preto sobre uma mesa de madeira junto à janela" },
    ],
    addedAt: "2026-06-08",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "quenia-nyeri",
    name: "Quénia Nyeri",
    subtitle: "Groselha negra, tomate e flor de laranjeira",
    category: "cafe",
    kind: "coffee",
    origin: "Quénia",
    region: "Nyeri",
    roast: "clara",
    notes: ["Groselha negra", "Tomate", "Flor de laranjeira"],
    shortNotes: "Groselha · tomate · flor de laranjeira",
    tagline: "Uma chávena com verticalidade e surpresa.",
    description:
      "Um café africano intenso e luminoso, de acidez cítrica e corpo aveludado. As notas de groselha negra e tomate tornam-no inesquecível num filtro; com paciência, também dá um espresso cheio de personalidade.",
    story:
      "Da estação de lavagem de Gatomboya, no condado de Nyeri, onde mais de 600 pequenos agricultores entregam cerejas todos os dias. A dupla fermentação e a secagem lenta são feitas à moda antiga, com uma mão de obra incrível.",
    profile: { acidez: 5, corpo: 3, doçura: 4, amargor: 2 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 10.5 },
      { id: "500g", label: "500 g", grams: 500, price: 18.9 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 34.5 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 4,
    labels: ["Edição limitada", "Novo"],
    rating: 4.9,
    reviewCount: 39,
    roastDate: "2026-10-14",
    producer: "Gatomboya Factory · Nyeri",
    altitude: "1 800 m",
    variety: "SL28 e SL34",
    process: "Lavado · dupla fermentação",
    brewSuggestion: "V60 ou Chemex. Uma moagem média e uma dose generosa de 18 g.",
    images: [
      { src: "images/products/quenia-nyeri.webp", alt: "Embalagem verde-oliva da Torra Lusa para o café Quénia Nyeri, lote 04 de 2026" },
      { src: "images/barista.webp", alt: "Duas chávenas de café com latte art sobre uma tábua de madeira" },
      { src: "images/beans-bowl.webp", alt: "Grãos de café vistos de cima dentro de uma tigela branca" },
    ],
    addedAt: "2026-10-10",
    bestseller: false,
    newArrival: true,
  },
  {
    id: "costa-rica-tarrazu",
    name: "Costa Rica Tarrazú",
    subtitle: "Pêssego, baunilha e amêndoa torrada",
    category: "cafe",
    kind: "coffee",
    origin: "Costa Rica",
    region: "Tarrazú",
    roast: "media",
    notes: ["Pêssego", "Baunilha", "Amêndoa"],
    shortNotes: "Pêssego · baunilha · amêndoa",
    tagline: "Doçura de sobremesa, sem açúcar.",
    description:
      "Um café de processo honey, com uma doçura envolvente e textura de xarope leve. A acidez é macia, quase de fruta em calda, e o final lembra amêndoa torrada. Elegante em qualquer método.",
    story:
      "Produzido na zona de Los Santos, a sul de San José, por uma família que há três gerações seca o café em estufa. O processo honey deixa parte da mucilagem no grão, criando aquela doçura que nos fez escolher este lote.",
    profile: { acidez: 3, corpo: 4, doçura: 5, amargor: 2 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 11.2 },
      { id: "500g", label: "500 g", grams: 500, price: 20.2 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 36.9 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 18,
    labels: ["Novo", "Processo honey"],
    rating: 4.9,
    reviewCount: 27,
    roastDate: "2026-10-14",
    producer: "Família Solís · Los Santos",
    altitude: "1 650 m",
    variety: "Caturra e Catuai",
    process: "Honey",
    brewSuggestion: "Filtro, Aeropress ou prensa. Água a 93 °C para realçar a doçura.",
    images: [
      { src: "images/products/costa-rica-tarrazu.webp", alt: "Embalagem areia da Torra Lusa para o café Costa Rica Tarrazú, lote 05 de 2026" },
      { src: "images/tasting.webp", alt: "Tábua com várias chávenas de café para prova, vista de cima" },
      { src: "images/cafe-table.webp", alt: "Mesa de café junto a uma janela com prensa francesa e plantas" },
    ],
    addedAt: "2026-10-02",
    bestseller: false,
    newArrival: true,
  },
  {
    id: "blend-ribeira",
    name: 'Blend da Casa "Ribeira"',
    subtitle: "O nosso espresso de todos os dias",
    category: "cafe",
    kind: "coffee",
    origin: "Multiorigem",
    region: "Porto",
    roast: "media-escura",
    notes: ["Chocolate", "Amêndoa", "Caramelo"],
    shortNotes: "Chocolate · amêndoa · caramelo",
    tagline: "Criado para a chávena pequena e para o dia inteiro.",
    description:
      "Equilibrado, generoso e previsível no melhor sentido. O Ribeira junta Brasil e Colômbia numa torra média-escura pensada para espresso, com corpo suficiente para o leite e um final de caramelo que fica.",
    story:
      "Nasceu no balcão da Rua Miguel Bombarda, em 2019, porque queríamos um café que funcionasse tanto na nossa máquina antiga como na de casa dos nossos clientes. É o blend que servimos todos os dias na loja.",
    profile: { acidez: 2, corpo: 5, doçura: 4, amargor: 3 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 7.5 },
      { id: "500g", label: "500 g", grams: 500, price: 13.6 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 24.9 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 56,
    labels: ["Mais vendido", "Blend da casa"],
    rating: 4.9,
    reviewCount: 204,
    roastDate: "2026-10-14",
    producer: "Blend Torra Lusa · Brasil + Colômbia",
    altitude: "1 100–1 750 m",
    variety: "Caturra, Castillo e Mundo Novo",
    process: "Natural e lavado",
    brewSuggestion: "Espresso: 18 g para 36 g em 27–30 s. Também excelente em moka.",
    images: [
      { src: "images/products/blend-ribeira.webp", alt: "Embalagem verde-clara da Torra Lusa para o Blend da Casa Ribeira, lote 06 de 2026" },
      { src: "images/cafe-table.webp", alt: "Prensa francesa e chávenas numa mesa inundada de luz natural" },
      { src: "images/coffee-drip.webp", alt: "Café a ser vertido lentamente sobre uma chávena" },
    ],
    addedAt: "2026-05-14",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "blend-aliados",
    name: 'Blend da Casa "Aliados"',
    subtitle: "Escuro, denso e de final longo",
    category: "cafe",
    kind: "coffee",
    origin: "Multiorigem",
    region: "Porto",
    roast: "escura",
    notes: ["Cacau", "Especiarias", "Nozes"],
    shortNotes: "Cacau · especiarias · nozes",
    tagline: "Para quem gosta do café a puxar para o intenso.",
    description:
      "Um blend de torra escura, sem nunca chegar a queimado. O cacau amargo e as especiarias fazem dele o par ideal para leite e para manhãs que pedem decididamente um café.",
    story:
      "É a resposta da casa a quem nos pedia «mais forte». Trabalhámos a curva de torra durante meses para manter a doçura das origens e evitar o amargo seco. O resultado tem o nome da praça que fica a dois passos da torrefação.",
    profile: { acidez: 1, corpo: 5, doçura: 3, amargor: 4 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 8.2 },
      { id: "500g", label: "500 g", grams: 500, price: 14.9 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 27.5 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 29,
    labels: ["Blend da casa"],
    rating: 4.7,
    reviewCount: 91,
    roastDate: "2026-10-14",
    producer: "Blend Torra Lusa · Brasil + Guatemala",
    altitude: "1 200–1 600 m",
    variety: "Mundo Novo e Bourbon",
    process: "Natural e lavado",
    brewSuggestion: "Espresso ou moka; com leite vaporizado fica particularmente cremoso.",
    images: [
      { src: "images/products/blend-aliados.webp", alt: "Embalagem castanha da Torra Lusa para o Blend da Casa Aliados, lote 07 de 2026" },
      { src: "images/coffee-cup.webp", alt: "Chávena de café escuro numa mesa de madeira quente" },
      { src: "images/cafe-interior.webp", alt: "Interior de uma cafetaria com plantas e luz natural" },
    ],
    addedAt: "2026-06-21",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "descafeinado-natural",
    name: "Descafeinado Natural",
    subtitle: "Cacau, avelã e tâmara — sem cafeína",
    category: "cafe",
    kind: "coffee",
    origin: "Colômbia",
    region: "Tolima",
    roast: "media",
    notes: ["Cacau", "Avelã", "Tâmara"],
    shortNotes: "Cacau · avelã · tâmara",
    tagline: "O prazer do café, mesmo depois do jantar.",
    description:
      "Descafeinado por processo natural à base de cana-de-açúcar, sem solventes químicos. Mantém o corpo e a doçura do café original, com delicadas notas de cacau e tâmara.",
    story:
      "Escolhemos este lote colombiano porque continuava a saber a café a sério depois da descafeinização. É processado perto da origem, com vapor e extracto de cana-de-açúcar, e provado antes de seguir para o Porto.",
    profile: { acidez: 2, corpo: 4, doçura: 4, amargor: 2 },
    formats: [
      { id: "250g", label: "250 g", grams: 250, price: 8.5 },
      { id: "500g", label: "500 g", grams: 500, price: 15.3 },
      { id: "1kg", label: "1 kg", grams: 1000, price: 27.9 },
    ],
    grinds: COFFEE_GRINDS,
    subscription: true,
    stock: 21,
    labels: ["Sem cafeína", "Processo natural"],
    rating: 4.8,
    reviewCount: 73,
    roastDate: "2026-10-14",
    producer: "Família Rodríguez · Tolima",
    altitude: "1 400 m",
    variety: "Caturra",
    process: "Descafeinado natural · cana-de-açúcar",
    brewSuggestion: "Filtro, prensa ou espresso. Ideal para a última chávena do dia.",
    images: [
      { src: "images/products/descafeinado-natural.webp", alt: "Embalagem natural da Torra Lusa para o café Descafeinado Natural, lote 08 de 2026" },
      { src: "images/cup-black.webp", alt: "Chávena de café preto em contraluz sobre uma mesa" },
      { src: "images/cup-shadow.webp", alt: "Chávena de café vista de cima com uma sombra longa e desenhada" },
    ],
    addedAt: "2026-07-12",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "capsulas-etiopia",
    name: "Cápsulas Etiópia Guji",
    subtitle: "O floral de Guji, em cápsula",
    category: "capsulas",
    kind: "capsules",
    origin: "Etiópia",
    region: "Guji",
    roast: "clara",
    notes: ["Jasmim", "Frutas vermelhas", "Mel"],
    shortNotes: "Jasmim · frutas vermelhas · mel",
    tagline: "Uma origem única à distância de um gesto.",
    description:
      "O nosso Etiópia Guji em cápsulas de alumínio reciclável, compatíveis com máquinas Nespresso®. Uma cápsula de 5,5 g para uma chávena luminosa, floral e surpreendentemente doce.",
    story:
      "A mesma torra clara do nosso café em grão, calibrada para a extração curta das máquinas domésticas. As cápsulas são enchidas no Porto e vêm em caixas de cartão reciclado.",
    profile: { acidez: 5, corpo: 2, doçura: 4, amargor: 1 },
    formats: [
      { id: "10caps", label: "10 cápsulas", grams: 55, price: 6.9 },
      { id: "30caps", label: "30 cápsulas", grams: 165, price: 17.9 },
    ],
    grinds: null,
    subscription: true,
    stock: 46,
    labels: ["Compatível Nespresso®", "Novo"],
    rating: 4.7,
    reviewCount: 58,
    roastDate: "2026-10-14",
    producer: "Buku Sayisa · Cooperativa Guji",
    altitude: "1 950 m",
    variety: "Heirloom",
    process: "Lavado",
    brewSuggestion: "Usar na máquina. Não furar nem abrir a cápsula. Intensidade média.",
    images: [
      { src: "images/products/capsulas-etiopia.webp", alt: "Caixa creme de cápsulas Torra Lusa Etiópia Guji com três cápsulas à frente" },
      { src: "images/cups-row.webp", alt: "Três chávenas de café com latte art alinhadas numa mesa" },
      { src: "images/coffee-beans.webp", alt: "Grãos de café torrados espalhados sobre uma superfície" },
    ],
    addedAt: "2026-10-05",
    bestseller: false,
    newArrival: true,
  },
  {
    id: "capsulas-ribeira",
    name: "Cápsulas Blend Ribeira",
    subtitle: "O espresso da casa, em cápsula",
    category: "capsulas",
    kind: "capsules",
    origin: "Multiorigem",
    region: "Porto",
    roast: "media-escura",
    notes: ["Chocolate", "Amêndoa", "Caramelo"],
    shortNotes: "Chocolate · amêndoa · caramelo",
    tagline: "Para quem não quer negociar o café da manhã.",
    description:
      "O Blend Ribeira numa cápsula prática para o dia a dia. Corpo redondo, chocolate e um final de caramelo que se dá bem com um pouco de leite.",
    story:
      "Mantemos o café em grão e as cápsulas com a mesma data de torra. A embalagem exterior é cartão FSC e o alumínio das cápsulas pode ser entregue na loja para reciclagem.",
    profile: { acidez: 2, corpo: 5, doçura: 4, amargor: 3 },
    formats: [
      { id: "10caps", label: "10 cápsulas", grams: 55, price: 6.2 },
      { id: "30caps", label: "30 cápsulas", grams: 165, price: 15.9 },
    ],
    grinds: null,
    subscription: true,
    stock: 72,
    labels: ["Mais vendido", "Compatível Nespresso®"],
    rating: 4.8,
    reviewCount: 137,
    roastDate: "2026-10-14",
    producer: "Blend Torra Lusa",
    altitude: "1 100–1 750 m",
    variety: "Caturra, Castillo e Mundo Novo",
    process: "Natural e lavado",
    brewSuggestion: "Usar na máquina. Não furar nem abrir a cápsula. Serve bem café curto e longo.",
    images: [
      { src: "images/products/capsulas-ribeira.webp", alt: "Caixa verde de cápsulas Torra Lusa Blend Ribeira com três cápsulas à frente" },
      { src: "images/cafe-table.webp", alt: "Mesa com prensa francesa e chávenas junto a uma janela" },
      { src: "images/cups-row.webp", alt: "Três chávenas de café com desenhos de latte art" },
    ],
    addedAt: "2026-05-28",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "moinho-manual",
    name: "Moinho manual de precisão",
    subtitle: "Mói com calma, afina o sabor",
    category: "acessorios",
    kind: "accessory",
    origin: null,
    region: null,
    roast: null,
    notes: ["Em aço inoxidável", "Mós cónicas", "40 cliques"],
    shortNotes: "Aço inoxidável · mós cónicas · 40 cliques",
    tagline: "O primeiro gesto do ritual.",
    description:
      "Um moinho manual robusto e silencioso, com mós cónicas de aço e 40 definições de moagem. Cabe na mão, viaja contigo e permite passar do espresso à prensa francesa sem trocar de equipamento.",
    story:
      "Escolhemos este moinho porque é fácil de afinar, simples de limpar e não faz barulho antes das oito da manhã. A manivela em madeira de freixo é montada à mão em Portugal.",
    profile: null,
    formats: [{ id: "unico", label: "Unidade", grams: 0, price: 49 }],
    grinds: null,
    subscription: false,
    stock: 12,
    labels: ["Escolha da casa"],
    rating: 4.8,
    reviewCount: 46,
    roastDate: null,
    producer: "Aço inoxidável · madeira de freixo",
    altitude: null,
    variety: null,
    process: "Mós cónicas de 38 mm · 40 cliques",
    brewSuggestion: "Recomendado para filtro, moka, Aeropress e prensa. Para espresso, requer alguma paciência.",
    images: [
      { src: "images/espresso-tools.webp", alt: "Acessórios de café dispostos sobre uma mesa de madeira, incluindo porta-filtros e colher de dose" },
      { src: "images/pour-over.webp", alt: "Preparação de café por filtro sobre uma bancada" },
      { src: "images/coffee-beans.webp", alt: "Grãos de café prontos a moer" },
    ],
    addedAt: "2026-03-14",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "v60-ceramica",
    name: "V60 de cerâmica",
    subtitle: "O filtro que torna o café um momento",
    category: "acessorios",
    kind: "accessory",
    origin: null,
    region: null,
    roast: null,
    notes: ["Cerâmica", "Porcelana", "Para 1 a 4 chávenas"],
    shortNotes: "Cerâmica · 1 a 4 chávenas",
    tagline: "Uma forma simples, uma chávena limpa.",
    description:
      "Um cone V60 em cerâmica branca mate, com as nervuras clássicas que ajudam o café a extrair de forma uniforme. Para uma ou duas chávenas generosas, com filtros de papel próprios.",
    story:
      "Escolhido em conjunto com o nosso barista para a loja da Miguel Bombarda. A cerâmica mantém a temperatura estável e a base larga assenta bem em qualquer caneca ou servidor.",
    profile: null,
    formats: [{ id: "unico", label: "Tamanho 02", grams: 0, price: 24 }],
    grinds: null,
    subscription: false,
    stock: 17,
    labels: ["Essencial"],
    rating: 4.9,
    reviewCount: 38,
    roastDate: null,
    producer: "Cerâmica vitrificada · fabrico europeu",
    altitude: null,
    variety: null,
    process: "Tamanho 02 · 1 a 4 chávenas · base de 11 cm",
    brewSuggestion: "Par ideal com os nossos filtros de papel. Recomendamos 15 g de café para 250 ml de água.",
    images: [
      { src: "images/pour-over.webp", alt: "Café a ser preparado num filtro sobre uma chávena, em luz natural" },
      { src: "images/coffee-drip.webp", alt: "Café a ser vertido lentamente num filtro de papel" },
      { src: "images/cafe-table.webp", alt: "Mesa de café com prensa francesa e chávenas" },
    ],
    addedAt: "2026-04-09",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "filtros-v60",
    name: "Filtros V60 · 100 unidades",
    subtitle: "Papel não branqueado",
    category: "acessorios",
    kind: "accessory",
    origin: null,
    region: null,
    roast: null,
    notes: ["100 unidades", "Tamanho 02", "Papel FSC"],
    shortNotes: "100 unidades · tamanho 02 · FSC",
    tagline: "Para o café de amanhã e do mês inteiro.",
    description:
      "Cem filtros de papel não branqueado, tamanho 02, para cones V60. A espessura certa para uma extração limpa, sem deixar sabor a papel.",
    story:
      "Filtros compatíveis com o nosso V60 de cerâmica, certificados FSC e embalados em papel reciclado. Um pacote dura cerca de três meses de cafés diários para uma pessoa.",
    profile: null,
    formats: [{ id: "unico", label: "100 unidades", grams: 0, price: 9.5 }],
    grinds: null,
    subscription: false,
    stock: 64,
    labels: ["Papel FSC"],
    rating: 4.8,
    reviewCount: 22,
    roastDate: null,
    producer: "Papel não branqueado certificado FSC",
    altitude: null,
    variety: null,
    process: "Tamanho 02 · compatível com cones V60 de 1 a 4 chávenas",
    brewSuggestion: "Passar água quente pelo filtro antes de adicionar o café, para retirar qualquer sabor a papel.",
    images: [
      { src: "images/coffee-drip.webp", alt: "Água a passar por café moído num filtro de papel" },
      { src: "images/tasting.webp", alt: "Várias chávenas de café dispostas para prova" },
      { src: "images/pour-over.webp", alt: "Preparação de café de filtro sobre uma chávena" },
    ],
    addedAt: "2026-04-09",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "prensa-francesa",
    name: "Prensa francesa de 600 ml",
    subtitle: "Vidro borossilicato e aço",
    category: "acessorios",
    kind: "accessory",
    origin: null,
    region: null,
    roast: null,
    notes: ["600 ml", "Vidro borossilicato", "Filtro em aço"],
    shortNotes: "600 ml · vidro borossilicato · aço",
    tagline: "Café por infusão, sem pressa.",
    description:
      "Uma prensa francesa de linhas limpas, com 600 ml e filtro de aço inoxidável em quatro peças. Faz três chávenas generosas e é a forma mais descomplicada de começar na especialidade.",
    story:
      "É o equipamento que mais recomendamos a quem está a começar. O vidro borossilicato resiste às variações de temperatura e pode ser lavado na máquina. Esgotada temporariamente — nova produção prevista para novembro.",
    profile: null,
    formats: [{ id: "unico", label: "600 ml", grams: 0, price: 34 }],
    grinds: null,
    subscription: false,
    stock: 0,
    labels: ["Esgotado"],
    rating: 4.7,
    reviewCount: 31,
    roastDate: null,
    producer: "Vidro borossilicato · aço inoxidável",
    altitude: null,
    variety: null,
    process: "600 ml · 3 chávenas · filtro de 4 peças",
    brewSuggestion: "Moagem grossa, 30 g de café para 500 ml de água, infusão de 4 minutos.",
    images: [
      { src: "images/cafe-table.webp", alt: "Prensa francesa e chávenas numa mesa iluminada por luz natural" },
      { src: "images/cafe-interior.webp", alt: "Interior acolhedor de uma cafetaria" },
      { src: "images/beans-bowl.webp", alt: "Grãos de café numa tigela branca" },
    ],
    addedAt: "2026-02-18",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "chavenas-ceramica",
    name: "Chávenas de cerâmica · par",
    subtitle: "Areia mate, feitas à mão",
    category: "acessorios",
    kind: "accessory",
    origin: null,
    region: null,
    roast: null,
    notes: ["Par", "Cerâmica", "180 ml"],
    shortNotes: "Par · cerâmica · 180 ml",
    tagline: "Para tornar a pausa um lugar.",
    description:
      "Duas chávenas de cerâmica em tom areia, com interior branco e 180 ml de capacidade. A parede espessa mantém o café quente e assenta bem na mão. Cada peça tem pequenas variações, porque é feita à mão.",
    story:
      "Desenhadas com um pequeno atelier de cerâmica de Aveiro. O esmalte mate é feito em pequenos lotes e a base é lixada à mão. Vendidas em pares, para poder haver sempre alguém com quem partilhar.",
    profile: null,
    formats: [{ id: "unico", label: "Par", grams: 0, price: 28 }],
    grinds: null,
    subscription: false,
    stock: 9,
    labels: ["Feito à mão"],
    rating: 4.9,
    reviewCount: 29,
    roastDate: null,
    producer: "Atelier de cerâmica em Aveiro",
    altitude: null,
    variety: null,
    process: "Cerâmica esmaltada · 180 ml · compatível com máquina de lavar",
    brewSuggestion: "Aquecer as chávenas com água quente antes de servir.",
    images: [
      { src: "images/ceramics.webp", alt: "Conjunto de chávenas de cerâmica em tons naturais sobre fundo claro" },
      { src: "images/cup-shadow.webp", alt: "Chávena de café com sombra elegante em fundo claro" },
      { src: "images/tasting.webp", alt: "Chávenas de café alinhadas para uma prova" },
    ],
    addedAt: "2026-03-30",
    bestseller: false,
    newArrival: false,
  },
  {
    id: "pack-descoberta",
    name: "Pack Descoberta",
    subtitle: "Três origens para encontrar a tua",
    category: "packs",
    kind: "pack",
    origin: "Multiorigem",
    region: null,
    roast: "media",
    notes: ["Etiópia", "Colômbia", "Brasil"],
    shortNotes: "Etiópia · Colômbia · Brasil",
    tagline: "Um voo de três chávenas pela nossa torra.",
    description:
      "Três cafés de 100 g para descobrir o que mais gostas: Etiópia Guji, Colômbia Huila e Brasil Cerrado. Vêm moídos à tua escolha ou em grão, numa caixa que explica cada origem em duas linhas.",
    story:
      "O pack que gostaríamos de ter tido quando começámos. Foi pensado para ser oferecido, mas também para quem quer perceber a diferença entre uma torra clara floral e um café mais doce e encorpado. Inclui um cartão de prova para anotares as tuas impressões.",
    profile: { acidez: 4, corpo: 3, doçura: 4, amargor: 2 },
    formats: [{ id: "unico", label: "3 × 100 g", grams: 300, price: 19.9 }],
    grinds: COFFEE_GRINDS,
    subscription: false,
    stock: 25,
    labels: ["Oferta", "Guia de prova"],
    rating: 4.9,
    reviewCount: 67,
    roastDate: "2026-10-14",
    producer: "Selecção Torra Lusa · três origens",
    altitude: "Variável",
    variety: "Heirloom, Castillo, Caturra e Mundo Novo",
    process: "Lavado e natural",
    brewSuggestion: "Prova os três no mesmo método e com a mesma água. Anota o que muda.",
    images: [
      { src: "images/products/pack-descoberta.webp", alt: "Caixa creme do Pack Descoberta Torra Lusa com três mini embalagens de café" },
      { src: "images/tasting.webp", alt: "Chávenas de café em prova sobre uma mesa" },
      { src: "images/gift.webp", alt: "Pequeno conjunto de café para oferta, com chávenas e luz quente" },
    ],
    addedAt: "2026-09-12",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "pack-presente",
    name: "Pack Presente",
    subtitle: "Um café e uma chávena para oferecer",
    category: "packs",
    kind: "pack",
    origin: "Multiorigem",
    region: null,
    roast: "media",
    notes: ["Café 250 g", "Chávena artesanal", "Nota manuscrita"],
    shortNotes: "Café 250 g · chávena artesanal · nota manuscrita",
    tagline: "Um presente que se bebe devagar.",
    description:
      "Um café de 250 g à escolha, uma chávena de cerâmica feita em Aveiro e um cartão escrito à mão com a tua mensagem. Chega embalado em caixa de presente e sem preços visíveis.",
    story:
      "É o nosso presente mais pedido e o que a Ana e o Pedro mais gostam de preparar na loja. Diz-nos a mensagem no campo de notas do checkout e nós escrevemos o cartão com caneta de tinta permanente.",
    profile: null,
    formats: [{ id: "unico", label: "Café 250 g + chávena", grams: 250, price: 34.9 }],
    grinds: COFFEE_GRINDS,
    subscription: false,
    stock: 14,
    labels: ["Oferta", "Mais vendido"],
    rating: 4.9,
    reviewCount: 52,
    roastDate: "2026-10-14",
    producer: "Café Torra Lusa + cerâmica de Aveiro",
    altitude: "Variável",
    variety: "Conforme o café escolhido",
    process: "Conforme o café escolhido",
    brewSuggestion: "Escolhe um dos nossos cafés e indica a moagem; nós tratamos do resto.",
    images: [
      { src: "images/products/pack-presente.webp", alt: "Caixa de presente bordô do Pack Presente Torra Lusa com mini embalagens de café" },
      { src: "images/gift.webp", alt: "Chávenas e café preparados como oferta, com luz de velas" },
      { src: "images/ceramics.webp", alt: "Chávenas de cerâmica artesanal em tons naturais" },
    ],
    addedAt: "2026-09-01",
    bestseller: true,
    newArrival: false,
  },
  {
    id: "pack-ritual",
    name: "Pack Ritual V60",
    subtitle: "Tudo o que precisas para começar",
    category: "packs",
    kind: "pack",
    origin: "Multiorigem",
    region: null,
    roast: "media",
    notes: ["Café 250 g", "V60 cerâmica", "40 filtros"],
    shortNotes: "Café 250 g · V60 · 40 filtros",
    tagline: "O ritual completo, numa caixa só.",
    description:
      "Um V60 de cerâmica, 40 filtros de papel e um café de 250 g à escolha. O ponto de partida para preparar café de filtro em casa, com um pequeno guia de preparação incluído.",
    story:
      "Criado depois de tantas conversas ao balcão sobre por onde começar num café de filtro. Escolhemos os materiais certos, retirámos o que era acessório e juntámos um cartão com três receitas muito simples.",
    profile: null,
    formats: [{ id: "unico", label: "Kit completo", grams: 250, price: 49.9 }],
    grinds: COFFEE_GRINDS,
    subscription: false,
    stock: 11,
    labels: ["Novo", "Kit completo"],
    rating: 4.8,
    reviewCount: 19,
    roastDate: "2026-10-14",
    producer: "V60 de cerâmica + filtros FSC + café Torra Lusa",
    altitude: "Variável",
    variety: "Conforme o café escolhido",
    process: "Conforme o café escolhido",
    brewSuggestion: "Receita: 15 g para 250 ml, 92–94 °C, em três despejos. Guia incluído.",
    images: [
      { src: "images/products/pack-ritual.webp", alt: "Caixa verde do Pack Ritual V60 Torra Lusa com mini embalagens de café" },
      { src: "images/pour-over.webp", alt: "Café a ser preparado num V60 com água quente" },
      { src: "images/coffee-drip.webp", alt: "Café de filtro a ser vertido numa chávena" },
    ],
    addedAt: "2026-10-08",
    bestseller: false,
    newArrival: true,
  },
];

/** Utilitários do catálogo */

export const getProduct = (id) => PRODUCTS.find((product) => product.id === id) || null;

export const getStartingPrice = (product) =>
  Math.min(...product.formats.map((format) => format.price));

export const getFormat = (product, formatId) =>
  product.formats.find((format) => format.id === formatId) || product.formats[0];

export const isAvailable = (product) => product.stock > 0;

export const isLowStock = (product) => product.stock > 0 && product.stock <= 8;

/** O desconto de subscrição de 10 % é aplicado ao preço da linha. */
export const getUnitPrice = (product, formatId, subscription = false) => {
  const format = getFormat(product, formatId);
  if (!format) return 0;
  return subscription && product.subscription
    ? Math.round(format.price * 0.9 * 100) / 100
    : format.price;
};

export const getSubscriptionSaving = (product, formatId) => {
  const format = getFormat(product, formatId);
  if (!format || !product.subscription) return 0;
  return Math.round((format.price - format.price * 0.9) * 100) / 100;
};

/**
 * Poupança por 100 g em relação ao formato mais pequeno.
 * Devolve uma percentagem inteira ou 0 quando não se aplica.
 */
export const getSavingPer100g = (product, formatId) => {
  if (!product.formats || product.formats.length < 2) return 0;
  const base = product.formats[0];
  const format = getFormat(product, formatId);
  if (!format || !base.grams || !format.grams || format.grams <= base.grams) return 0;
  const base100 = base.price / (base.grams / 100);
  const format100 = format.price / (format.grams / 100);
  return Math.max(0, Math.round((1 - format100 / base100) * 100));
};

export const getBestsellers = (limit = 4) =>
  PRODUCTS.filter((product) => product.bestseller).slice(0, limit);

export const getNewArrivals = (limit = 4) =>
  [...PRODUCTS].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit);

export const getRelatedProducts = (product, limit = 4) => {
  const sameCategory = PRODUCTS.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category
  );
  const fallback = PRODUCTS.filter(
    (candidate) =>
      candidate.id !== product.id &&
      candidate.category !== product.category &&
      (candidate.bestseller || candidate.newArrival)
  );
  return [...sameCategory, ...fallback]
    .sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.rating - a.rating)
    .slice(0, limit);
};

/** Para a secção “Combina bem com”: café → acessórios, acessório → café. */
export const getPairings = (product, limit = 3) => {
  if (product.category === "acessorios" || product.category === "packs") {
    return PRODUCTS.filter((candidate) => candidate.category === "cafe" && candidate.bestseller)
      .slice(0, limit);
  }
  if (product.category === "capsulas") {
    return PRODUCTS.filter(
      (candidate) => candidate.category === "acessorios" && candidate.id !== product.id && candidate.stock > 0
    ).slice(0, limit);
  }
  return PRODUCTS.filter(
    (candidate) => candidate.category === "acessorios" && candidate.id !== product.id && candidate.stock > 0
  ).slice(0, limit);
};

export const getProductReviews = (product) => {
  if (!product) return [];
  const offset = product.id.length % 3;
  return [0, 1, 2].map((index) => {
    const review = PRODUCT_REVIEWS[(index + offset) % PRODUCT_REVIEWS.length];
    return { ...review };
  });
};

/** Pesquisa tolerante a acentos. */
export const normalizeText = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const searchProducts = (query) => {
  const term = normalizeText(query.trim());
  if (!term) return PRODUCTS;
  return PRODUCTS.filter((product) =>
    normalizeText(
      [
        product.name,
        product.subtitle,
        product.origin,
        product.region,
        ...product.notes,
        CATEGORIES[product.category]?.label,
        product.kind === "coffee" ? "grão moído café" : "",
      ].join(" ")
    ).includes(term)
  );
};

/**
 * Guia “Encontra o teu café”.
 * As respostas chegam como { brew, flavour, format } e devolvem 2 cafés.
 */
export const recommendCoffees = ({ brew = "filtro", flavour = "equilibrado", format = "grao" } = {}) => {
  const flavourScores = {
    frutado: (p) => p.profile.acidez * 2 + p.profile.doçura,
    doce: (p) => p.profile.doçura * 2 + p.profile.corpo,
    intenso: (p) => p.profile.corpo * 2 + p.profile.amargor,
    equilibrado: (p) => 10 - Math.abs(p.profile.acidez - 3) - Math.abs(p.profile.amargor - 2),
  };
  const brewBonus = {
    espresso: (p) => p.profile.corpo + (p.roast === "escura" || p.roast === "media-escura" ? 3 : 0),
    filtro: (p) => (p.roast === "clara" || p.roast === "media" ? 3 : 0) + p.profile.acidez,
    prensa: (p) => p.profile.corpo + p.profile.doçura,
    explorar: () => 0,
  };
  const score = flavourScores[flavour] || flavourScores.equilibrado;
  const bonus = brewBonus[brew] || brewBonus.filtro;
  const recommended = PRODUCTS.filter(
    (product) => product.category === "cafe" && product.kind === "coffee" && product.stock > 0
  )
    .map((product) => ({ product, score: score(product) + bonus(product) }))
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
    .slice(0, 2)
    .map((item) => item.product);
  return { coffees: recommended, format, brew };
};

export const formatForGrind = (grindId) => GRINDS[grindId] || GRINDS.grao;
