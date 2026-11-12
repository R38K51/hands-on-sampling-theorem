"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var h = require("./helpers");
var packs = h.packs();

function placeholders(v) {
  var s = Array.isArray(v) ? v.join("\n") : String(v);
  return (s.match(/\{[a-zA-Z]+\}/g) || []).sort();
}

test("both languages have the same keys", function () {
  assert.deepEqual(Object.keys(packs.en.messages).sort(), Object.keys(packs.ja.messages).sort());
  assert.equal(packs.en.lang, "en");
  assert.equal(packs.ja.lang, "ja");
});

test("no empty text", function () {
  ["en", "ja"].forEach(function (l) {
    var m = packs[l].messages;
    Object.keys(m).forEach(function (k) {
      var v = m[k];
      if (Array.isArray(v)) {
        assert.ok(v.length > 0, l + " " + k);
        v.forEach(function (s) { assert.ok(String(s).trim() !== "", l + " " + k); });
      } else {
        assert.ok(String(v).trim() !== "", l + " " + k);
      }
    });
  });
});

test("placeholders match between languages", function () {
  Object.keys(packs.en.messages).forEach(function (k) {
    assert.deepEqual(placeholders(packs.en.messages[k]), placeholders(packs.ja.messages[k]), k);
  });
});

test("English has no Japanese characters and no Japanese exam names", function () {
  var jp = /[぀-ヿ㐀-鿿！-｠]/;
  h.allStrings(packs.en).forEach(function (s) {
    assert.ok(!jp.test(s), s);
    assert.ok(!/応用情報|基本情報|IPA/.test(s), s);
  });
  assert.deepEqual(packs.en.langOnly, {});
});

test("four choices and four letters in each language", function () {
  ["en", "ja"].forEach(function (l) {
    var m = packs[l].messages;
    assert.equal(m["quiz.letters"].length, 4);
    for (var q = 1; q <= 4; q++) assert.equal(m["quiz.q" + q + ".choices"].length, 4, l + " q" + q);
  });
});

test("agreed wording for the required sampling rate", function () {
  var ja = packs.ja.messages, en = packs.en.messages;
  assert.ok(ja["pcm.r1.formula"].indexOf("定理の条件では、これより大きい値が必要") !== -1);
  assert.ok(ja["quiz.q1.choices"][1].indexOf("より大きい値") !== -1);
  assert.ok(en["pcm.r1.formula"].indexOf("greater than") !== -1);
  assert.ok(en["quiz.q1.choices"][1].indexOf("greater than") !== -1);
  assert.ok(ja["read.1"].indexOf("2倍より大きく") !== -1);
  assert.ok(en["read.1"].indexOf("greater than 2 × fmax") !== -1);
});

test("the 0 Hz sentence and the decimals error from the design", function () {
  assert.equal(packs.ja.messages["verdict.alias.zero"], "測った点は一定の値に見え、波に見えません。");
  assert.equal(packs.en.messages["verdict.alias.zero"], "The samples look constant, not like a wave.");
  assert.equal(packs.ja.messages["pcm.error.fmax.decimals"], "小数は第3位までで入れてください。");
  assert.equal(packs.en.messages["pcm.error.fmax.decimals"], "Use up to three decimal places.");
});

test("calculator starting values: music CD in English, telephone voice in Japanese", function () {
  assert.deepEqual(packs.en.pcmInitial, { fmax: "22.05", bits: "16", ch: "2" });
  assert.deepEqual(packs.ja.pcmInitial, { fmax: "4", bits: "8", ch: "1" });
});

test("English subtitle and the 44.1 kHz section follow the decision", function () {
  var m = packs.en.messages;
  assert.equal(m.subtitle, "Why is CD audio 44.1 kHz? Move the sliders and see.");
  assert.equal(m["why.h2"], "Why is CD audio 44.1 kHz?");
  assert.ok(m["meta.title"].indexOf("Sampling Theorem") !== -1);
});

test("the origin of 44.1 kHz is not stated as a fact, and foldback is not used", function () {
  ["en", "ja"].forEach(function (l) {
    h.allStrings(packs[l]).forEach(function (s) {
      assert.ok(!/foldback|settles on|余裕を足して決まった/i.test(s), s);
    });
  });
});

test("preset names", function () {
  var m = packs.en.messages;
  assert.deepEqual([m["preset.plenty"], m["preset.just"], m["preset.exact"], m["preset.few"]],
    ["Plenty", "Just enough", "Exactly 2×", "Too low (aliasing)"]);
  assert.equal(packs.ja.messages["preset.few"], "足りない（折り返し）");
});
