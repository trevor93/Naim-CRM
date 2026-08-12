import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..')
const ARTIFACTS_DIR = path.join(PROJECT_ROOT, 'artifacts')
const DOWNLOADS_DIR = path.join(ARTIFACTS_DIR, 'documents-downloads')
const SCREENSHOT_PATH = path.join(ARTIFACTS_DIR, 'documents-cvs-full.png')
const APP_URL = process.env.DOCUMENTS_URL || 'http://127.0.0.1:3000/documents'
const DEBUG_PORT = 9333

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean)
const chromePath = chromeCandidates.find(existsSync)
if (!chromePath) throw new Error('Chrome or Edge was not found. Set CHROME_PATH and retry.')

await mkdir(ARTIFACTS_DIR, { recursive: true })
await rm(DOWNLOADS_DIR, { recursive: true, force: true })
await mkdir(DOWNLOADS_DIR, { recursive: true })

const profileDir = path.join(os.tmpdir(), `naim-documents-cdp-${process.pid}`)
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${profileDir}`,
  '--window-size=1366,900',
  'about:blank',
], { stdio: 'ignore' })

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitForJson(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { method: url.includes('/json/new') ? 'PUT' : 'GET' })
      if (response.ok) return response.json()
    } catch {
      // Chrome may still be starting.
    }
    await delay(100)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

let socket
try {
  await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`)
  const target = await waitForJson(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent(APP_URL)}`)
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  let messageId = 0
  const pending = new Map()
  const eventListeners = new Map()

  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
      return
    }
    for (const listener of eventListeners.get(message.method) || []) listener(message.params)
  })

  function send(method, params = {}) {
    const id = ++messageId
    socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
  }

  function on(method, listener) {
    const listeners = eventListeners.get(method) || []
    listeners.push(listener)
    eventListeners.set(method, listeners)
  }

  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }

  async function waitFor(expression, label, attempts = 80) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await evaluate(expression)) return
      await delay(100)
    }
    throw new Error(`Timed out waiting for ${label}`)
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message)
  }

  on('Page.javascriptDialogOpening', () => {
    send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {})
  })

  await Promise.all([
    send('Page.enable'),
    send('Runtime.enable'),
    send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS_DIR }),
  ])
  await waitFor('document.readyState === "complete"', 'document load')
  await waitFor('document.querySelectorAll("[data-cv-draft-row]").length === 17', '17 demo CV drafts')

  const summary = await evaluate(`(() => {
    const tabLabels = [...document.querySelectorAll('nav[aria-label="Document categories"] button')].map((button) => button.textContent.trim())
    return {
      headerTitle: document.querySelector('header h1')?.textContent.trim(),
      pageTitle: document.querySelector('#documents-cvs-page h1')?.textContent.trim(),
      tabLabels,
      activeTab: document.querySelector('nav[aria-label="Document categories"] [aria-current="page"]')?.textContent.trim(),
      hasBanner: document.body.textContent.includes('CV Builder Integration'),
      hasBuilderSection: document.body.textContent.includes('CV Builder CVs'),
      hasUploadedSection: document.body.textContent.includes('Uploaded CVs'),
      rowCount: document.querySelectorAll('[data-cv-draft-row]').length,
      fileInputs: document.querySelectorAll('input[type="file"]').length,
      cameraInputs: document.querySelectorAll('input[type="file"][capture="environment"]').length,
    }
  })()`)

  assert(summary.pageTitle === 'Documents', 'Documents page heading is missing')
  assert(summary.tabLabels.join('|') === 'CVs|Medical Reports|Contracts|Licenses & Certifications|Adverts/Marketing|Reports', 'Document tabs are incomplete or out of order')
  assert(summary.activeTab === 'CVs', 'CVs tab is not active')
  assert(summary.hasBanner && summary.hasBuilderSection && summary.hasUploadedSection, 'A required CV section is missing')
  assert(summary.rowCount === 17, 'Expected 17 initial draft rows')
  assert(summary.fileInputs === 6 && summary.cameraInputs === 3, 'Upload and camera controls are incomplete')

  await evaluate(`document.querySelector('input[aria-label="Select all CV drafts"]').click()`)
  assert(await evaluate(`document.querySelectorAll('[data-cv-draft-row] input[type="checkbox"]:checked').length`) === 17, 'Select All did not select every draft')

  await evaluate(`document.querySelector('[aria-label="Preview MWASITI JUMA BAKARI"]').click()`)
  await waitFor('Boolean(document.querySelector(\'[role="dialog"]\'))', 'preview dialog')
  assert(await evaluate(`document.querySelector('[role="dialog"]')?.textContent.includes('496.74 KB')`), 'Preview dialog does not show draft metadata')
  await evaluate(`document.querySelector('[aria-label="Close modal"]').click()`)

  await evaluate(`[...document.querySelectorAll('nav[aria-label="Document categories"] button')].find((button) => button.textContent.trim() === 'Medical Reports').click()`)
  await waitFor(`document.body.textContent.includes('Medical Reports will be built from its template image next.')`, 'unavailable-tab feedback')

  await evaluate(`document.querySelector('[aria-label="Edit MWASITI JUMA BAKARI"]').click()`)
  await waitFor(`location.pathname === '/cv-builder'`, 'CV Builder navigation')
  await send('Page.navigate', { url: APP_URL })
  await waitFor('document.querySelectorAll("[data-cv-draft-row]").length === 17', 'Documents reload after edit navigation')

  let downloadStarted = false
  on('Page.downloadWillBegin', () => { downloadStarted = true })
  await evaluate(`document.querySelector('[aria-label="Download MWASITI JUMA BAKARI"]').click()`)
  for (let attempt = 0; attempt < 30 && !downloadStarted; attempt += 1) await delay(100)
  assert(downloadStarted, 'Draft download did not start')

  await evaluate(`document.querySelector('[aria-label="Delete MWASITI JUMA BAKARI"]').click()`)
  await waitFor('document.querySelectorAll("[data-cv-draft-row]").length === 16', 'demo draft deletion')
  await send('Page.reload', { ignoreCache: true })
  await waitFor('document.querySelectorAll("[data-cv-draft-row]").length === 17', 'demo draft restoration after reload')

  await evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Clear All CV Drafts')).click()`)
  await waitFor('document.querySelectorAll("[data-cv-draft-row]").length === 0', 'demo clear all')
  await send('Page.reload', { ignoreCache: true })
  await waitFor('document.querySelectorAll("[data-cv-draft-row]").length === 17', 'demo clear restoration after reload')

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await delay(250)
  const responsive = await evaluate(`({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth })`)
  assert(responsive.documentWidth <= responsive.viewport && responsive.bodyWidth <= responsive.viewport, 'The page overflows horizontally at mobile width')

  await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
  await delay(250)
  const metrics = await send('Page.getLayoutMetrics')
  const contentHeight = Math.ceil(metrics.cssContentSize.height)
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 1366, height: contentHeight, scale: 1 },
  })
  await writeFile(SCREENSHOT_PATH, Buffer.from(screenshot.data, 'base64'))

  console.log(JSON.stringify({
    status: 'PASS',
    url: APP_URL,
    screenshot: SCREENSHOT_PATH,
    fullPageSize: `1366x${contentHeight}`,
    initialRows: summary.rowCount,
    mobileWidth: responsive.documentWidth,
    interactions: ['tabs', 'select-all', 'preview', 'edit', 'download', 'delete', 'clear-all'],
  }, null, 2))
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close()
  chrome.kill()
  await rm(profileDir, { recursive: true, force: true }).catch(() => {})
}
