# Torra Lusa

Loja de café de especialidade fictícia, com identidade editorial portuguesa e um percurso de compra completo em HTML, CSS e JavaScript nativo. O projeto não usa frameworks, bundler nem backend: abre-se a partir de um servidor estático e guarda os dados simulados no próprio navegador.

## Começar

O JavaScript usa módulos ES, por isso o site deve ser servido por HTTP. Abrir `index.html` diretamente com `file://` impede o carregamento dos módulos.

```bash
# Na raiz do projeto
python -m http.server 4173
```

Depois, abrir <http://localhost:4173>.

Alternativas:

```bash
npx serve .
# ou
php -S localhost:4173
```

Não é necessário instalar dependências, executar build ou configurar variáveis de ambiente.

## Publicação

- Produção: <https://torra-lusa.vercel.app>
- Repositório: <https://github.com/MateusMendes17/torra-lusa>

O projeto está ligado ao GitHub e à Vercel. Cada push para `main` deve gerar um novo deployment de produção. Se for ligado um domínio próprio, atualiza os `canonical`, as URLs Open Graph e de JSON-LD, `sitemap.xml`, `robots.txt` e as referências em `js/product.js`.

## Percurso disponível

1. `index.html` — entrada editorial, destaques, subscrição e histórias de origem.
2. `loja.html` — catálogo com pesquisa, filtros, ordenação e estado refletido no URL.
3. `produto.html?id=etiopia-guji` — página dinâmica com galeria, variantes, moagem, reviews, produtos relacionados e subscrição.
4. `carrinho.html` — carrinho persistente, quantidades, códigos promocionais e portes.
5. `checkout.html` — quatro passos: contacto, envio, pagamento e revisão.
6. `confirmacao.html` — confirmação simulada com número de encomenda, resumo e estado vazio.
7. `sobre.html`, `contactos.html`, `faq.html`, `envios-devolucoes.html`, `privacidade.html` e `termos.html` — páginas institucionais e legais.
8. `design-system.html` — referência visual interna, marcada como `noindex`.

O cabeçalho, o rodapé, o carrinho lateral, o botão de WhatsApp e o banner de cookies são injetados por `js/components.js` através de `js/main.js`. O conteúdo principal de cada página permanece em HTML estático para SEO.

## Estrutura

```text
.
├── index.html, loja.html, produto.html, carrinho.html
├── checkout.html, confirmacao.html
├── sobre.html, contactos.html, faq.html
├── envios-devolucoes.html, privacidade.html, termos.html
├── design-system.html
├── css/style.css
├── js/
│   ├── main.js          # arranque, chrome partilhado, formulários e newsletter
│   ├── components.js    # header, footer, ícones, cartões e drawers
│   ├── data.js          # dados da loja, envio, pagamentos, promoções e legal
│   ├── products.js      # catálogo com 18 produtos
│   ├── home.js          # interações da homepage
│   ├── shop.js          # filtros e pesquisa da loja
│   ├── product.js       # renderização da página de produto
│   ├── cart.js          # estado e regras do carrinho
│   ├── cart-page.js     # página do carrinho
│   ├── checkout.js      # checkout em quatro passos
│   ├── confirmation.js  # leitura da encomenda simulada
│   ├── contact.js       # validação do formulário de contacto
│   └── analytics.js     # eventos locais e consentimento
├── images/
│   ├── favicon.svg      # monograma da marca
│   ├── products/        # maquetas editoriais 4:5
│   └── *.webp           # fotografias de ambiente
├── sitemap.xml
├── robots.txt
└── README.md
```

## Editar a loja

### Catálogo

O catálogo está em `js/products.js`. Cada artigo segue a mesma estrutura:

- `id`, `name`, `subtitle`, `category`, `kind`;
- `origin`, `region`, `roast`, `notes`, `shortNotes`;
- `description`, `story`, `profile`, `producer`, `altitude`, `variety`, `process`;
- `formats` (peso e preço), `grinds`, `subscription`, `stock`, `labels`;
- `rating`, `reviewCount`, `roastDate`, `brewSuggestion`, `images`;
- `addedAt`, `bestseller`, `newArrival`.

Para acrescentar um produto, copia um artigo existente, altera o `id` e todos os campos. As imagens devem estar em `images/products/` e manter a proporção 4:5. A primeira imagem é usada nos cartões e no carrinho.

As categorias e os filtros são derivados do próprio catálogo; se introduzires uma nova categoria, confirma os rótulos em `js/shop.js` e nos estilos de filtros.

### Dados globais

`js/data.js` centraliza:

- identidade, contactos, morada e redes sociais em `SITE`;
- opções e preços de envio em `SHIPPING_OPTIONS`;
- métodos de pagamento em `PAYMENT_METHODS`;
- códigos promocionais em `PROMO_CODES`;
- placeholders legais em `SITE.legal` e nos textos de `termos.html`, `privacidade.html` e no rodapé;
- avaliações de produto e testemunhos.

O limite de portes grátis está em `SITE.freeShippingThreshold` e é aplicado pelo carrinho e pelo checkout, além de alimentar a barra de progresso e os textos dos componentes dinâmicos. Se alterares este valor, atualiza também as menções editoriais a “35 €” nos HTML e no testemunho de `js/data.js`. A subscrição aplica 10 % ao preço da linha. Os códigos `BEMVINDO10` e `CAFE5` estão disponíveis na demonstração.

