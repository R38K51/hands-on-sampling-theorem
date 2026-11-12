/*
 * Page wiring for Hands-On Sampling Theorem: sliders, presets, verdict,
 * PCM calculator and practice questions. Nothing is stored or sent.
 */
(function () {
  "use strict";

  var core = window.HST_CORE;
  var chart = window.HST_CHART;
  var pack = window.HST_I18N;
  if (!core || !pack) return;
  var M = pack.messages;
  var SYMBOLS = { ok: "✓", edge: "△", ng: "✕" };
  var LIVE_DELAY = 500; // screen reader text lags the last operation by 0.5 s

  function $(id) { return document.getElementById(id); }
  function msg(key, values) { return values ? core.fill(M[key], values) : M[key]; }

  // ---------- waves and sampling ----------

  var SEP = M["live.sep"];
  var canvas = $("chart");
  var chartStatus = $("chart-status");
  var fInput = $("f-input");
  var fsInput = $("fs-input");
  var ctx = null;
  var state = { f: 4, fs: 20 };
  var verdictTimer = null;

  try { ctx = canvas.getContext("2d"); } catch (e) { ctx = null; }
  if (!ctx) {
    canvas.hidden = true;
    chartStatus.textContent = M["chart.unavailable"];
    chartStatus.className = "chart-status chart-unavailable";
  }

  function cssColors() {
    var cs = window.getComputedStyle(document.documentElement);
    function v(name) { return cs.getPropertyValue(name).trim(); }
    return {
      bg: v("--c-surface"), axis: v("--c-axis"), wave: v("--c-wave"),
      sample: v("--c-sample"), recon: v("--c-recon"), font: v("--font-ui")
    };
  }

  function drawNow() {
    if (!ctx) return;
    var cssW = canvas.clientWidth;
    if (!cssW) return;
    var cssH = Math.round(cssW / 2);
    var dpr = window.devicePixelRatio || 1;
    var pw = Math.round(cssW * dpr);
    var ph = Math.round(cssH * dpr);
    if (canvas.width !== pw) canvas.width = pw;
    if (canvas.height !== ph) canvas.height = ph;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var model = core.chartModel(state.f, state.fs, cssW);
    chart.drawChart(ctx, model, cssColors(), cssW, cssH, { seconds: M["chart.seconds"] });
    if (chartStatus.className.indexOf("chart-unavailable") === -1) chartStatus.hidden = true;
  }

  function aliasSentence() {
    var a = core.aliasFrequency(state.f, state.fs);
    return a === 0 ? M["verdict.alias.zero"] : msg("verdict.alias", { a: core.formatHz(a) });
  }

  function renderWave() {
    var f = state.f;
    var fs = state.fs;
    var v = core.verdict(f, fs);
    var fText = core.formatHz(f);
    var fsText = core.formatHz(fs);
    var parts = core.formulaParts(f, fs);
    var title = SYMBOLS[v] + " " + M["verdict." + v + ".title"];
    var text = M["verdict." + v + ".text"];
    // Japanese has no space after the full stop.
    if (v === "ng") text += (SEP === "。" ? "" : " ") + aliasSentence();

    $("verdict").className = "verdict verdict-" + v;
    $("verdict-note").className = "verdict verdict-note verdict-" + v;
    $("verdict-title").textContent = title;
    // Three parts; each stays on one line and the line may break between them.
    var texts = [
      msg("formula.fs", { fs: parts.fs }),
      msg("formula.rhs", { rel: M["verdict.rel." + parts.rel], f: parts.f })
    ];
    if (parts.showTwice) texts.push(msg("formula.twice", { twice: parts.twice }));
    var formulaEl = $("verdict-formula");
    formulaEl.textContent = "";
    texts.forEach(function (s, i) {
      if (i) formulaEl.appendChild(document.createTextNode(" "));
      var span = document.createElement("span");
      span.className = "part";
      span.textContent = s;
      formulaEl.appendChild(span);
    });
    $("verdict-text").textContent = text;

    $("f-value").textContent = fText + " " + M["slider.unit"];
    $("fs-value").textContent = fsText + " " + M["slider.unit"];
    fInput.setAttribute("aria-valuetext", msg("slider.valuetext", { v: fText }));
    fsInput.setAttribute("aria-valuetext", msg("slider.valuetext", { v: fsText }));

    var label = msg("chart.label." + v, { f: fText, fs: fsText });
    if (v === "ng") label += " " + aliasSentence();
    canvas.setAttribute("aria-label", label);

    var pressed = core.matchPreset(f, fs);
    Array.prototype.forEach.call(document.querySelectorAll(".preset"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-preset") === pressed ? "true" : "false");
    });

    drawNow();

    window.clearTimeout(verdictTimer);
    verdictTimer = window.setTimeout(function () {
      $("verdict-live").textContent = title + SEP + text;
    }, LIVE_DELAY);
  }

  function readSliders() {
    state.f = Number(fInput.value);
    state.fs = Number(fsInput.value);
    renderWave();
  }

  // PageUp / PageDown move the sliders by 5 (design: accessibility).
  function pageStep(e) {
    if (e.key !== "PageUp" && e.key !== "PageDown") return;
    e.preventDefault();
    var el = e.target;
    var v = Number(el.value) + (e.key === "PageUp" ? 5 : -5);
    el.value = Math.min(Number(el.max), Math.max(Number(el.min), v));
    readSliders();
  }
  fInput.addEventListener("keydown", pageStep);
  fsInput.addEventListener("keydown", pageStep);
  fInput.addEventListener("input", readSliders);
  fsInput.addEventListener("input", readSliders);
  Array.prototype.forEach.call(document.querySelectorAll(".preset"), function (b) {
    b.addEventListener("click", function () {
      fInput.value = b.getAttribute("data-f");
      fsInput.value = b.getAttribute("data-fs");
      readSliders();
    });
  });

  if (window.ResizeObserver) {
    new window.ResizeObserver(drawNow).observe(canvas);
  } else {
    window.addEventListener("resize", drawNow);
  }
  if (window.matchMedia) {
    var scheme = window.matchMedia("(prefers-color-scheme: dark)");
    if (scheme.addEventListener) scheme.addEventListener("change", drawNow);
  }

  // ---------- PCM calculator ----------

  var pcmTimer = null;
  var FIELDS = [
    { name: "fmax", input: $("pcm-fmax") },
    { name: "bits", input: $("pcm-bits") },
    { name: "ch", input: $("pcm-ch") }
  ];

  function fieldError(name, st) {
    if (st === "nan") return M["pcm.error.nan"];
    if (st === "decimals") return M["pcm.error.fmax.decimals"];
    if (st === "range") return M["pcm.error." + name + ".range"];
    return "";
  }

  function renderPcm() {
    var r = core.pcm(FIELDS[0].input.value, FIELDS[1].input.value, FIELDS[2].input.value);
    FIELDS.forEach(function (fd) {
      var text = fieldError(fd.name, r.fields[fd.name].state);
      $("pcm-" + fd.name + "-error").textContent = text ? "！" + text : "";
      if (text) fd.input.setAttribute("aria-invalid", "true");
      else fd.input.removeAttribute("aria-invalid");
    });
    $("pcm-empty").hidden = r.state !== "empty";

    var none = M["pcm.none"];
    var r1 = none;
    var r2 = none;
    var r3 = none;
    var formula = "";
    if (r.state === "ok") {
      var res = r.result;
      var rate = core.formatRate(res.bps);
      var bytes = core.formatBytes(res.bytesPerMinute);
      r1 = msg("pcm.r1.value", { value: core.formatKHz(res.fsHz) });
      formula = msg("pcm.r1.formula", { fmax: core.formatKHz(res.fmaxHz), value: core.formatKHz(res.fsHz) });
      r2 = rate.k === null ? msg("pcm.rate.plain", { bps: rate.bps }) : msg("pcm.rate.k", { bps: rate.bps, k: rate.k });
      r3 = bytes.m === null ? msg("pcm.bytes.plain", { bytes: bytes.bytes }) : msg("pcm.bytes.m", { bytes: bytes.bytes, m: bytes.m });
    }
    $("pcm-r1").textContent = r1;
    $("pcm-r1-formula").textContent = formula;
    $("pcm-r2").textContent = r2;
    $("pcm-r3").textContent = r3;

    window.clearTimeout(pcmTimer);
    pcmTimer = window.setTimeout(function () {
      $("pcm-live").textContent = r.state === "ok"
        ? M["pcm.r1.label"] + ": " + r1 + SEP + M["pcm.r2.label"] + ": " + r2 + SEP + M["pcm.r3.label"] + ": " + r3 + SEP.trim()
        : "";
    }, LIVE_DELAY);
  }

  // An example button is pressed while the three inputs equal its values.
  function markExamples() {
    Array.prototype.forEach.call(document.querySelectorAll(".example"), function (b) {
      var same = core.normalize(FIELDS[0].input.value) === b.getAttribute("data-fmax") &&
        core.normalize(FIELDS[1].input.value) === b.getAttribute("data-bits") &&
        core.normalize(FIELDS[2].input.value) === b.getAttribute("data-ch");
      b.setAttribute("aria-pressed", same ? "true" : "false");
    });
  }

  FIELDS.forEach(function (fd) {
    fd.input.addEventListener("input", function () { renderPcm(); markExamples(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".example"), function (b) {
    b.addEventListener("click", function () {
      FIELDS[0].input.value = b.getAttribute("data-fmax");
      FIELDS[1].input.value = b.getAttribute("data-bits");
      FIELDS[2].input.value = b.getAttribute("data-ch");
      renderPcm();
      markExamples();
    });
  });

  // ---------- practice questions ----------

  var letters = M["quiz.letters"];

  Array.prototype.forEach.call(document.querySelectorAll(".quiz"), function (box) {
    var q = Number(box.getAttribute("data-q"));
    var radios = box.querySelectorAll('input[type="radio"]');
    var check = box.querySelector(".check");
    var hint = box.querySelector(".hint");
    var result = box.querySelector(".quiz-result");
    var verdictLine = box.querySelector(".quiz-verdict");
    var retry = box.querySelector(".retry");
    result.setAttribute("role", "status");

    function chosen() {
      for (var i = 0; i < radios.length; i++) if (radios[i].checked) return i;
      return -1;
    }

    function reset() {
      result.hidden = true;
      retry.hidden = true;
      var sel = chosen();
      check.disabled = sel === -1;
      hint.hidden = sel !== -1;
    }

    Array.prototype.forEach.call(radios, function (r) { r.addEventListener("change", reset); });
    check.addEventListener("click", function () {
      var sel = chosen();
      if (sel === -1) return;
      var ok = core.checkAnswer(q, sel);
      verdictLine.textContent = ok ? M["quiz.correct"] : msg("quiz.wrong", { letter: letters[core.correctIndex(q)] });
      verdictLine.className = "quiz-verdict " + (ok ? "is-correct" : "is-wrong");
      result.hidden = false;
      retry.hidden = ok;
      check.disabled = true;
      // The button is disabled now; keep keyboard focus next to the result.
      (retry.hidden ? radios[Math.max(sel, 0)] : retry).focus();
    });
    retry.addEventListener("click", function () {
      reset();
      if (radios[0]) radios[Math.max(chosen(), 0)].focus();
    });
  });

  // ---------- start ----------

  renderWave();
  renderPcm();
  markExamples();
  $("verdict-live").textContent = "";
})();
