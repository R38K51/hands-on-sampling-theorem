"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var h = require("./helpers");
var core = h.core();

function fmax(text) { return core.parseFmax(text); }
function bits(text) { return core.parseInteger(text, 1, 32); }

test("parseFmax: plain, full-width, separators and spaces", function () {
  assert.deepEqual(fmax("4"), { state: "ok", hz: 4000 });
  assert.deepEqual(fmax("22.05"), { state: "ok", hz: 22050 });
  assert.deepEqual(fmax("２２．０５"), { state: "ok", hz: 22050 });
  assert.deepEqual(fmax("1,000"), { state: "ok", hz: 1000000 });
  assert.deepEqual(fmax("1，000"), { state: "ok", hz: 1000000 });
  assert.deepEqual(fmax("  4 "), { state: "ok", hz: 4000 });
  assert.deepEqual(fmax("　4　"), { state: "ok", hz: 4000 });
  assert.deepEqual(fmax("0.001"), { state: "ok", hz: 1 });
  assert.deepEqual(fmax(".5"), { state: "ok", hz: 500 });
});

test("parseFmax: empty and not a number", function () {
  assert.equal(fmax("").state, "empty");
  assert.equal(fmax("   ").state, "empty");
  ["abc", "1e3", "+1", "0x10", ".", "1.2.3", "4k"].forEach(function (s) {
    assert.equal(fmax(s).state, "nan", s);
  });
});

test("parseFmax: range and decimals", function () {
  assert.equal(fmax("0").state, "range");
  assert.equal(fmax("0.000").state, "range");
  assert.equal(fmax("1000").state, "ok");
  assert.equal(fmax("1000.001").state, "range");
  assert.equal(fmax("1001").state, "range");
  assert.equal(fmax("99999999999999999999").state, "range");
  assert.equal(fmax("4.0001").state, "decimals");
  assert.deepEqual(fmax("4.5000"), { state: "ok", hz: 4500 });
});

test("parseInteger: bits and channels", function () {
  assert.deepEqual(bits("8"), { state: "ok", value: 8 });
  assert.deepEqual(bits("３２"), { state: "ok", value: 32 });
  assert.deepEqual(bits("1"), { state: "ok", value: 1 });
  assert.equal(bits("0").state, "range");
  assert.equal(bits("33").state, "range");
  assert.equal(bits("8.5").state, "range");
  assert.deepEqual(bits("8.0"), { state: "ok", value: 8 });
  assert.equal(bits("").state, "empty");
  assert.equal(bits("-1").state, "range");
  assert.equal(fmax("-1").state, "range");
  assert.equal(fmax("-").state, "nan");
  assert.equal(bits("1e1").state, "nan");
  assert.deepEqual(core.parseInteger("8", 1, 8), { state: "ok", value: 8 });
  assert.equal(core.parseInteger("9", 1, 8).state, "range");
  assert.equal(core.parseInteger("1.5", 1, 8).state, "range");
});

test("pcm: 4 kHz, 8 bits, 1 channel", function () {
  var r = core.pcm("4", "8", "1");
  assert.equal(r.state, "ok");
  assert.deepEqual(r.result, { fmaxHz: 4000, fsHz: 8000, bps: 64000, bytesPerMinute: 480000 });
});

test("pcm: 22.05 kHz, 16 bits, 2 channels in exact integers", function () {
  var r = core.pcm("22.05", "16", "2");
  assert.equal(r.state, "ok");
  assert.equal(r.result.fsHz, 44100);
  assert.equal(r.result.bps, 1411200);
  assert.equal(r.result.bytesPerMinute, 10584000);
  assert.ok(Number.isInteger(r.result.bytesPerMinute));
});

test("pcm: the largest and the smallest inputs", function () {
  var big = core.pcm("1000", "32", "8").result;
  assert.equal(big.bps, 2000000 * 32 * 8);
  assert.equal(big.bytesPerMinute, 3840000000);
  var small = core.pcm("0.001", "1", "1").result;
  assert.equal(small.fsHz, 2);
  assert.equal(small.bps, 2);
  assert.equal(small.bytesPerMinute, 15);
});

test("pcm: bytes per minute is always an integer at 1 Hz steps", function () {
  ["0.001", "0.003", "11.025", "999.999", "7.777"].forEach(function (t) {
    [1, 3, 7, 32].forEach(function (b) {
      var r = core.pcm(t, String(b), "3").result;
      assert.ok(Number.isInteger(r.bytesPerMinute), t + " " + b);
    });
  });
});

test("pcm: empty and error states", function () {
  assert.equal(core.pcm("", "", "").state, "empty");
  assert.equal(core.pcm("4", "", "1").state, "empty");
  var e = core.pcm("abc", "8", "1");
  assert.equal(e.state, "error");
  assert.equal(e.result, null);
  assert.equal(e.fields.fmax.state, "nan");
  assert.equal(core.pcm("4", "40", "").state, "error");
  assert.equal(core.pcm("4.0001", "8", "1").fields.fmax.state, "decimals");
});

test("pcm: starting values of each language give the expected results", function () {
  var h = require("./helpers");
  var packs = h.packs();
  var en = packs.en.pcmInitial;
  var ja = packs.ja.pcmInitial;
  assert.equal(core.pcm(en.fmax, en.bits, en.ch).result.bps, 1411200);
  assert.equal(core.pcm(ja.fmax, ja.bits, ja.ch).result.bps, 64000);
  // The starting values equal one of the example buttons in each language.
  [en, ja].forEach(function (p) {
    assert.ok(core.PCM_EXAMPLES.some(function (e) {
      return e.fmax === p.fmax && e.bits === p.bits && e.ch === p.ch;
    }));
  });
});
