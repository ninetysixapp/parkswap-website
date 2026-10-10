const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index.html','nyc-parking/index.html','blog-detail/index.html','aboutUs/index.html','support/index.html','privacy/index.html','terms/index.html'];
for(const page of pages){
 test(page+' exposes useful search destinations and preserves branding',()=>{
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const footer=html.match(/<footer>[\s\S]*?<\/footer>/)[0];
  for(const url of ['/blog-detail/','/support/','/nyc-parking/#calendar'])assert.ok(footer.includes('href="'+url+'"'),url);
  assert.match(html,/parkswap-s-icon-v2\.png/);
  assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
  for(const [,json]of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(json);
  for(const [,target]of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^(https?:|mailto:)/.test(target))continue;
   const url=new URL(target,'https://parkswap.com/'+page);
   let file=path.join(root,decodeURIComponent(url.pathname));
   assert.ok(fs.existsSync(file),target);
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   if(url.hash)assert.ok(fs.readFileSync(file,'utf8').includes('id="'+url.hash.slice(1)+'"'),target);
  }
 });
}
test('support is an indexable canonical destination with honest release guidance',()=>{
 const html=fs.readFileSync(path.join(root,'support/index.html'),'utf8');
 assert.match(html,/<link rel="canonical" href="https:\/\/parkswap.com\/support\/">/);
 assert.match(html,/not yet part of the public release/);
 assert.match(html,/ContactPage/);
 assert.match(html,/BreadcrumbList/);
 assert.doesNotMatch(html,/noindex|aggregateRating|reviewCount/);
 assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),/<loc>https:\/\/parkswap.com\/support\/<\/loc>/);
});
test('primary navigation links guide, handoff article and support',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const nav=html.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)[1];
 for(const url of ['/nyc-parking/','/blog-detail/','/support/'])assert.ok(nav.includes('href="'+url+'"'));
 assert.match(html,/<h1>NYC parking\./);
 assert.doesNotMatch(html,/sitelinks guaranteed|SearchAction|SiteNavigationElement/);
});
