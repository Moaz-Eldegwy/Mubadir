"""Phone layout check for gallery pages.

Usage: python phone-check.py <url> [<url> ...]

At 360 and 390 px wide it reports:
  (a) elements whose box goes past their nearest card/section container by more than 1px
  (b) page horizontal overflow
  (c) sub-service labels (H2 text) seen more than twice in visible text above the FAQ
  (d) vertical runs of 3+ pill/chip elements stacked one per line
  (e) buttons taller than 52px
  (f) console errors
Exit code 1 on any finding.
"""
import sys

sys.stdout.reconfigure(encoding="utf-8")
from playwright.sync_api import sync_playwright

WIDTHS = (360, 390)

JS = r"""
() => {
  const out = {overflow: [], hscroll: null, repeats: [], pillRuns: [], tallButtons: []};
  const vw = document.documentElement.clientWidth;

  const name = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    const t = (el.innerText || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return t ? `${s} "${t}"` : s;
  };
  const visible = (el) => el.checkVisibility
    ? el.checkVisibility({opacityProperty: true, visibilityProperty: true})
    : !!(el.offsetWidth || el.offsetHeight);
  const inFixed = (el) => {
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).position === 'fixed') return true;
      if (p.getAttribute('aria-hidden') === 'true') return true;
    }
    return false;
  };
  const isBox = (el) => {
    if (el.matches('[class*=card], section, .hero, [class*=box]')) return true;
    const cs = getComputedStyle(el);
    const r = parseFloat(cs.borderTopLeftRadius) || 0;
    const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none';
    const border = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
    return r > 0 && (bg || border);
  };
  // scroll containers overflow on purpose; overflow:hidden still counts (content gets cut off)
  const clips = (el) => {
    const cs = getComputedStyle(el);
    return /auto|scroll/.test(cs.overflowX + cs.overflowY);
  };

  // (b) horizontal overflow
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) out.hscroll = sw - vw;

  // (a) overflow past nearest card/section container
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'svg', 'use', 'path', 'symbol', 'circle', 'rect'].includes(el.tagName)) continue;
    if (el.closest('svg') && el.tagName !== 'svg') continue;
    if (!visible(el) || inFixed(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) continue;
    let c = el.parentElement, clipped = false;
    while (c && c !== document.body && !isBox(c)) { if (clips(c)) clipped = true; c = c.parentElement; }
    if (!c || c === document.body || clipped || clips(c)) continue;
    const cb = c.getBoundingClientRect();
    const d = Math.max(cb.left - b.left, b.right - cb.right, cb.top - b.top, b.bottom - cb.bottom);
    if (d > 1) {
      // report only the outermost offender inside this container
      let p = el.parentElement, parentReported = false;
      while (p && p !== c) { if (seen.has(p)) { parentReported = true; break; } p = p.parentElement; }
      seen.add(el);
      if (!parentReported) out.overflow.push(`${name(el)} past ${name(c).slice(0, 40)} by ${Math.round(d)}px`);
    }
  }

  // (c) repeated sub-service labels above FAQ
  const faq = document.querySelector('#faq');
  const faqTop = faq ? faq.getBoundingClientRect().top + scrollY : Infinity;
  const labels = [...document.querySelectorAll('main h2')]
    .filter((h) => (h.getBoundingClientRect().top + scrollY) < faqTop)
    .map((h) => h.textContent.trim().replace(/\s+/g, ' '))
    .filter((t) => t.length > 3);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const pieces = [];
  let n, lastParent = null;
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (!p || !n.textContent.trim() || !visible(p) || inFixed(p)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rr = rg.getBoundingClientRect();
    if (rr.width < 1 || rr.height < 1) continue;
    if (rr.top + scrollY >= faqTop) continue;
    const block = p.closest('h1,h2,h3,h4,p,li,a,button,summary,label,option,span,div');
    pieces.push((block !== lastParent ? '\n' : '') + n.textContent);
    lastParent = block;
  }
  const text = pieces.join('').replace(/[ \t]+/g, ' ');
  for (const lab of new Set(labels)) {
    const count = text.split(lab).length - 1;
    if (count > 2) out.repeats.push(`"${lab}" x${count}`);
  }

  // (d) vertical runs of 3+ pills stacked one per line
  let cands = [];
  for (const el of document.querySelectorAll('main *, header *')) {
    if (!visible(el) || inFixed(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 18 || b.height > 64) continue;
    const cls = el.getAttribute('class') || '';
    let pill = /chip|pill|\btag\b/.test(cls);
    if (!pill && !/btn/.test(cls) && el.tagName !== 'BUTTON' && el.tagName !== 'INPUT') {
      const cs = getComputedStyle(el);
      const r = parseFloat(cs.borderTopLeftRadius) || 0;
      const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const border = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
      pill = r >= b.height / 2 - 1 && b.width > b.height * 1.6 && (bg || border);
    }
    if (pill) cands.push({el, b});
  }
  cands = cands.filter((c) => !cands.some((o) => o !== c && o.el.contains(c.el)));
  cands.sort((x, y) => x.b.top - y.b.top);
  const lines = [];
  for (const c of cands) {
    const L = lines.find((l) => Math.abs(l.top - c.b.top) < 6);
    if (L) L.items.push(c); else lines.push({top: c.b.top, items: [c]});
  }
  let run = [];
  const flush = () => {
    if (run.length >= 3) out.pillRuns.push(`${run.length} stacked: ` + run.map((c) => name(c.el).replace(/^[^"]*/, '')).join(' / '));
    run = [];
  };
  for (const l of lines) {
    if (l.items.length !== 1) { flush(); continue; }
    const c = l.items[0];
    const prev = run[run.length - 1];
    if (prev && (c.b.top - prev.b.bottom > 24 || c.b.left > prev.b.right || c.b.right < prev.b.left)) flush();
    run.push(c);
  }
  flush();

  // (e) buttons taller than 52px
  for (const el of document.querySelectorAll('a, button, [role=button], input[type=submit]')) {
    const cls = el.getAttribute('class') || '';
    if (!(el.tagName === 'BUTTON' || /btn/.test(cls) || el.getAttribute('role') === 'button' || el.tagName === 'INPUT')) continue;
    if (!visible(el) || inFixed(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.height > 52.5) out.tallButtons.push(`${name(el)} ${Math.round(b.height)}px`);
  }
  return out;
}
"""


def check(page, url, width):
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.set_viewport_size({"width": width, "height": 800})
    page.goto(url, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(300)
    r = page.evaluate(JS)
    height = page.evaluate("document.documentElement.scrollHeight")
    findings = []
    findings += [f"(a) overflow: {x}" for x in r["overflow"]]
    if r["hscroll"]:
        findings.append(f"(b) page scrolls sideways by {r['hscroll']}px")
    findings += [f"(c) repeated label: {x}" for x in r["repeats"]]
    findings += [f"(d) pill stack: {x}" for x in r["pillRuns"]]
    findings += [f"(e) tall button: {x}" for x in r["tallButtons"]]
    findings += [f"(f) console error: {x[:120]}" for x in errors]
    return findings, height


def main(urls):
    total = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        for url in urls:
            for w in WIDTHS:
                ctx = browser.new_context(device_scale_factor=1, is_mobile=True, has_touch=True)
                page = ctx.new_page()
                findings, height = check(page, url, w)
                ctx.close()
                status = "PASS" if not findings else f"FAIL ({len(findings)})"
                print(f"{url} @{w}: {status}  page height {height}px")
                for f in findings:
                    print("   ", f)
                total += len(findings)
        browser.close()
    print(f"TOTAL findings: {total}")
    return 1 if total else 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1:]))
