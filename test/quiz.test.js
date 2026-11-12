"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var h = require("./helpers");
var core = h.core();
var packs = h.packs();

test("answers: one position per question, within 0..3", function () {
  assert.equal(core.ANSWERS.length, 4);
  core.ANSWERS.forEach(function (a) { assert.ok(a >= 0 && a <= 3); });
  assert.deepEqual(core.ANSWERS, [1, 2, 0, 3]);
  // The four correct answers sit at four different positions.
  assert.equal(new Set(core.ANSWERS).size, 4);
});

test("checkAnswer: right and wrong choices", function () {
  assert.equal(core.checkAnswer(1, 1), true);
  assert.equal(core.checkAnswer(1, 2), false);
  assert.equal(core.checkAnswer(3, 0), true);
  assert.equal(core.checkAnswer(3, 1), false);
  assert.throws(function () { core.checkAnswer(5, 0); });
});

test("question 2: 64 kbit/s matches the calculator", function () {
  // 8 kHz sampling is fmax 4 kHz in the calculator.
  var r = core.pcm("4", "8", "1").result;
  assert.equal(r.bps, 64000);
  var k = core.formatRate(r.bps).k;
  assert.equal(packs.ja.messages["quiz.q2.choices"][core.correctIndex(2)], k + " kビット/秒");
  assert.equal(packs.en.messages["quiz.q2.choices"][core.correctIndex(2)], k + " kbit/s");
});

test("question 3: 1 Hz matches the alias calculation", function () {
  var a = core.formatHz(core.aliasFrequency(9, 10));
  assert.equal(a, "1");
  assert.equal(packs.ja.messages["quiz.q3.choices"][core.correctIndex(3)], a + " Hz");
  assert.equal(packs.en.messages["quiz.q3.choices"][core.correctIndex(3)], a + " Hz");
});

test("question 4: 10,584,000 bytes, about 10.6 MB", function () {
  // 44.1 kHz sampling is fmax 22.05 kHz in the calculator.
  var r = core.pcm("22.05", "16", "2").result;
  assert.equal(r.bytesPerMinute, 10584000);
  var m = core.formatBytes(r.bytesPerMinute).m;
  assert.equal(packs.ja.messages["quiz.q4.choices"][core.correctIndex(4)], "約 " + m + " Mバイト");
  assert.equal(packs.en.messages["quiz.q4.choices"][core.correctIndex(4)], "About " + m + " MB");
});

test("question 1: the correct choice uses the agreed wording", function () {
  var ja = packs.ja.messages["quiz.q1.choices"][core.correctIndex(1)];
  var en = packs.en.messages["quiz.q1.choices"][core.correctIndex(1)];
  assert.ok(ja.indexOf("20 kHz より大きい値") === 0, ja);
  assert.ok(ja.indexOf("（") === -1, ja);
  assert.ok(/^A value greater than 20 kHz/.test(en), en);
  assert.ok(en.indexOf("(") === -1, en);
});
