import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the complete ParkSwap landing page", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");

  assert.match(html, /<title>ParkSwap — Destination-First Parking Navigation for iPhone<\/title>/i);
  assert.match(html, /Navigate there\.[\s\S]*Find parking before you arrive\./i);
  assert.match(html, /How it works/i);
  assert.match(html, /full-screen moving guidance/i);
  assert.match(html, /See an open spot\?[\s\S]*Help the next driver\./i);
  assert.match(html, /Safety & trust/i);
  assert.match(html, /apps\.apple\.com\/us\/app\/parkswap(?:-swap-your-spot)?\/id1494510599/i);
  assert.match(html, /class="app-store-badge"/i);
  assert.doesNotMatch(html, /Less circling|yellow background|Google Play|CarPlay|parking management services/i);
});

test("packages the public brand and real product assets", async () => {
  await Promise.all([
    access(new URL("styles.css", root)),
    access(new URL("parkswap-app-icon.png", root)),
    access(new URL("parkswap-logo.png", root)),
    access(new URL("assets/parkswap-map.png", root)),
    access(new URL("assets/parkswap-drive.png", root)),
    access(new URL("assets/parkswap-report.png", root)),
  ]);
});

test("preserves ParkSwap's indexed public routes", async () => {
  const routes = [
    ["aboutUs/index.html", /https:\/\/parkswap\.com\/aboutUs/i],
    ["privacy/index.html", /https:\/\/parkswap\.com\/privacy/i],
    ["terms/index.html", /https:\/\/parkswap\.com\/terms/i],
    ["blog-detail/index.html", /https:\/\/parkswap\.com\/blog-detail\?blog=1/i],
  ];

  for (const [file, canonical] of routes) {
    const html = await readFile(new URL(file, root), "utf8");
    assert.match(html, canonical);
    assert.match(html, /parkswap-app-icon\.png/i);
    assert.doesNotMatch(html, /CarPlay|Android Auto/i);
  }

  await Promise.all([
    access(new URL("404.html", root)),
    access(new URL("robots.txt", root)),
    access(new URL("sitemap.xml", root)),
    access(new URL("pages.css", root)),
  ]);
});

test("keeps mobile navigation targets accessible", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  assert.match(css, /footer>div a\{[^}]*min-height:44px/i);
  assert.match(css, /brand-app-icon[^}]*height:44px/i);
});

test("packages the installable ParkSwap phone app", async () => {
  const app = await readFile(new URL("app/index.html", root), "utf8");
  const appCss = await readFile(new URL("app/app.css", root), "utf8");
  const appJs = await readFile(new URL("app/app.js", root), "utf8");
  const manifest = JSON.parse(await readFile(new URL("app/manifest.webmanifest", root), "utf8"));
  const worker = await readFile(new URL("app/sw.js", root), "utf8");

  assert.match(app, /Leave Spot Now/);
  assert.match(app, /Leaving Soon\?/);
  assert.match(app, /Create free account/);
  assert.match(app, /Join as a Spotter/);
  assert.match(app, /No vehicle required/);
  assert.match(app, /Spot Open Here/);
  assert.match(app, /Tips &amp; payouts/);
  assert.match(app, /handled by Stripe/);
  assert.match(app, /vendor\/leaflet\/leaflet\.js/);
  assert.match(app, /View parking alerts/);
  assert.match(app, /Choose a point on the map/);
  assert.match(app, /Enable precise location/);
  assert.match(app, /id="locationMessage"/);
  assert.match(app, /Search any U\.S\. address or parking destination/);
  assert.match(app, /role="combobox"/);
  assert.match(app, /aria-controls="destinationResults"/);
  assert.match(appCss, /looking-pin/);
  assert.match(appCss, /leaving-pin/);
  assert.match(appCss, /scheduled-user-pin/);
  assert.match(app, /Continue with Google/);
  assert.match(app, /Continue with Apple/);
  assert.match(app, /googleIdentityButton/);
  assert.match(app, /appleIdentityButton/);
  assert.match(app, /Email my secure web password/);
  assert.match(appJs, /scheduled-departures\/[^`]+\/confirm/);
  assert.match(appJs, /scheduled-departures\/[^`]+\/cancel/);
  assert.match(appJs, /spotter-reports\/nearby/);
  assert.match(appJs, /payment\/account-verification/);
  assert.match(app, /https:\/\/app\.parkswap\.com\/app\//);
  assert.match(appJs, /const API = "https:\/\/app\.parkswap\.com\/api"/);
  assert.doesNotMatch(appJs, /old\.parkswap\.com/);
  assert.match(appJs, /nominatim\.openstreetmap\.org\/search/);
  assert.match(appJs, /destinationSearchTimer/);
  assert.match(appJs, /aria-expanded/);
  assert.match(appJs, /state\.exploreCoords \|\| state\.coords/);
  assert.doesNotMatch(app, /routing number|account number/i);
  assert.doesNotMatch(app, /subscription/i);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.name, "ParkSwap");
  assert.match(worker, /parkswap-web-v/);
  await Promise.all([
    access(new URL("app/vendor/leaflet/leaflet.js", root)),
    access(new URL("app/vendor/leaflet/leaflet.css", root)),
    access(new URL("app/vendor/leaflet/images/marker-icon.png", root)),
  ]);
});
