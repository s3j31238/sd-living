// Headless capture + console error harvest for the SD LIVING experience.
const puppeteer = require('puppeteer')
const fs = require('fs')

const URL = process.env.URL || 'http://localhost:5173/'
const OUT = process.env.OUT || '/tmp/shots'
const W = parseInt(process.env.W || '1600', 10)
const H = parseInt(process.env.H || '900', 10)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 240000,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist', '--enable-webgl',
      '--disable-dev-shm-usage',
      `--window-size=${W},${H}`,
    ],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 })

  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 400))
  })
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 400)))
  page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url().slice(0, 160)))
  page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP' + r.status() + ': ' + r.url().slice(0, 160)) })

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 })
  await sleep(4500)
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML.length || 0)
  const fatal = errors.filter((e) => !/WebSocket|\[vite\]|synchronously unmount/.test(e))
  if (rootHtml < 200) {
    console.log(JSON.stringify({ rootHtml, errors: fatal.slice(0, 20) }, null, 2))
    await page.screenshot({ path: `${OUT}/00-boot.png` })
    await browser.close()
    process.exit(0)
  }

  // click through the entry gate
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /ENTER THE SHOWROOM/i.test(x.textContent))
    if (b) { b.click(); return true }
    return false
  })
  await sleep(9000)
  await page.screenshot({ path: `${OUT}/01-hero.png` })

  const steps = [
    { name: '02-chapter1', p: 0.2 },
    { name: '03-chapter2', p: 0.36 },
    { name: '04-orbit',    p: 0.52 },
    { name: '05-awaken',   p: 0.68 },
    { name: '06-gallery',  p: 0.93 },
  ]
  for (const s of steps) {
    await page.evaluate((p) => {
      const act = document.querySelector('#collections')
      const total = act.offsetHeight - window.innerHeight
      const y = act.offsetTop + total * p
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
    }, s.p)
    await sleep(2600)
    await page.screenshot({ path: `${OUT}/${s.name}.png` })
  }

  // page sections
  const ids = ['spaces', 'bestsellers', 'gifting', 'shop', 'about']
  for (const id of ids) {
    await page.evaluate((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
    }, id)
    await sleep(3200)
    await page.screenshot({ path: `${OUT}/sec-${id}.png` })
  }

  // gifting mid-open
  await page.evaluate(() => {
    const el = document.getElementById('gifting')
    const y = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * 0.45
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  })
  await sleep(3200)
  await page.screenshot({ path: `${OUT}/sec-gifting-open.png` })

  // product detail modal
  await page.evaluate(() => {
    const el = document.getElementById('shop')
    const y = el.getBoundingClientRect().top + window.scrollY
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  })
  await sleep(1500)
  const opened = await page.evaluate(() => {
    const a = document.querySelector('#shop article')
    if (a) { a.click(); return true }
    return false
  })
  await sleep(6500)
  await page.screenshot({ path: `${OUT}/07-detail.png` })

  const notable = errors.filter((e) => !/WebSocket|\[vite\]/.test(e))
  console.log(JSON.stringify({ clicked, opened, notable: [...new Set(notable)].slice(0, 20) }, null, 2))
  await browser.close()
})()
