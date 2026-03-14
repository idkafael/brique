/**
 * Abre a dashboard do SharkBot no Brave, faz login (se necessário), tira screenshot e analisa design.
 * Uso local apenas – não subir este arquivo com credenciais depois; remover antes de commit.
 * Uso: node scripts/analyze-sharkbot.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const URL = 'https://sharkbot.com.br/dashboard';

/* Login SharkBot – só para análise local; remover antes de subir o repo */
const SHARKBOT_LOGIN = {
  email: 'eucontatorafael07@gmail.com',
  password: 'lukkasman123@',
};
const OUTPUT_DIR = path.join(__dirname, '..', 'design-output');
const VIEWPORT = { width: 1440, height: 900 };

function getBravePaths() {
  const platform = os.platform();
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

  if (platform === 'win32') {
    return {
      executablePath: [
        path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
        path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
        path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      ].find((p) => fs.existsSync(p)),
      userDataDir: path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'User Data'),
    };
  }
  if (platform === 'darwin') {
    return {
      executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      userDataDir: path.join(os.homedir(), 'Library', 'Application Support', 'BraveSoftware', 'Brave-Browser'),
    };
  }
  return {
    executablePath: null,
    userDataDir: path.join(os.homedir(), '.config', 'BraveSoftware', 'Brave-Browser'),
  };
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function tryLogin(page) {
  const email = process.env.SHARKBOT_EMAIL || SHARKBOT_LOGIN.email;
  const password = process.env.SHARKBOT_PASSWORD || SHARKBOT_LOGIN.password;
  if (!email || !password) return false;

  try {
    const emailEl = await page.$('input[type="email"]') || await page.$('input[name="email"]');
    const passEl = await page.$('input[type="password"]') || await page.$('input[name="password"]');
    if (!emailEl || !passEl) return false;

    await emailEl.fill(email);
    await passEl.fill(password);

    let submitted = false;
    const submitBtn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      submitted = true;
    }
    if (!submitted) await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    return true;
  } catch (_) {
    return false;
  }
}

