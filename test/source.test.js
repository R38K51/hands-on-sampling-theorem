"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var h = require("./helpers");
var packs = h.packs();

// Every script the page loads.
var PAGE_JS = ["assets/core.js", "assets/chart.js", "assets/app.js", "i18n/en.js", "i18n/ja.js"];
var FORBIDDEN_JS = ["fetch", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "import(",
  "Worker", "new Image", "localStorage", "sessionStorage", "indexedDB", "document.cookie", "toLocaleString"];

test("page scripts use no network, storage or locale formatting", function () {
  PAGE_JS.forEach(function (rel) {
    var src = h.read(rel);
    FORBIDDEN_JS.forEach(function (word) {
      assert.ok(src.indexOf(word) === -1, rel + " contains " + word);
    });
  });
});

test("stylesheet loads nothing", function () {
  var css = h.read("assets/style.css");
  assert.ok(css.indexOf("url(") === -1);
  assert.ok(css.indexOf("@import") === -1);
});

test("no 'ラボ' or the word 'Lab' in the text, the pages or the README", function () {
  var texts = [];
  ["en", "ja"].forEach(function (l) {
    h.allStrings(packs[l]).forEach(function (s) { texts.push({ where: "i18n/" + l, s: s }); });
  });
  ["index.html", "ja/index.html", "README.md", "package.json"].forEach(function (rel) {
    texts.push({ where: rel, s: h.read(rel) });
  });
  texts.forEach(function (x) {
    assert.ok(x.s.indexOf("ラボ") === -1, x.where + ": " + x.s.slice(0, 80));
    assert.ok(!/\blab\b/i.test(x.s), x.where + ": " + x.s.slice(0, 80));
  });
});

test("the Lab check catches the word but not longer words", function () {
  assert.ok(/\blab\b/i.test("Sampling Theorem Lab"));
  assert.ok(/\blab\b/i.test("sampling-lab"));
  assert.ok(!/\blab\b/i.test("Label"));
  assert.ok(!/\blab\b/i.test("collaborate"));
});

test("code comments are in English", function () {
  var jp = /[぀-ヿ㐀-鿿]/;
  var files = ["assets/core.js", "assets/chart.js", "assets/app.js", "tools/build.js",
    "i18n/en.js", "i18n/ja.js", "assets/style.css"];
  fs.readdirSync(path.join(h.ROOT, "test")).forEach(function (f) {
    if (/\.js$/.test(f)) files.push("test/" + f);
  });
  files.forEach(function (rel) {
    var src = h.read(rel);
    var blocks = src.match(/\/\*[\s\S]*?\*\//g) || [];
    var lines = src.split("\n").filter(function (line) { return /^\s*\/\//.test(line); });
    blocks.concat(lines).forEach(function (c) {
      assert.ok(!jp.test(c), rel + ": " + c.slice(0, 80));
    });
  });
});
