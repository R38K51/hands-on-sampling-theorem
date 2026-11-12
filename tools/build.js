#!/usr/bin/env node
/*
 * Page generator (development only, Node built-ins only).
 * Reads i18n/en.js and i18n/ja.js and writes:
 *   index.html      English (x-default), served at /
 *   ja/index.html   Japanese, served at /ja/
 *   sitemap.xml     both URLs with their language alternates
 * Usage: node tools/build.js           (write files)
 *        node tools/build.js --check   (exit 1 when committed files differ)
 */
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SITE = "https://r38k51.github.io/hands-on-sampling-theorem/";
var REPO_URL = "https://github.com/R38K51/hands-on-sampling-theorem";
var CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'";
// Stays false until dev-tester confirms zero requests and no storage on the real page.
var SHOW_NO_NETWORK = false;

// Page order: English is the default page at the site root.
var PAGES = [
  { lang: "en", rel: "index.html", base: "", url: SITE },
  { lang: "ja", rel: "ja/index.html", base: "../", url: SITE + "ja/" }
];
var DEFAULT_LANG = "en";

var core = require(path.join(ROOT, "assets", "core.js"));

function loadPack(lang) {
  return require(path.join(ROOT, "i18n", lang + ".js"));
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function translator(pack) {
  return function t(key) {
    if (!Object.prototype.hasOwnProperty.call(pack.messages, key)) {
      throw new Error("missing key " + key + " in " + pack.lang);
    }
    return pack.messages[key];
  };
}

function hreflangLines() {
  var lines = PAGES.map(function (p) {
    return '<link rel="alternate" hreflang="' + p.lang + '" href="' + p.url + '">';
  });
  lines.push('<link rel="alternate" hreflang="x-default" href="' + SITE + '">');
  return lines.join("\n");
}

// Language names joined by " | ": the current language is plain text, the other one a link.
function langSwitch(page, packs) {
  return PAGES.map(function (p) {
    var name = esc(packs[p.lang].name);
    if (p.lang === page.lang) return '<span aria-current="true" lang="' + p.lang + '">' + name + "</span>";
    var href = page.base + (p.rel === "index.html" ? "" : p.rel.replace(/index\.html$/, ""));
    if (href === "") href = "./";
    return '<a href="' + href + '" lang="' + p.lang + '" hreflang="' + p.lang + '">' + name + "</a>";
  }).join(" | ");
}

function presetButtons(t) {
  return core.PRESETS.map(function (p) {
    return '<button type="button" class="preset" data-preset="' + p.id + '" data-f="' + p.f +
      '" data-fs="' + p.fs + '" aria-pressed="false">' + esc(t("preset." + p.id)) + "</button>";
  }).join("\n");
}

// Example inputs for the calculator; the one equal to the starting values is pressed.
function exampleButtons(t, initial) {
  return core.PCM_EXAMPLES.map(function (e) {
    var on = e.fmax === initial.fmax && e.bits === initial.bits && e.ch === initial.ch;
    return '<button type="button" class="example" data-fmax="' + e.fmax + '" data-bits="' + e.bits +
      '" data-ch="' + e.ch + '" aria-pressed="' + (on ? "true" : "false") + '">' +
      esc(t("pcm.example." + e.id)) + "</button>";
  }).join("\n");
}

function quizBlocks(t) {
  var letters = t("quiz.letters");
  var out = [];
  for (var q = 1; q <= core.ANSWERS.length; q++) {
    var id = "q" + q;
    var choices = t("quiz." + id + ".choices");
    if (!Array.isArray(choices) || choices.length !== 4) throw new Error(id + " needs four choices");
    var html = [];
    // Each question folds; only the first one starts open.
    html.push('<details class="quiz" id="' + id + '" data-q="' + q + '"' + (q === 1 ? " open" : "") + ">");
    html.push('<summary><span class="quiz-number">' + esc(core.fill(t("quiz.number"), { n: q })) + "</span> " +
      esc(t("quiz." + id + ".text")) + "</summary>");
    html.push("<fieldset>");
    html.push('<legend class="quiz-legend">' + esc(core.fill(t("quiz.number"), { n: q })) + "</legend>");
    choices.forEach(function (c, i) {
      html.push('<label class="choice"><input type="radio" name="' + id + '" value="' + i + '"> ' +
        '<span class="letter">' + esc(core.fill(t("quiz.choiceLetter"), { letter: letters[i] })) + "</span> " +
        esc(c) + "</label>");
    });
    html.push("</fieldset>");
    html.push('<div class="quiz-actions"><button type="button" class="check" disabled aria-describedby="' + id +
      '-hint">' + esc(t("quiz.check")) + '</button> <span id="' + id + '-hint" class="hint">' +
      esc(t("quiz.choose")) + "</span></div>");
    html.push('<div class="quiz-result" id="' + id + '-result" hidden>');
    html.push('<p class="quiz-verdict"></p>');
    html.push('<p class="quiz-explain">' + esc(t("quiz." + id + ".explain")) + "</p>");
    html.push('<button type="button" class="retry" hidden>' + esc(t("quiz.retry")) + "</button>");
    html.push("</div>");
    html.push("</details>");
    out.push(html.join("\n"));
  }
  return out.join("\n");
}

function renderPage(template, page, packs) {
  var pack = packs[page.lang];
  var t = translator(pack);
  var initial = { f: 4, fs: 20 };
  var pcmInitial = pack.pcmInitial;
  var examNote = pack.langOnly && pack.langOnly["header.examNote"];
  var values = {
    lang: page.lang,
    base: page.base,
    csp: CSP,
    canonical: page.url,
    hreflang: hreflangLines(),
    langSwitch: langSwitch(page, packs),
    examNote: examNote ? '<p class="exam-note">' + esc(examNote) + "</p>" : "",
    chartLabel: esc(core.fill(t("chart.label." + core.verdict(initial.f, initial.fs)), {
      f: core.formatHz(initial.f), fs: core.formatHz(initial.fs)
    })),
    presets: presetButtons(t),
    examples: exampleButtons(t, pcmInitial),
    pcmFmax: esc(pcmInitial.fmax),
    pcmBits: esc(pcmInitial.bits),
    pcmCh: esc(pcmInitial.ch),
    quiz: quizBlocks(t),
    noNetwork: SHOW_NO_NETWORK ? '<p class="no-network">' + esc(t("footer.noNetwork")) + "</p>" : "",
    repoUrl: REPO_URL
  };
  var html = template.replace(/\{\{t:([a-zA-Z0-9.]+)\}\}|\{\{([a-zA-Z0-9]+)\}\}/g, function (all, key, name) {
    if (key) return esc(t(key));
    if (!Object.prototype.hasOwnProperty.call(values, name)) throw new Error("unknown slot " + name);
    return values[name];
  });
  // Drop lines left empty by optional slots.
  return html.replace(/\n\n(?=<\/header>|<\/footer>|<p><a )/g, "\n");
}

function sitemap() {
  var lines = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  PAGES.forEach(function (p) {
    lines.push("<url>");
    lines.push("<loc>" + p.url + "</loc>");
    PAGES.forEach(function (o) {
      lines.push('<xhtml:link rel="alternate" hreflang="' + o.lang + '" href="' + o.url + '"/>');
    });
    lines.push('<xhtml:link rel="alternate" hreflang="x-default" href="' + SITE + '"/>');
    lines.push("</url>");
  });
  lines.push("</urlset>");
  return lines.join("\n") + "\n";
}

// Returns { "<relative path>": "<content>" } for every generated file.
function buildFiles() {
  var template = fs.readFileSync(path.join(__dirname, "template.html"), "utf8").replace(/\r\n/g, "\n");
  var packs = {};
  PAGES.forEach(function (p) { packs[p.lang] = loadPack(p.lang); });
  var files = {};
  PAGES.forEach(function (p) { files[p.rel] = renderPage(template, p, packs); });
  files["sitemap.xml"] = sitemap();
  return files;
}

function main() {
  var check = process.argv.indexOf("--check") !== -1;
  var files = buildFiles();
  var stale = [];
  Object.keys(files).forEach(function (rel) {
    var file = path.join(ROOT, rel);
    if (check) {
      var now = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
      if (now !== files[rel]) stale.push(rel);
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, files[rel]);
      console.log("wrote " + rel);
    }
  });
  if (check) {
    if (stale.length) {
      console.error("out of date: " + stale.join(", ") + " (run node tools/build.js)");
      process.exit(1);
    }
    console.log("pages are up to date");
  }
}

module.exports = {
  buildFiles: buildFiles,
  PAGES: PAGES,
  SITE: SITE,
  REPO_URL: REPO_URL,
  CSP: CSP,
  SHOW_NO_NETWORK: SHOW_NO_NETWORK,
  DEFAULT_LANG: DEFAULT_LANG
};

if (require.main === module) main();
