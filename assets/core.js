/*
 * Core logic for Hands-On Sampling Theorem. No DOM, clock or storage access.
 * Slider values are multiples of 0.5 Hz. PCM values are computed with
 * integers (Hz, bit/s, bytes) so that no rounding error appears.
 */
(function (root) {
  "use strict";

  var PHASE = 0.3;      // sample points are shifted by 0.3 of a sample
  var PAD_SECONDS = 5;  // samples used for sinc reconstruction: [-5, 6] s
  var MAX_POINTS = 1600;
  var MIN_POINTS = 2;

  var PRESETS = [
    { id: "plenty", f: 4, fs: 20 },
    { id: "just", f: 4, fs: 9 },
    { id: "exact", f: 4, fs: 8 },
    { id: "few", f: 7, fs: 8 }
  ];

  // Example inputs of the calculator (text as typed: kHz, bits, channels).
  var PCM_EXAMPLES = [
    { id: "phone", fmax: "4", bits: "8", ch: "1" },
    { id: "cd", fmax: "22.05", bits: "16", ch: "2" }
  ];

  // Index (0-3) of the correct choice for question 1..4.
  var ANSWERS = [1, 2, 0, 3];

  var LIMITS = {
    fmaxMaxHz: 1000000, // 1,000 kHz
    fmaxDecimals: 3,
    bitsMin: 1,
    bitsMax: 32,
    chMin: 1,
    chMax: 8
  };

  // ---------- sampling ----------

  // Twice the value as an integer. Throws when x is not a multiple of 0.5.
  function halfUnits(x) {
    var h = x * 2;
    if (typeof x !== "number" || !isFinite(x) || Math.round(h) !== h) {
      throw new Error("value must be a multiple of 0.5: " + x);
    }
    return h;
  }

  function verdict(f, fs) {
    var two = 2 * f;
    if (fs > two) return "ok";
    if (fs === two) return "edge";
    return "ng";
  }

  // Parts of the verdict formula, each kept on one line by the page:
  // fs, relation (ok: gt, edge: eq, ng: lt), 2 x f and, except at the borderline,
  // the value of 2 x f in parentheses (it would repeat fs there).
  function formulaParts(f, fs) {
    var v = verdict(f, fs);
    return {
      fs: formatHz(fs),
      rel: v === "ok" ? "gt" : (v === "edge" ? "eq" : "lt"),
      f: formatHz(f),
      twice: formatHz(2 * f),
      showTwice: v !== "edge"
    };
  }

  // |f - round(f/fs) * fs|, computed in half-Hz integers.
  function aliasFrequency(f, fs) {
    var F = halfUnits(f);
    var S = halfUnits(fs);
    if (S <= 0) throw new Error("fs must be positive");
    var k = Math.floor((2 * F + S) / (2 * S)); // round half up of F / S
    return Math.abs(F - k * S) / 2;
  }

  // Signed distance f - k*fs to the nearest multiple, and that k.
  function aliasParts(f, fs) {
    var F = halfUnits(f);
    var S = halfUnits(fs);
    var k = Math.floor((2 * F + S) / (2 * S));
    return { k: k, d: (F - k * S) / 2 };
  }

  // Integer: no decimals. Otherwise one decimal (slider values give .5).
  function formatHz(x) {
    var r = Math.round(x * 10) / 10;
    if (r === Math.floor(r)) return String(r);
    return r.toFixed(1);
  }

  function sinc(u) {
    if (u === 0) return 1;
    var p = Math.PI * u;
    return Math.sin(p) / p;
  }

  // Samples x(t_n) = sin(2 pi f t_n), t_n = (n + PHASE) / fs, with t0 <= t_n <= t1.
  function sampleTimes(f, fs, t0, t1) {
    var first = Math.ceil(t0 * fs - PHASE);
    var last = Math.floor(t1 * fs - PHASE);
    var out = [];
    for (var n = first; n <= last; n++) {
      var t = (n + PHASE) / fs;
      out.push({ n: n, t: t, x: Math.sin(2 * Math.PI * f * t) });
    }
    return out;
  }

  // x_r(t) = sum x(t_n) * sinc(fs * t - (n + PHASE)).
  function reconstruct(samples, fs, t) {
    var sum = 0;
    for (var i = 0; i < samples.length; i++) {
      var s = samples[i];
      sum += s.x * sinc(fs * t - (s.n + PHASE));
    }
    return sum;
  }

  function pointCount(widthPx) {
    var n = Math.round(Number(widthPx) * 2);
    if (!isFinite(n) || n < MIN_POINTS) n = MIN_POINTS;
    if (n > MAX_POINTS) n = MAX_POINTS;
    return n;
  }

  // Chart data in seconds and amplitude. The chart shows 0 to 1 s.
  function chartModel(f, fs, widthPx) {
    var count = pointCount(widthPx);
    var wide = sampleTimes(f, fs, -PAD_SECONDS, 1 + PAD_SECONDS);
    var wave = [];
    var recon = [];
    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      wave.push({ t: t, y: Math.sin(2 * Math.PI * f * t) });
      recon.push({ t: t, y: reconstruct(wide, fs, t) });
    }
    return {
      f: f,
      fs: fs,
      wave: wave,
      recon: recon,
      samples: sampleTimes(f, fs, 0, 1).map(function (s) { return { t: s.t, y: s.x }; })
    };
  }

  function matchPreset(f, fs) {
    for (var i = 0; i < PRESETS.length; i++) {
      if (PRESETS[i].f === f && PRESETS[i].fs === fs) return PRESETS[i].id;
    }
    return null;
  }

  // ---------- input reading ----------

  function normalize(text) {
    var s = String(text == null ? "" : text);
    s = s.replace(/[０-９]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xFF10 + 48);
    });
    s = s.replace(/．/g, ".");
    s = s.trim(); // also removes the full-width space U+3000
    s = s.replace(/[,，]/g, "");
    return s;
  }

  // Result: { state: "empty" | "nan" | "ok", int, frac } where int and frac
  // are digit strings. A leading "-" before a number is "range"; "+", exponents and hex are "nan".
  function readDigits(text) {
    var s = normalize(text);
    if (s === "") return { state: "empty" };
    // A minus sign before a number is a number outside the range, not "not a number".
    if (/^-(\d+(\.\d*)?|\.\d+)$/.test(s)) return { state: "range" };
    var m = /^(\d*)(?:\.(\d*))?$/.exec(s);
    if (!m || (m[1] === "" && (m[2] === undefined || m[2] === ""))) return { state: "nan" };
    return { state: "ok", int: m[1] || "0", frac: m[2] || "" };
  }

  // fmax in kHz text -> { state, hz }. state: empty | nan | decimals | range | ok.
  function parseFmax(text) {
    var r = readDigits(text);
    if (r.state !== "ok") return { state: r.state };
    var frac = r.frac.replace(/0+$/, "");
    if (frac.length > LIMITS.fmaxDecimals) return { state: "decimals" };
    while (frac.length < 3) frac += "0";
    var intPart = r.int.replace(/^0+(?=\d)/, "");
    if (intPart.length > 7) return { state: "range" };
    var hz = Number(intPart) * 1000 + Number(frac);
    if (hz <= 0 || hz > LIMITS.fmaxMaxHz) return { state: "range" };
    return { state: "ok", hz: hz };
  }

  // Whole number within [min, max] -> { state, value }. A fraction is "range"
  // (the message asks for a whole number in the range).
  function parseInteger(text, min, max) {
    var r = readDigits(text);
    if (r.state !== "ok") return { state: r.state };
    if (/[1-9]/.test(r.frac)) return { state: "range" };
    var intPart = r.int.replace(/^0+(?=\d)/, "");
    if (intPart.length > 6) return { state: "range" };
    var v = Number(intPart);
    if (v < min || v > max) return { state: "range" };
    return { state: "ok", value: v };
  }

  // Result: { state: "ok" | "empty" | "error", fields: {fmax, bits, ch}, result }
  // state "empty": no error but at least one field is empty.
  function pcm(fmaxText, bitsText, chText) {
    var fields = {
      fmax: parseFmax(fmaxText),
      bits: parseInteger(bitsText, LIMITS.bitsMin, LIMITS.bitsMax),
      ch: parseInteger(chText, LIMITS.chMin, LIMITS.chMax)
    };
    var names = ["fmax", "bits", "ch"];
    var anyError = names.some(function (n) {
      var s = fields[n].state;
      return s !== "ok" && s !== "empty";
    });
    var anyEmpty = names.some(function (n) { return fields[n].state === "empty"; });
    if (anyError) return { state: "error", fields: fields, result: null };
    if (anyEmpty) return { state: "empty", fields: fields, result: null };
    var fmaxHz = fields.fmax.hz;
    var fsHz = 2 * fmaxHz;
    var bps = fsHz * fields.bits.value * fields.ch.value;
    var bytesPerMinute = bps * 60 / 8; // = 15 * fmaxHz * bits * ch, an integer
    return {
      state: "ok",
      fields: fields,
      result: { fmaxHz: fmaxHz, fsHz: fsHz, bps: bps, bytesPerMinute: bytesPerMinute }
    };
  }

  // ---------- number format (own code, independent of the device locale) ----------

  function formatInt(n) {
    var neg = n < 0;
    var s = String(Math.abs(Math.round(n)));
    var out = "";
    while (s.length > 3) {
      out = "," + s.slice(-3) + out;
      s = s.slice(0, -3);
    }
    return (neg ? "-" : "") + s + out;
  }

  // Integer hertz -> kHz text with up to three decimals, no trailing zeros.
  function formatKHz(hz) {
    var whole = Math.floor(hz / 1000);
    var frac = String(hz % 1000);
    while (frac.length < 3) frac = "0" + frac;
    frac = frac.replace(/0+$/, "");
    return formatInt(whole) + (frac ? "." + frac : "");
  }

  // Non-negative integer divided by unit, rounded half up to one decimal,
  // no ".0". Integer arithmetic: unit is 1,000 or 1,000,000.
  function oneDecimal(n, unit) {
    var tenths = Math.floor((n * 10 + unit / 2) / unit);
    var whole = Math.floor(tenths / 10);
    var d = tenths % 10;
    return formatInt(whole) + (d ? "." + d : "");
  }

  // Bit rate: the integer always; k (one decimal) only from 1,000. Never M.
  function formatRate(bps) {
    return { bps: formatInt(bps), k: bps >= 1000 ? oneDecimal(bps, 1000) : null };
  }

  // Bytes: the integer always; about M (one decimal) only from 1,000,000.
  function formatBytes(bytes) {
    return { bytes: formatInt(bytes), m: bytes >= 1000000 ? oneDecimal(bytes, 1000000) : null };
  }

  // ---------- text ----------

  // Replaces {name} with values[name]. Unknown names are left as they are.
  function fill(template, values) {
    return String(template).replace(/\{([a-zA-Z]+)\}/g, function (all, name) {
      return Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : all;
    });
  }

  // ---------- quiz ----------

  // q is 1..4, choice is 0..3.
  function checkAnswer(q, choice) {
    if (q < 1 || q > ANSWERS.length) throw new Error("no such question: " + q);
    return ANSWERS[q - 1] === choice;
  }

  function correctIndex(q) {
    if (q < 1 || q > ANSWERS.length) throw new Error("no such question: " + q);
    return ANSWERS[q - 1];
  }

  var api = {
    PHASE: PHASE,
    PAD_SECONDS: PAD_SECONDS,
    MAX_POINTS: MAX_POINTS,
    PRESETS: PRESETS,
    PCM_EXAMPLES: PCM_EXAMPLES,
    ANSWERS: ANSWERS,
    LIMITS: LIMITS,
    verdict: verdict,
    formulaParts: formulaParts,
    aliasFrequency: aliasFrequency,
    aliasParts: aliasParts,
    formatHz: formatHz,
    sinc: sinc,
    sampleTimes: sampleTimes,
    reconstruct: reconstruct,
    pointCount: pointCount,
    chartModel: chartModel,
    matchPreset: matchPreset,
    normalize: normalize,
    parseFmax: parseFmax,
    parseInteger: parseInteger,
    pcm: pcm,
    formatInt: formatInt,
    formatKHz: formatKHz,
    formatRate: formatRate,
    formatBytes: formatBytes,
    fill: fill,
    checkAnswer: checkAnswer,
    correctIndex: correctIndex
  };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.HST_CORE = api;
  }
})(this);
