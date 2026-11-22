import { spawn } from 'child_process';
import os from 'os';

async function runComprehensiveQA() {
  const tmpDir = `${os.tmpdir()}\\chrome_qa_${Date.now()}`;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    'about:blank',
  ]);

  let wsUrl = '';
  await new Promise((resolve, reject) => {
    chrome.stderr.on('data', (d) => {
      const match = d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        wsUrl = match[1];
        resolve();
      }
    });
    setTimeout(() => reject(new Error('Timeout waiting for chrome')), 5000);
  });

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

  const results = {
    slideChecks: [],
    mobileDrawer: null,
    brokenImages: [],
    otherPages: [],
  };

  // 1. Test Carousel on all 4 slides at 390x844
  await pageSend('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await pageSend('Page.navigate', { url: 'http://127.0.0.1:5173/' });

  for (let i = 0; i < 30; i++) {
    const check = await pageSend('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.hero') && document.querySelector('.hero-arrow-right'))`,
    });
    if (check.result?.value) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 500));

  for (let slideIndex = 0; slideIndex < 4; slideIndex++) {
    // Click dot slideIndex
    await pageSend('Runtime.evaluate', {
      expression: `document.querySelectorAll('.hero-dot')[${slideIndex}]?.click()`,
    });
    await new Promise((r) => setTimeout(r, 400));

    const check = await pageSend('Runtime.evaluate', {
      expression: `(() => {
        const getRect = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
        };
        const overlaps = (r1, r2) => !(r1.right <= r2.x || r1.x >= r2.right || r1.bottom <= r2.y || r1.y >= r2.bottom);
        const title = getRect('.hero-content h1');
        const desc = getRect('.hero-content p');
        const arrowL = getRect('.hero-arrow-left');
        const arrowR = getRect('.hero-arrow-right');
        const buttons = getRect('.hero-buttons');
        const dots = getRect('.hero-dots');

        return {
          slide: ${slideIndex + 1},
          arrowLOverlapsTitle: overlaps(arrowL, title),
          arrowLOverlapsDesc: overlaps(arrowL, desc),
          arrowROverlapsTitle: overlaps(arrowR, title),
          arrowROverlapsDesc: overlaps(arrowR, desc),
          dotsOverlapButtons: overlaps(dots, buttons),
          titleText: document.querySelector('.hero-content h1')?.innerText.replace(/\\n/g, ' '),
        };
      })()`,
      returnByValue: true,
    });
    results.slideChecks.push(check.result.value);
  }

  // 2. Test Carousel Arrow Clicks (Next and Prev)
  const arrowTest = await pageSend('Runtime.evaluate', {
    expression: `(() => {
      const activeBefore = document.querySelector('.hero-slide.active img')?.getAttribute('src');
      document.querySelector('.hero-arrow-right')?.click();
      return { activeBefore };
    })()`,
    returnByValue: true,
  });
  await new Promise((r) => setTimeout(r, 400));
  const arrowTestAfter = await pageSend('Runtime.evaluate', {
    expression: `(() => {
      const activeAfter = document.querySelector('.hero-slide.active img')?.getAttribute('src');
      document.querySelector('.hero-arrow-left')?.click();
      return { activeAfter };
    })()`,
    returnByValue: true,
  });
  results.arrowTransitionWorks = arrowTest.result.value.activeBefore !== arrowTestAfter.result.value.activeAfter;

  // 3. Test Mobile Navigation Drawer (Open, Close, Escape)
  const openMenuRes = await pageSend('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('.mobile-nav-toggle-btn');
      if (!toggle) return { foundToggle: false };
      toggle.click();
      return { foundToggle: true };
    })()`,
    returnByValue: true,
  });
  await new Promise((r) => setTimeout(r, 300));

  const drawerStateAfterOpen = await pageSend('Runtime.evaluate', {
    expression: `(() => {
      const drawer = document.querySelector('.mobile-drawer');
      return {
        isOpen: drawer?.classList.contains('open'),
      };
    })()`,
    returnByValue: true,
  });

  // Press Escape
  await pageSend('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await pageSend('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await new Promise((r) => setTimeout(r, 300));

  const drawerStateAfterEscape = await pageSend('Runtime.evaluate', {
    expression: `(() => {
      const drawer = document.querySelector('.mobile-drawer');
      return {
        isOpen: drawer?.classList.contains('open'),
      };
    })()`,
    returnByValue: true,
  });

  results.mobileDrawer = {
    foundToggle: openMenuRes.result.value.foundToggle,
    openedOnClick: drawerStateAfterOpen.result.value.isOpen,
    closedOnEscape: !drawerStateAfterEscape.result.value.isOpen,
  };

  // 4. Test Broken Images on Homepage
  const imgCheck = await pageSend('Runtime.evaluate', {
    expression: `(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const broken = imgs.filter(img => img.naturalWidth === 0 && img.src && !img.src.includes('data:'));
      return broken.map(i => i.src);
    })()`,
    returnByValue: true,
  });
  results.brokenImages = imgCheck.result.value;

  // 5. Test Other Pages using .site-hero: /about and /alumni
  for (const path of ['/about', '/alumni']) {
    await pageSend('Page.navigate', { url: `http://127.0.0.1:5173${path}` });
    await new Promise((r) => setTimeout(r, 1200));

    const pageCheck = await pageSend('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.site-hero');
        const h1 = hero ? hero.querySelector('h1, [class*="title"]') : null;
        return {
          path: '${path}',
          hasSiteHero: Boolean(hero),
          heroHeading: h1 ? h1.innerText.replace(/\\n/g, ' ') : null,
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        };
      })()`,
      returnByValue: true,
    });
    results.otherPages.push(pageCheck.result.value);
  }

  console.log(JSON.stringify(results, null, 2));

  pageWs.close();
  ws.close();
  chrome.kill();
}

runComprehensiveQA().catch((e) => {
  console.error(e);
  process.exit(1);
});
