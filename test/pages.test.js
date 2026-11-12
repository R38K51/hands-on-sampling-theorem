"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var path = require("path");
var childProcess = require("child_process");
var h = require("./helpers");
var build = require(path.join(h.ROOT, "tools", "build.js"));
var packs = h.packs();

var PAGES = [
  { lang: "en", rel: "index.html", url: build.SITE },
  { lang: "ja", rel: "ja/index.html", url: build.SITE + "ja/" }
];
var ALLOWED_ABSOLUTE = [build.SITE, build.SITE + "ja/", build.REPO_URL];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tags(html) {
  var out = [];
  var re = /<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>/g;
  var m;
  while ((m = re.exec(html))) {
    var attrs = {};
    var are = /([a-zA-Z-:]+)(?:="([^"]*)")?/g;
    var a;
    var text = m[2] || "";
    while ((a = are.exec(text))) attrs[a[1].toLowerCase()] = a[2] === undefined ? "" : a[2];
    out.push({ name: m[1].toLowerCase(), attrs: attrs, raw: m[0] });
  }
  return out;
}

test("build --check: committed pages are up to date", function () {
  var r = childProcess.spawnSync(process.execPath, [path.join(h.ROOT, "tools", "build.js"), "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("generated files equal the committed files", function () {
  var files = build.buildFiles();
  Object.keys(files).forEach(function (rel) {
    assert.equal(h.read(rel), files[rel], rel);
  });
});

PAGES.forEach(function (page) {
  var html = h.read(page.rel);
  var all = tags(html);
  var m = packs[page.lang].messages;

  test(page.rel + ": CSP meta is first in head and matches exactly", function () {
    var expected = '<meta http-equiv="Content-Security-Policy" content="' + build.CSP + '">';
    assert.ok(html.indexOf("<head>\n" + expected) !== -1);
    assert.equal(build.CSP, "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'");
  });

  test(page.rel + ": resources are relative or data:, absolute URLs only where allowed", function () {
    var count = 0;
    all.forEach(function (t) {
      ["src", "href", "srcset", "poster", "data", "action"].forEach(function (attr) {
        if (!Object.prototype.hasOwnProperty.call(t.attrs, attr)) return;
        var v = t.attrs[attr];
        var absolute = /^(https?:)?\/\//i.test(v);
        if (!absolute) {
          assert.ok(!/^[a-z]+:/i.test(v) || v === "data:,", t.raw);
          return;
        }
        count++;
        var rel = t.attrs.rel || "";
        var okTag = t.name === "a" || (t.name === "link" && (rel === "canonical" || rel === "alternate"));
        assert.ok(okTag, "absolute URL in " + t.raw);
        assert.ok(ALLOWED_ABSOLUTE.indexOf(v) !== -1, "URL not allowed: " + v);
      });
    });
    assert.ok(count > 0);
    ["iframe", "img", "source", "object", "embed", "video", "audio", "form"].forEach(function (n) {
      assert.ok(!all.some(function (t) { return t.name === n; }), "<" + n + "> found");
    });
    var scripts = all.filter(function (t) { return t.name === "script"; }).map(function (t) { return t.attrs.src; });
    var base = page.lang === "en" ? "" : "../";
    assert.deepEqual(scripts, [base + "i18n/" + page.lang + ".js", base + "assets/core.js", base + "assets/chart.js", base + "assets/app.js"]);
    var styles = all.filter(function (t) { return t.name === "link" && t.attrs.rel === "stylesheet"; });
    assert.equal(styles.length, 1);
    assert.equal(styles[0].attrs.href, base + "assets/style.css");
    var icon = all.filter(function (t) { return t.name === "link" && t.attrs.rel === "icon"; });
    assert.equal(icon.length, 1);
    assert.equal(icon[0].attrs.href, "data:,");
  });

  test(page.rel + ": no inline script, style or event handler", function () {
    assert.ok(!/<script\b[^>]*>[^<]+<\/script>/.test(html));
    assert.ok(!/<style\b/i.test(html));
    all.forEach(function (t) {
      assert.ok(!Object.prototype.hasOwnProperty.call(t.attrs, "style"), t.raw);
      Object.keys(t.attrs).forEach(function (a) { assert.ok(!/^on/.test(a), t.raw); });
    });
  });

  test(page.rel + ": lang, canonical, hreflang, h1, title and description", function () {
    assert.ok(html.indexOf('<html lang="' + page.lang + '">') !== -1);
    var canon = all.filter(function (t) { return t.name === "link" && t.attrs.rel === "canonical"; });
    assert.equal(canon.length, 1);
    assert.equal(canon[0].attrs.href, page.url);
    var alt = {};
    all.forEach(function (t) {
      if (t.name === "link" && t.attrs.rel === "alternate") alt[t.attrs.hreflang] = t.attrs.href;
    });
    assert.deepEqual(alt, { en: build.SITE, ja: build.SITE + "ja/", "x-default": build.SITE });
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok(html.indexOf("<h1>" + esc(m.h1) + "</h1>") !== -1);
    assert.ok(html.indexOf("<title>" + esc(m["meta.title"]) + "</title>") !== -1);
    assert.ok(html.indexOf('<meta name="description" content="' + esc(m["meta.description"]) + '">') !== -1);
  });

  test(page.rel + ": language switch links to the other page only", function () {
    var other = page.lang === "en" ? "ja" : "en";
    var href = page.lang === "en" ? "ja/" : "../";
    assert.ok(html.indexOf('<a href="' + href + '" lang="' + other + '" hreflang="' + other + '">') !== -1);
    assert.ok(html.indexOf('<span aria-current="true" lang="' + page.lang + '">') !== -1);
  });

  test(page.rel + ": folding blocks, starting values and sections", function () {
    var details = all.filter(function (t) { return t.name === "details"; });
    // One reading guide plus four questions; only question 1 starts open.
    assert.equal(details.length, 5);
    var quiz = details.filter(function (t) { return /quiz/.test(t.attrs.class || ""); });
    assert.equal(quiz.length, 4);
    assert.deepEqual(quiz.map(function (t) { return Object.prototype.hasOwnProperty.call(t.attrs, "open"); }),
      [true, false, false, false]);
    assert.ok(!/<details class="fold" open/.test(html));
    var init = packs[page.lang].pcmInitial;
    ["fmax", "bits", "ch"].forEach(function (k) {
      assert.ok(html.indexOf('id="pcm-' + k + '" type="text"') !== -1);
      assert.ok(new RegExp('id="pcm-' + k + '"[^>]*value="' + init[k].replace(".", "\.") + '"').test(html), k);
    });
    assert.equal((html.match(/class="example"[^>]*aria-pressed="true"/g) || []).length, 1);
    assert.ok(html.indexOf('<h2 id="why-h2">' + esc(m["why.h2"]) + "</h2>") !== -1);
    assert.ok(html.indexOf('<p class="verdict-symbols">' + esc(m["verdict.symbols"]) + "</p>") !== -1);
    // The verdict summary comes before the sliders; the explanation after them.
    assert.ok(html.indexOf('id="verdict-title"') < html.indexOf('id="f-input"'));
    assert.ok(html.indexOf('id="fs-input"') < html.indexOf('id="verdict-text"'));
    assert.ok(html.indexOf('id="verdict-text"') < html.indexOf('class="presets"'));
  });

  test(page.rel + ": no-network sentence is hidden while SHOW_NO_NETWORK is false", function () {
    assert.equal(build.SHOW_NO_NETWORK, false);
    assert.ok(html.indexOf(esc(m["footer.noNetwork"])) === -1);
  });
});

test("the English subtitle is in the English page only", function () {
  var sub = packs.en.messages.subtitle;
  assert.ok(h.read("index.html").indexOf('<p class="subtitle">' + esc(sub) + "</p>") !== -1);
  assert.ok(h.read("ja/index.html").indexOf(esc(sub)) === -1);
});

test("exam note appears on the Japanese page only", function () {
  var note = packs.ja.langOnly["header.examNote"];
  assert.ok(h.read("ja/index.html").indexOf(note) !== -1);
  assert.ok(h.read("index.html").indexOf(note) === -1);
});

test("sitemap lists both URLs with alternates", function () {
  var xml = h.read("sitemap.xml");
  assert.ok(xml.indexOf("<loc>" + build.SITE + "</loc>") !== -1);
  assert.ok(xml.indexOf("<loc>" + build.SITE + "ja/</loc>") !== -1);
  assert.equal((xml.match(/hreflang="x-default"/g) || []).length, 2);
  assert.equal(build.SITE, "https://r38k51.github.io/hands-on-sampling-theorem/");
});
