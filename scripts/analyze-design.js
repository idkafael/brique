/**
 * Script Playwright para explorar uma URL e analisar o design do site.
 * Uso: node scripts/analyze-design.js <URL>
 * Exemplo: node scripts/analyze-design.js https://exemplo.com
 *
 * Gera: screenshots + design-report.json com cores, fontes, espaçamentos.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'design-output');
const DEFAULT_VIEWPORT = { width: 1280, height: 800 };

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function extractDesignFromPage(page, url) {
  const report = {
    url,
    capturedAt: new Date().toISOString(),
    viewport: DEFAULT_VIEWPORT,
    colors: [],
    fonts: [],
    elements: [],
    styles: {},
    meta: {},
  };

  report.meta.title = await page.title();
  report.meta.viewport = await page.viewportSize();

  const colorSet = new Set();
  const fontSet = new Set();

  const elements = await page.$$('body *');
  const maxElements = Math.min(elements.length, 200);

  for (let i = 0; i < maxElements; i++) {
    const el = elements[i];
    try {
      const tagName = await el.evaluate((e) => e.tagName?.toLowerCase());
      const isVisible = await el.evaluate((e) => {
        const style = window.getComputedStyle(e);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
      if (!isVisible) continue;

      const box = await el.boundingBox();
      if (!box || box.width < 2 || box.height < 2) continue;

      const styles = await el.evaluate((e) => {
        const s = window.getComputedStyle(e);
        return {
          backgroundColor: s.backgroundColor,
          color: s.color,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          padding: s.padding,
          margin: s.margin,
          borderRadius: s.borderRadius,
          border: s.border,
          display: s.display,
          width: s.width,
          height: s.height,
        };
      });

      if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') colorSet.add(styles.color);
      if (styles.backgroundColor && !styles.backgroundColor.startsWith('rgba(0, 0, 0, 0)')) {
        colorSet.add(styles.backgroundColor);
      }
      if (styles.fontFamily) fontSet.add(styles.fontFamily);

      const text = await el.evaluate((e) => (e.textContent || '').trim().slice(0, 80));
      if (text || ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'button', 'input', 'a'].includes(tagName)) {
        report.elements.push({
          tag: tagName,
          text: text || null,
          rect: { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) },
          styles: {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            borderRadius: styles.borderRadius,
          },
        });
      }
    } catch {
      // skip element
    }
  }

  report.colors = Array.from(colorSet).filter(Boolean);
  report.fonts = Array.from(fontSet).filter(Boolean);

  const bodyStyles = await page.evaluate(() => {
    const s = window.getComputedStyle(document.body);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
    };
  });
  report.styles.body = bodyStyles;

  const allCss = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const out = [];
    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules.slice(0, 100)) {
          if (rule.selectorText && rule.cssText) out.push(rule.cssText.slice(0, 500));
        }
      } catch {
        // cross-origin
      }
    }
    return out.slice(0, 50);
  });
  report.styles.sampleCssRules = allCss;

  return report;
}

async function main() {
  const url = process.argv[2] || process.env.ANALYZE_URL;
  if (!url) {
    console.log('Uso: node scripts/analyze-design.js <URL>');
    console.log('Exemplo: node scripts/analyze-design.js https://exemplo.com');
    console.log('Ou: ANALYZE_URL=https://exemplo.com node scripts/analyze-design.js');
    process.exit(1);
  }

  await ensureDir(OUTPUT_DIR);

  console.log('Abrindo navegador...');
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Página carregada. Capturando screenshot...');
    const slug = new URL(url).hostname.replace(/\./g, '-');
    const screenshotPath = path.join(OUTPUT_DIR, `${slug}-full.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot salvo:', screenshotPath);

    console.log('Analisando design (cores, fontes, elementos)...');
    const report = await extractDesignFromPage(page, url);

    const reportPath = path.join(OUTPUT_DIR, `${slug}-design-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Relatório salvo:', reportPath);

    const summaryPath = path.join(OUTPUT_DIR, `${slug}-resumo.txt`);
    const summary = [
      `URL: ${url}`,
      `Título: ${report.meta.title}`,
      '',
      '--- Cores encontradas ---',
      ...report.colors.slice(0, 30),
      '',
      '--- Fontes encontradas ---',
      ...report.fonts.slice(0, 20),
      '',
      '--- Body ---',
      `background: ${report.styles.body?.backgroundColor}`,
      `color: ${report.styles.body?.color}`,
      `font-family: ${report.styles.body?.fontFamily}`,
      `font-size: ${report.styles.body?.fontSize}`,
    ].join('\n');
    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log('Resumo salvo:', summaryPath);

    console.log('\nResumo:');
    console.log('  Cores:', report.colors.length);
    console.log('  Fontes:', report.fonts.length);
    console.log('  Elementos analisados:', report.elements.length);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
