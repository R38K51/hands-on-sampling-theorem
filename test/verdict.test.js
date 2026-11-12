"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var h = require("./helpers");
var core = h.core();

test("verdict: the three states around fs = 2f", function () {
  assert.equal(core.verdict(4, 8), "edge");
  assert.equal(core.verdict(4, 8.5), "ok");
  assert.equal(core.verdict(4, 7.5), "ng");
});

test("verdict: preset pairs", function () {
  assert.equal(core.verdict(4, 20), "ok");
  assert.equal(core.verdict(4, 9), "ok");
  assert.equal(core.verdict(4, 8), "edge");
  assert.equal(core.verdict(7, 8), "ng");
});

test("aliasFrequency: known pairs", function () {
  assert.equal(core.aliasFrequency(7, 8), 1);
  assert.equal(core.aliasFrequency(9, 10), 1);
});

test("aliasFrequency: f is a whole multiple of fs gives 0", function () {
  assert.equal(core.aliasFrequency(10, 5), 0);
  assert.equal(core.aliasFrequency(6, 2), 0);
  assert.equal(core.aliasFrequency(3, 1.5), 0);
});

test("aliasFrequency: f/fs = k + 0.5 gives fs/2", function () {
  assert.equal(core.aliasFrequency(5, 2), 1);   // 2.5
  assert.equal(core.aliasFrequency(3, 2), 1);   // 1.5
  assert.equal(core.aliasFrequency(7.5, 3), 1.5); // 2.5
  assert.equal(core.aliasFrequency(1, 2), 1);   // 0.5
});

test("aliasFrequency: every slider pair stays within 0..fs/2", function () {
  var fList = h.halfSteps(1, 20);
  var fsList = h.halfSteps(1, 40);
  assert.equal(fList.length, 39);
  assert.equal(fsList.length, 79);
  fList.forEach(function (f) {
    fsList.forEach(function (fs) {
      var a = core.aliasFrequency(f, fs);
      assert.ok(a >= 0 && a <= fs / 2, "f=" + f + " fs=" + fs + " a=" + a);
      // a is a multiple of 0.5 (exact half-Hz arithmetic)
      assert.equal(a * 2, Math.round(a * 2));
    });
  });
});

test("aliasFrequency: rejects values that are not multiples of 0.5", function () {
  assert.throws(function () { core.aliasFrequency(4.2, 8); });
});

test("formatHz: integers have no decimals, halves have one", function () {
  assert.equal(core.formatHz(4), "4");
  assert.equal(core.formatHz(20), "20");
  assert.equal(core.formatHz(0), "0");
  assert.equal(core.formatHz(4.5), "4.5");
  assert.equal(core.formatHz(0.5), "0.5");
});

test("matchPreset: the four pairs and no match", function () {
  assert.equal(core.matchPreset(4, 20), "plenty");
  assert.equal(core.matchPreset(4, 9), "just");
  assert.equal(core.matchPreset(4, 8), "exact");
  assert.equal(core.matchPreset(7, 8), "few");
  assert.equal(core.matchPreset(4, 19.5), null);
  assert.equal(core.matchPreset(8, 4), null);
});

test("formulaParts: three parts, the borderline drops the repeated value", function () {
  assert.deepEqual(core.formulaParts(4, 20), { fs: "20", rel: "gt", f: "4", twice: "8", showTwice: true });
  assert.deepEqual(core.formulaParts(7, 8), { fs: "8", rel: "lt", f: "7", twice: "14", showTwice: true });
  assert.deepEqual(core.formulaParts(4, 8), { fs: "8", rel: "eq", f: "4", twice: "8", showTwice: false });
  assert.equal(core.formulaParts(4.5, 9.5).f, "4.5");
});
