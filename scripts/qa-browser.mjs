import { spawn } from 'child_process';
import os from 'os';

const width = parseInt(process.argv[2] || '390', 10);
const height = parseInt(process.argv[3] || '844', 10);

async function testViewport(w, h) {
  const tmpDir = `${os.tmpdir()}\\chrome_qa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=0', // dynamic port
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    'about:blank',
  ]);

  let wsUrl = '';
  await new Promise((resolve, reject) => {
    chrome.stderr.on('data', (d) => {
      const text = d.toString();
      const match = text.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        wsUrl = match[1];
        resolve();
      }
    });
    setTimeout(() => reject(new Error('Timeout waiting for chrome stderr')), 5000);
  });

  const WebSocket = globalThis.WebSocket;
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const curId = id++;
      const handler = (e) => {
        const msg = JSON.parse(typeof e.data === 'string' ? e.data : e.data.toString());
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

  await new Promise((r) => ws.addEventListener('open', r));

  // Create a new target/page
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const pageWs = new WebSocket(wsUrl.replace(/\/browser\/.*$/, `/page/${target.targetId}`));
  await new Promise((r) => pageWs.addEventListener('open', r));

  let pageId = 1;
  const pageSend = (method, params = {}) =>
    new Promise((resolve) => {
      const curId = pageId++;
      const handler = (e) => {
        const msg = JSON.parse(typeof e.data === 'string' ? e.data : e.data.toString());
        if (msg.id === curId) {
          pageWs.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      pageWs.addEventListener('message', handler);
      pageWs.send(JSON.stringify({ id: curId, method, params }));
    });

  await pageSend('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 2,
    mobile: w < 768,
  });

  await pageSend('Page.navigate', { url: 'http://127.0.0.1:5173/' });

  // Wait until .hero exists
  for (let i = 0; i < 30; i++) {
    const check = await pageSend('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.hero') && document.querySelector('.hero-arrow-left'))`,
    });
    if (check.result?.value) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 600));

  const script = `(() => {
    const getRect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x * 10) / 10,
        y: Math.round(r.y * 10) / 10,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        right: Math.round(r.right * 10) / 10,
        bottom: Math.round(r.bottom * 10) / 10
      };
    };
    const title = getRect('.hero-content h1');
    const desc = getRect('.hero-content p');
    const arrowLeft = getRect('.hero-arrow-left');
    const arrowRight = getRect('.hero-arrow-right');
    const buttons = getRect('.hero-buttons');
    const dots = getRect('.hero-dots');

    const overlaps = (r1, r2) => {
      if (!r1 || !r2) return false;
      return !(r1.right <= r2.x || r1.x >= r2.right || r1.bottom <= r2.y || r1.y >= r2.bottom);
    };

    return JSON.stringify({
      viewport: { width: ${w}, height: ${h} },
      measurements: {
        hero: getRect('.hero'),
        arrowLeft,
        arrowRight,
        title,
        desc,
        buttons,
        dots
      },
      overlapCheck: {
        arrowLeftOverlapsTitle: overlaps(arrowLeft, title),
        arrowLeftOverlapsDesc: overlaps(arrowLeft, desc),
        arrowLeftOverlapsButtons: overlaps(arrowLeft, buttons),
        arrowRightOverlapsTitle: overlaps(arrowRight, title),
        arrowRightOverlapsDesc: overlaps(arrowRight, desc),
        arrowRightOverlapsButtons: overlaps(arrowRight, buttons),
        dotsOverlapButtons: overlaps(dots, buttons),
        dotsOverlapDesc: overlaps(dots, desc)
      },
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
    }, null, 2);
  })()`;

  const evalRes = await pageSend('Runtime.evaluate', { expression: script });
  console.log(evalRes.result.value);

  pageWs.close();
  ws.close();
  chrome.kill();
}

testViewport(width, height).catch((e) => {
  console.error(e);
  process.exit(1);
});