### Conteúdo editorial

As páginas institucionais são HTML estático e podem ser editadas diretamente. Mantém:

- um único `h1` por página;
- `title`, `meta description`, `canonical`, Open Graph e JSON-LD atualizados;
- textos em português europeu e preços no formato `0,00 €`;
- ligações internas e IDs de âncoras válidos.

## Funcionalidades simuladas

Esta é uma demonstração de interface. Não existe backend, base de dados, envio de email, cobrança ou expedição real.

- O checkout valida os campos, calcula portes e totais, cria um número `TL-ANO-XXXX` e guarda a encomenda em `sessionStorage`.
- Os pagamentos com cartão, MB WAY, Multibanco e PayPal são apenas visuais. Nenhum número de cartão real deve ser introduzido.
- O formulário de contacto valida e guarda até 10 mensagens simuladas em `localStorage`.
- A newsletter guarda o email localmente, confirma a subscrição na interface e mostra o código `BEMVINDO10`.
- A medição de eventos é local e só é ativada quando o visitante aceita a opção “Aceitar”.
- O botão de WhatsApp abre uma conversa externa; não existe atendimento automático.

### Chaves de armazenamento

| Chave | Armazenamento | Função |
| --- | --- | --- |
| `torraLusaCart:v1` | `localStorage` | Carrinho |
| `torraLusaPromo:v1` | `localStorage` | Código promocional |
| `torraLusaConsent:v1` | `localStorage` | Preferência de cookies |
| `torraLusaAnalytics:v1` | `localStorage` | Eventos anónimos (máx. 80) |
| `torraLusaNewsletter:v1` | `localStorage` | Email submetido |
| `torraLusaMessages:v1` | `localStorage` | Mensagens de contacto simuladas |
| `torraLusaOrder:v1` | `sessionStorage` | Encomenda simulada |

A página `privacidade.html` inclui ações para apagar os dados locais e repor as preferências de cookies. O carrinho e as restantes leituras degradam com segurança quando o armazenamento está indisponível.

## Imagens

- As embalagens de café, cápsulas e packs em `images/products/` são maquetas editoriais geradas para a demonstração. Devem ser substituídas por fotografia real do produto, mantendo a proporção 4:5.
- As restantes imagens em `images/` são placeholders de ambiente. Foram convertidas para WebP, mas a origem individual não está documentada neste pacote. Antes de publicação comercial, confirma a licença de cada fotografia ou substitui-as por fotografia própria.
- As ilustrações e maquetas não devem ser apresentadas como fotografia real de um produto ou espaço.

## Acessibilidade

O projeto inclui:

- landmarks semânticos, skip link e hierarquia de títulos;
- foco visível, navegação por teclado, fecho por `Escape` e devolução de foco;
- formulários com rótulos, mensagens de erro e estados `aria-invalid`;
- suporte a `prefers-reduced-motion`;
- contraste orientado a WCAG AA e alvos de toque generosos.

Antes de publicar, testa com leitor de ecrã, zoom a 200 %, navegação apenas por teclado e os principais navegadores. O design system documenta os princípios visuais e os estados dos componentes.

## SEO

Cada página indexável inclui metadados, Open Graph e canonical. A homepage, a loja, o produto e a FAQ incluem JSON-LD. `sitemap.xml` e `robots.txt` apontam para `https://torra-lusa.vercel.app`; se o domínio mudar, atualiza também todos os `canonical` e URLs Open Graph.

Carrinho, checkout, confirmação e design system estão marcados como `noindex`. O checkout e a confirmação usam `nofollow`. A página de produto é dinâmica: atualiza o `canonical` e o `og:url` com o parâmetro `?id=` e as 18 variantes estão incluídas no `sitemap.xml`. Numa loja real, valeria a pena avaliar URLs de produto sem parâmetros, por exemplo `/produto/etiopia-guji`.

## Antes de publicar

- Substituir todas as maquetas e fotografias de ambiente por imagens licenciadas.
- Rever e completar os textos legais com um jurista.
- Preencher designação social, NIF, registo comercial, capital social, entidade RAL e contactos completos.
- Confirmar a política de privacidade, cookies, prazos de conservação e contratos com subcontratantes.
- Implementar pagamentos reais através de um prestador certificado; nunca guardar dados de cartão neste projeto.
- Ligar o checkout, a newsletter e o contacto a um backend seguro.
- Considerar o alojamento local dos tipos de letra para reduzir pedidos a terceiros.
- Configurar emails transacionais, faturação, stock e transporte reais.
- Atualizar `sitemap.xml`, `robots.txt` e os canais de apoio.
- Repetir os testes de acessibilidade, responsividade e percurso de compra.

## Notas técnicas

- HTML5 semântico, CSS com variáveis, Grid e Flexbox, JavaScript em módulos ES.
- Sem dependências de produção, build ou servidor de aplicação.
- Compatível com navegadores modernos com suporte a módulos ES, `dialog`, `details` e `localStorage`.
- Os ícones são SVG inline; não há biblioteca de ícones externa.
- A tipografia usa Google Fonts como dependência externa, com fallback local.

## Estado do projeto

Demonstração funcional de portfólio. O percurso loja → produto → carrinho → checkout → confirmação, o formulário de contacto, a newsletter, os códigos promocionais e os estados de erro foram pensados para serem testados localmente. Nenhuma compra é real.
