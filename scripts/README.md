# Análise de design com Playwright

Script em **JavaScript** que usa **Playwright** para abrir uma URL e extrair o design do site (cores, fontes, espaçamentos, elementos) para você replicar igual.

## Instalação

Na raiz do projeto:

```bash
npm install
npx playwright install chromium
```

Ou use o script:

```bash
npm run analyze-design:install
```

## Uso

```bash
node scripts/analyze-design.js <URL>
```

Exemplos:

```bash
node scripts/analyze-design.js https://exemplo.com
node scripts/analyze-design.js https://dashboard.algum-site.com
```

Ou com variável de ambiente:

```bash
ANALYZE_URL=https://exemplo.com node scripts/analyze-design.js
```

Ou pelo npm:

```bash
npm run analyze-design -- https://exemplo.com
```

## Saída

Tudo é salvo na pasta **`design-output/`** na raiz do projeto:

- **`<host>-full.png`** – screenshot da página inteira
- **`<host>-design-report.json`** – relatório completo: cores, fontes, estilos computados dos elementos, regras CSS de exemplo
- **`<host>-resumo.txt`** – resumo em texto: cores, fontes e estilos do `body`

Use o relatório JSON e o screenshot para replicar o design no seu front (cores, font-family, tamanhos, etc.).
