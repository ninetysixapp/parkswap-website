const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const page of ['index.html','nyc-parking/index.html','aboutUs/index.html','privacy/index.html','terms/index.html','blog-detail/index.html']) {
  test(page+' links the owner-confirmed social profiles safely', () => {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const footer = html.match(/<footer>[\s\S]*?<\/footer>/)[0];
    for (const [url, label] of [['https://www.instagram.com/parkswap.app/', 'ParkSwap on Instagram'], ['https://x.com/parkswap_app', 'ParkSwap on X']]) {
      const links = [...footer.matchAll(/<a\s[^>]*>/g)].map(x => x[0]).filter(x => x.includes('href="'+url+'"'));
      assert.equal(links.length, 1);
      assert.match(links[0], /target="_blank"/);
      assert.match(links[0], /rel="noopener noreferrer"/);
      assert.ok(links[0].includes(label));
      assert.match(links[0], /opens in a new tab/);
      assert.match(links[0], /title="(?:Instagram|X) · @parkswap/);
    }
    assert.equal((footer.match(/<svg /g)||[]).length, 2);
    assert.match(footer, /class="footer-social" aria-label="ParkSwap social media"/);
    assert.doesNotMatch(footer, /tiktok\.com|facebook\.com|linkedin\.com/);
  });
}
