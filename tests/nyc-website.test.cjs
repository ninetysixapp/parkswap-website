const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
for (const page of ['index.html','nyc-parking/index.html']) {
  test(page+' has consistent metadata, one H1 and valid JSON-LD', () => {
    const html = fs.readFileSync(path.join(root,page),'utf8');
    assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /<link rel="canonical" href="https:\/\/parkswap\.com\//);
    assert.match(html, /app-id=1494510599/);
    assert.doesNotMatch(html, /Use the web app|app\.parkswap\.com/i);
    const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.ok(schema.length);
    for (const [,json] of schema) assert.equal(JSON.parse(json)['@context'],'https://schema.org');
    assert.doesNotMatch(html,/aggregateRating|reviewCount|guaranteed parking|Coming Soon/i);
  });
  test(page+' local links, anchors and images exist', () => {
    const html = fs.readFileSync(path.join(root,page),'utf8');
    for(const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:)/.test(target)) continue;
      if (target.startsWith('#')) { assert.ok(html.includes('id="'+target.slice(1)+'"'),target); continue; }
      const url = new URL(target,'https://parkswap.com/'+(page==='index.html'?'':page));
      const file = path.join(root,decodeURIComponent(url.pathname));
      assert.ok(fs.existsSync(file),target);
      if(fs.statSync(file).isDirectory()) assert.ok(fs.existsSync(path.join(file,'index.html')),target);
    }
  });
}
test('sitemap advertises the guide and Google verification is preserved',()=>{
  assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),/https:\/\/parkswap\.com\/nyc-parking\//);
  assert.ok(fs.existsSync(path.join(root,'google1e397fb5860504dc.html')));
  assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'parkswap.com');
});
