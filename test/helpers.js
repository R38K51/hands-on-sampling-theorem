/* Shared helpers for the tests (not a test file). */
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function core() {
  return require(path.join(ROOT, "assets", "core.js"));
}

function packs() {
  return {
    en: require(path.join(ROOT, "i18n", "en.js")),
    ja: require(path.join(ROOT, "i18n", "ja.js"))
  };
}

// Every slider value: start..end in steps of 0.5.
function halfSteps(start, end) {
  var out = [];
  for (var h = start * 2; h <= end * 2; h++) out.push(h / 2);
  return out;
}

// All strings in a language pack (messages, arrays and language-only lines).
function allStrings(pack) {
  var out = [];
  function add(v) {
    if (Array.isArray(v)) v.forEach(add);
    else out.push(String(v));
  }
  Object.keys(pack.messages).forEach(function (k) { add(pack.messages[k]); });
  Object.keys(pack.langOnly || {}).forEach(function (k) { add(pack.langOnly[k]); });
  return out;
}

module.exports = {
  ROOT: ROOT,
  read: read,
  core: core,
  packs: packs,
  halfSteps: halfSteps,
  allStrings: allStrings
};
