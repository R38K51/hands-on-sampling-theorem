"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var h = require("./helpers");
var core = h.core();
var packs = h.packs();

test("formatInt: thousands separators", function () {
  assert.equal(core.formatInt(0), "0");
  assert.equal(core.formatInt(999), "999");
  assert.equal(core.formatInt(1000), "1,000");
  assert.equal(core.formatInt(999999), "999,999");
  assert.equal(core.formatInt(1000000), "1,000,000");
  assert.equal(core.formatInt(3840000000), "3,840,000,000");
});

test("formatKHz: integer hertz to kHz text", function () {
  assert.equal(core.formatKHz(4000), "4");
  assert.equal(core.formatKHz(8000), "8");
  assert.equal(core.formatKHz(22050), "22.05");
  assert.equal(core.formatKHz(44100), "44.1");
  assert.equal(core.formatKHz(1), "0.001");
  assert.equal(core.formatKHz(2000000), "2,000");
});

test("formatRate: integer always, k only from 1,000, never M", function () {
  assert.deepEqual(core.formatRate(999), { bps: "999", k: null });
  assert.deepEqual(core.formatRate(1000), { bps: "1,000", k: "1" });
  assert.deepEqual(core.formatRate(64000), { bps: "64,000", k: "64" });
  assert.deepEqual(core.formatRate(1411200), { bps: "1,411,200", k: "1,411.2" });
  assert.deepEqual(core.formatRate(999999), { bps: "999,999", k: "1,000" });
  assert.deepEqual(core.formatRate(512000000), { bps: "512,000,000", k: "512,000" });
});

test("formatRate: rounding half up at one decimal", function () {
  assert.equal(core.formatRate(1050).k, "1.1");
  assert.equal(core.formatRate(1049).k, "1");
  assert.equal(core.formatRate(1150).k, "1.2");
  assert.equal(core.formatRate(2).k, null);
});

test("formatBytes: integer always, about M only from 1,000,000", function () {
  assert.deepEqual(core.formatBytes(480000), { bytes: "480,000", m: null });
  assert.deepEqual(core.formatBytes(999999), { bytes: "999,999", m: null });
  assert.deepEqual(core.formatBytes(1000000), { bytes: "1,000,000", m: "1" });
  assert.deepEqual(core.formatBytes(10584000), { bytes: "10,584,000", m: "10.6" });
  assert.deepEqual(core.formatBytes(12000000), { bytes: "12,000,000", m: "12" });
  assert.equal(core.formatBytes(1050000).m, "1.1");
  assert.equal(core.formatBytes(1049999).m, "1");
  assert.equal(core.formatBytes(3840000000).m, "3,840");
});

function rateText(pack, bps) {
  var r = core.formatRate(bps);
  return core.fill(pack.messages[r.k ? "pcm.rate.k" : "pcm.rate.plain"], r);
}
function bytesText(pack, bytes) {
  var b = core.formatBytes(bytes);
  return core.fill(pack.messages[b.m ? "pcm.bytes.m" : "pcm.bytes.plain"], b);
}

test("result text: the examples in the design document", function () {
  assert.equal(rateText(packs.ja, 64000), "64,000 ビット/秒（64 kビット/秒）");
  assert.equal(rateText(packs.en, 64000), "64,000 bit/s (64 kbit/s)");
  assert.equal(rateText(packs.ja, 1411200), "1,411,200 ビット/秒（1,411.2 kビット/秒）");
  assert.equal(rateText(packs.en, 1411200), "1,411,200 bit/s (1,411.2 kbit/s)");
  assert.equal(rateText(packs.ja, 500), "500 ビット/秒");
  assert.equal(bytesText(packs.ja, 480000), "480,000 バイト");
  assert.equal(bytesText(packs.en, 480000), "480,000 bytes");
  assert.equal(bytesText(packs.ja, 10584000), "10,584,000 バイト（約 10.6 Mバイト）");
  assert.equal(bytesText(packs.en, 10584000), "10,584,000 bytes (about 10.6 MB)");
  assert.equal(bytesText(packs.ja, 12000000), "12,000,000 バイト（約 12 Mバイト）");
});

test("result 1 text: required sampling rate", function () {
  var r = core.pcm("4", "8", "1").result;
  var v = { fmax: core.formatKHz(r.fmaxHz), value: core.formatKHz(r.fsHz) };
  assert.equal(core.fill(packs.ja.messages["pcm.r1.formula"], v),
    "2 × 4 kHz = 8 kHz（定理の条件では、これより大きい値が必要）");
  assert.equal(core.fill(packs.en.messages["pcm.r1.formula"], v),
    "2 × 4 kHz = 8 kHz (the theorem requires a rate greater than this)");
  var cd = core.pcm("22.05", "16", "2").result;
  assert.equal(core.fill(packs.ja.messages["pcm.r1.formula"],
    { fmax: core.formatKHz(cd.fmaxHz), value: core.formatKHz(cd.fsHz) }),
    "2 × 22.05 kHz = 44.1 kHz（定理の条件では、これより大きい値が必要）");
});

test("no M for the bit rate in either language", function () {
  ["ja", "en"].forEach(function (l) {
    assert.ok(!/Mビット|Mbit/.test(JSON.stringify(packs[l].messages)), l);
  });
});
