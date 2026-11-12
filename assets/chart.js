/*
 * Chart drawing for Hands-On Sampling Theorem. Draws only: it receives the
 * model made by core.js (seconds and amplitude) and maps it to canvas pixels.
 * It reads no theme itself; the caller passes the colors.
 */
(function (root) {
  "use strict";

  var Y_LIMIT = 1.1;   // vertical range is -1.1 .. 1.1 so a full swing is not clipped
  var DASH = [6, 4];   // 6 px line, 4 px gap
  var DOT_RADIUS = 4;
  var TICKS = [0, 0.5, 1];

  function tickText(t, unit) {
    return t === 0 ? "0" : (t === 1 ? "1" : "0.5 " + unit);
  }

  // colors: { bg, axis, wave, sample, recon, font }
  // labels: { seconds }
  // The context must already be scaled so that 1 unit is 1 CSS pixel.
  function drawChart(ctx, model, colors, cssW, cssH, labels) {
    var left = 10;
    var right = 14;
    var top = 10;
    var bottom = 30;
    var w = cssW - left - right;
    var h = cssH - top - bottom;

    function px(t) { return left + t * w; }
    function py(y) { return top + (1 - (y + Y_LIMIT) / (2 * Y_LIMIT)) * h; }

    ctx.save();
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssW, cssH);

    // Axes: the center line (amplitude 0) and the time axis with three ticks.
    ctx.strokeStyle = colors.axis;
    ctx.fillStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    // Half-pixel offsets keep the 1px lines on one pixel row instead of blurring over two.
    var midY = Math.round(py(0)) + 0.5;
    var baseY = Math.round(top + h) + 0.5;
    ctx.moveTo(left, midY);
    ctx.lineTo(left + w, midY);
    ctx.moveTo(left, baseY);
    ctx.lineTo(left + w, baseY);
    TICKS.forEach(function (t) {
      var tx = Math.round(px(t)) + 0.5;
      ctx.moveTo(tx, baseY);
      ctx.lineTo(tx, baseY + 5);
    });
    ctx.stroke();

    ctx.font = "14px " + colors.font;
    ctx.textBaseline = "top";
    TICKS.forEach(function (t) {
      ctx.textAlign = t === 0 ? "left" : (t === 1 ? "right" : "center");
      ctx.fillText(tickText(t, labels.seconds), px(t), top + h + 8);
    });

    // Everything below stays inside the plot area.
    ctx.beginPath();
    ctx.rect(left - 2, top - 2, w + 4, h + 4);
    ctx.clip();

    function line(points, color, dash) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.setLineDash(dash);
      ctx.beginPath();
      points.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(px(p.t), py(p.y));
        else ctx.lineTo(px(p.t), py(p.y));
      });
      ctx.stroke();
    }

    line(model.recon, colors.recon, DASH);
    line(model.wave, colors.wave, []);

    // Sample points: a thin stem to the center line and a filled dot.
    ctx.setLineDash([]);
    ctx.strokeStyle = colors.sample;
    ctx.fillStyle = colors.sample;
    ctx.lineWidth = 1;
    ctx.beginPath();
    model.samples.forEach(function (s) {
      ctx.moveTo(px(s.t), py(0));
      ctx.lineTo(px(s.t), py(s.y));
    });
    ctx.stroke();
    model.samples.forEach(function (s) {
      ctx.beginPath();
      ctx.arc(px(s.t), py(s.y), DOT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }

  var api = { drawChart: drawChart };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.HST_CHART = api;
  }
})(this);
