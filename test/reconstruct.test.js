"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var h = require("./helpers");
var core = h.core();

test("sinc: value at 0 and at integers", function () {
  assert.equal(core.sinc(0), 1);
  assert.ok(Math.abs(core.sinc(1)) < 1e-15);
  assert.ok(Math.abs(core.sinc(-3)) < 1e-15);
});

test("sampleTimes: phase 0.3 and the 0..1 s window", function () {
  var s = core.sampleTimes(4, 20, 0, 1);
  assert.equal(s.length, 20);
  assert.ok(Math.abs(s[0].t - 0.3 / 20) < 1e-12);
  s.forEach(function (p) {
    assert.ok(p.t >= 0 && p.t <= 1);
    assert.ok(Math.abs(p.t * 20 - p.n - 0.3) < 1e-9);
  });
});

test("reconstruct: passes exactly through the sample points", function () {
  var wide = core.sampleTimes(4, 9, -5, 6);
  core.sampleTimes(4, 9, 0, 1).forEach(function (p) {
    var y = core.reconstruct(wide, 9, p.t);
    assert.ok(Math.abs(y - p.x) < 1e-9, "t=" + p.t + " diff=" + Math.abs(y - p.x));
  });
});

test("reconstruct: error below 0.06 on 0..1 s for every pair with fs > 2f", function () {
  var worst = 0;
  var checked = 0;
  h.halfSteps(1, 20).forEach(function (f) {
    h.halfSteps(1, 40).forEach(function (fs) {
      if (core.verdict(f, fs) !== "ok") return;
      var m = core.chartModel(f, fs, 200);
      for (var i = 0; i < m.wave.length; i++) {
        var e = Math.abs(m.recon[i].y - m.wave[i].y);
        if (e > worst) worst = e;
      }
      checked++;
    });
  });
  assert.ok(checked > 0);
  assert.ok(worst < 0.06, "worst error " + worst);
});

test("reconstruct: too few samples follow the aliased wave", function () {
  // f = k*fs + d, so x(t_n) = sin(2 pi d t_n + 2 pi k * 0.3).
  [[7, 8], [9, 10], [13, 5], [19.5, 12]].forEach(function (pair) {
    var f = pair[0], fs = pair[1];
    assert.equal(core.verdict(f, fs), "ng");
    var p = core.aliasParts(f, fs);
    assert.equal(Math.abs(p.d), core.aliasFrequency(f, fs));
    if (Math.abs(p.d) * 2 >= fs) return; // exactly fs/2 is not a clean alias
    var m = core.chartModel(f, fs, 200);
    var worst = 0;
    m.recon.forEach(function (r) {
      var expected = Math.sin(2 * Math.PI * p.d * r.t + 2 * Math.PI * p.k * core.PHASE);
      worst = Math.max(worst, Math.abs(r.y - expected));
    });
    assert.ok(worst < 0.06, "f=" + f + " fs=" + fs + " worst " + worst);
  });
});

test("chartModel: point count, sample window and phase", function () {
  var m = core.chartModel(4, 20, 358);
  assert.equal(m.wave.length, 716);
  assert.equal(m.recon.length, 716);
  assert.equal(m.wave[0].t, 0);
  assert.equal(m.wave[m.wave.length - 1].t, 1);
  assert.equal(m.samples.length, 20);
  m.samples.forEach(function (s) { assert.ok(s.t >= 0 && s.t <= 1); });
  assert.ok(Math.abs(m.samples[0].t - 0.3 / 20) < 1e-12);
  assert.equal(core.chartModel(4, 20, 5000).wave.length, 1600);
  assert.equal(core.chartModel(4, 20, 0).wave.length, 2);
});