async function extractDesign(page) {
  const report = {
    url: URL,
    capturedAt: new Date().toISOString(),
    viewport: VIEWPORT,
    colors: [],
    fonts: [],
    bodyStyles: null,
    headings: [],
    buttons: [],
    cards: [],
    cssVariables: [],
    meta: {},
  };

  report.meta.title = await page.title();

  report.bodyStyles = await page.evaluate(() => {
    const s = window.getComputedStyle(document.body);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
    };
  });

  report.cssVariables = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const vars = {};
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText === ':root' && rule.style) {
            for (let i = 0; i < rule.style.length; i++) {
              const name = rule.style[i];
              if (name.startsWith('--')) vars[name] = rule.style.getPropertyValue(name).trim();
            }
          }
        }
      } catch (_) {}
    }
    return vars;
  });

  const colorSet = new Set();
  const fontSet = new Set();

  const allElements = await page.$$('body *');
  for (let i = 0; i < Math.min(allElements.length, 300); i++) {
    try {
      const el = allElements[i];
      const visible = await el.evaluate((e) => {
        const s = window.getComputedStyle(e);
        return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0;
      });
      if (!visible) continue;

      const info = await el.evaluate((e) => {
        const s = window.getComputedStyle(e);
        const tag = e.tagName.toLowerCase();
        const rect = e.getBoundingClientRect();
        return {
          tag,
          text: (e.textContent || '').trim().slice(0, 100),
          color: s.color,
          backgroundColor: s.backgroundColor,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          borderRadius: s.borderRadius,
          padding: s.padding,
          margin: s.margin,
          width: rect.width,
          height: rect.height,
        };
      });

      if (info.color && !info.color.startsWith('rgba(0, 0, 0, 0)')) colorSet.add(info.color);
      if (info.backgroundColor && !info.backgroundColor.startsWith('rgba(0, 0, 0, 0)')) colorSet.add(info.backgroundColor);
      if (info.fontFamily) fontSet.add(info.fontFamily);

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(info.tag) && info.text) {
        report.headings.push({ tag: info.tag, text: info.text, ...info });
      }
      if (info.tag === 'button' || (info.tag === 'a' && info.width > 30 && info.height > 20)) {
        report.buttons.push(info);
      }
    } catch (_) {}
  }

  report.colors = Array.from(colorSet);
  report.fonts = Array.from(fontSet);

  return report;
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  const { executablePath, userDataDir } = getBravePaths();
  if (!executablePath || !fs.existsSync(executablePath)) {
    console.error('Brave não encontrado. Instale ou defina BRAVE_PATH no ambiente.');
    console.error('Exemplo: set BRAVE_PATH=C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe');
    process.exit(1);
  }

  if (!fs.existsSync(userDataDir)) {
    console.error('Pasta do perfil Brave não encontrada:', userDataDir);
    process.exit(1);
  }

  let context;
  let pageToUse;
  let usePersistent = true;

  try {
    console.log('Tentando abrir Brave com seu perfil (feche o Brave antes para ver a dashboard logada)...');
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      executablePath: process.env.BRAVE_PATH || executablePath,
      viewport: VIEWPORT,
      ignoreDefaultArgs: ['--enable-automation'],
      args: ['--no-first-run', '--no-default-browser-check'],
    });
    pageToUse = context.pages()[0] || await context.newPage();
  } catch (err) {
    if (err.message && (err.message.includes('closed') || err.message.includes('existente'))) {
      console.log('Perfil em uso (Brave aberto). Usando navegador temporário – você verá a tela de LOGIN.');
      console.log('Para capturar a DASHBOARD logada: feche o Brave e rode o script de novo.\n');
      const browser = await chromium.launch({
        headless: false,
        executablePath: process.env.BRAVE_PATH || executablePath,
        args: ['--no-first-run'],
      });
      context = browser;
      pageToUse = await browser.newPage();
      usePersistent = false;
    } else {
      throw err;
    }
  }

  if (pageToUse) await pageToUse.setViewportSize(VIEWPORT);

  try {
    console.log('Acessando', URL, '...');
    await pageToUse.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });

    await pageToUse.waitForTimeout(3000);

    if ((process.env.SHARKBOT_EMAIL && process.env.SHARKBOT_PASSWORD) || (SHARKBOT_LOGIN.email && SHARKBOT_LOGIN.password)) {
      console.log('Fazendo login com as credenciais das variáveis de ambiente...');
      const logged = await tryLogin(pageToUse);
      if (logged) {
        await pageToUse.waitForTimeout(3000);
        await pageToUse.goto(URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        await pageToUse.waitForTimeout(2000);
      }
    }

    await pageToUse.waitForTimeout(2000);

    const slug = 'sharkbot-dashboard';

    console.log('Tirando screenshot da viewport...');
    await pageToUse.screenshot({ path: path.join(OUTPUT_DIR, `${slug}-viewport.png`), fullPage: false });
    console.log('Tirando screenshot da página inteira...');
    await pageToUse.screenshot({ path: path.join(OUTPUT_DIR, `${slug}-full.png`), fullPage: true });

    console.log('Analisando fontes, cores e layout...');
    const report = await extractDesign(pageToUse);

    const reportPath = path.join(OUTPUT_DIR, `${slug}-design-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Relatório salvo:', reportPath);

    const resumo = [
      '=== SHARKBOT DASHBOARD - DESIGN ===',
      '',
      'Body:',
      `  background: ${report.bodyStyles?.backgroundColor}`,
      `  color: ${report.bodyStyles?.color}`,
      `  font-family: ${report.bodyStyles?.fontFamily}`,
      `  font-size: ${report.bodyStyles?.fontSize}`,
      '',
      'Cores únicas:',
      ...report.colors.map((c) => `  ${c}`),
      '',
      'Fontes:',
      ...report.fonts.map((f) => `  ${f}`),
      '',
      'CSS variables (:root):',
      ...Object.entries(report.cssVariables || {}).map(([k, v]) => `  ${k}: ${v}`),
    ].join('\n');
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}-resumo.txt`), resumo, 'utf8');
    console.log('Resumo salvo em', `${slug}-resumo.txt`);

    const captureUrl = process.env.SHARKBOT_CAPTURE_URL || process.argv[2];
    if (captureUrl) {
      console.log('\nAcessando URL adicional:', captureUrl);
      await pageToUse.goto(captureUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await pageToUse.waitForTimeout(3000);
      const slugFluxo = 'sharkbot-fluxos';
      await pageToUse.screenshot({ path: path.join(OUTPUT_DIR, `${slugFluxo}-viewport.png`), fullPage: false });
      await pageToUse.screenshot({ path: path.join(OUTPUT_DIR, `${slugFluxo}-full.png`), fullPage: true });
      const reportFluxo = await extractDesign(pageToUse);
      reportFluxo.url = captureUrl;
      fs.writeFileSync(path.join(OUTPUT_DIR, `${slugFluxo}-design-report.json`), JSON.stringify(reportFluxo, null, 2), 'utf8');
      console.log('Captura fluxos salva em', `${slugFluxo}-viewport.png e ${slugFluxo}-design-report.json`);
    }

    console.log('\nConcluído. Cores:', report.colors.length, '| Fontes:', report.fonts.length);
    console.log('Arquivos em design-output/');
    await pageToUse.waitForTimeout(3000);
  } finally {
    if (usePersistent && context.close) await context.close();
    else if (context && context.close) await context.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
