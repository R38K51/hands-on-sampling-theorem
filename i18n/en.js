/* English text. Keys and wording follow the design document (wording section). */
(function (root) {
  "use strict";
  var pack = {
    lang: "en",
    name: "English",
    // Lines shown only in this language (none for English).
    langOnly: {},
    // Starting values of the PCM calculator (kHz, bits, channels): a music CD.
    pcmInitial: { fmax: "22.05", bits: "16", ch: "2" },
    messages: {
      "live.sep": ". ",
      "meta.title": "Hands-On Sampling Theorem | Nyquist, Aliasing and PCM",
      "meta.description": "Why is CD audio 44.1 kHz? Move the knobs to see sampling, aliasing and the Nyquist limit, calculate the data size of PCM audio, and test yourself with practice questions. One page.",
      "h1": "Hands-On Sampling Theorem",
      "subtitle": "Why is CD audio 44.1 kHz? Move the sliders and see.",
      "skip": "Skip to content",
      "noscript": "This page needs JavaScript.",

      "wave.h2": "Waves and sampling",
      "legend.wave": "Original wave (solid line)",
      "legend.samples": "Samples (dots)",
      "legend.recon": "Wave rebuilt from the samples (dashed line)",
      "chart.seconds": "s",
      "chart.drawing": "Drawing the chart…",
      "chart.unavailable": "The chart cannot be shown here. The verdict and the calculator below still work.",
      "chart.label.ok": "A {f} Hz wave sampled at {fs} Hz. The original wave can be rebuilt.",
      "chart.label.edge": "A {f} Hz wave sampled at {fs} Hz. Borderline: the wave can vanish, depending on phase.",
      "chart.label.ng": "A {f} Hz wave sampled at {fs} Hz. The original wave cannot be rebuilt.",

      "verdict.ok.title": "Recoverable",
      "verdict.edge.title": "Borderline (can vanish, depending on phase)",
      "verdict.ng.title": "Not recoverable",
      "verdict.ok.text": "The sampling rate is more than twice the signal frequency, so the original wave can be rebuilt from the samples.",
      "verdict.edge.text": "The sampling rate is exactly twice the signal frequency. Depending on the phase of the samples, the wave can disappear.",
      "verdict.ng.text": "The sampling rate is less than twice the signal frequency, so the original wave cannot be rebuilt.",
      "verdict.alias": "The samples look like a {a} Hz wave.",
      "verdict.alias.zero": "The samples look constant, not like a wave.",
      "verdict.rel.gt": ">",
      "verdict.rel.eq": "=",
      "verdict.rel.lt": "<",
      "formula.fs": "fs = {fs} Hz",
      "formula.rhs": "{rel} 2 × {f} Hz",
      "formula.twice": "(= {twice} Hz)",
      "verdict.symbols": "fs = sampling rate, f = signal frequency",

      "slider.f": "Signal frequency f",
      "slider.fs": "Sampling rate fs",
      "slider.unit": "Hz",
      "slider.valuetext": "{v} hertz",

      "preset.lead": "Presets:",
      "preset.plenty": "Plenty",
      "preset.just": "Just enough",
      "preset.exact": "Exactly 2×",
      "preset.few": "Too low (aliasing)",

      "why.h2": "Why is CD audio 44.1 kHz?",
      "why.text": "Human hearing reaches about 20 kHz. The theorem needs a rate above 2 × 20 kHz, so over 40 kHz. CD audio uses 44.1 kHz, which leaves extra width for a low-pass filter. The exact value was chosen to suit the recording equipment of that era.",

      "read.h2": "How to read this",
      "read.summary": "Show how to read this",
      "read.1": "Sampling theorem: if the highest frequency in a wave is fmax, you can rebuild the wave exactly when the sampling rate fs is greater than 2 × fmax (fs > 2 × fmax). In the chart above, f plays the role of fmax.",
      "read.2": "Aliasing: for example, sample a 9 Hz wave at 10 Hz and it looks like a slow 1 Hz wave. When fs is too low, a fast wave turns into a slower one like this. The apparent frequency is the size of the difference between f and the multiple of fs closest to f (example: the gap between 9 and 10 is 1 Hz). In a DAW, you hear this as aliasing: inharmonic, metallic-sounding tones.",
      "read.3": "Exactly 2× is the borderline. The samples can land where the wave looks flat, so this chart shifts the sample points slightly (phase 0.3, a small offset in where the wave starts) to keep the wave visible.",

      "pcm.h2": "Calculate the data size of PCM",
      "pcm.intro": "Enter the highest frequency, bits per sample and channels to get the data size of PCM audio. You don't enter a sampling rate: it is set to 2 × fmax automatically.",
      "pcm.fmax.label": "Highest frequency fmax",
      "pcm.fmax.unit": "kHz",
      "pcm.fmax.hint": "The highest frequency in the sound. Same idea as f in the chart above.",
      "pcm.bits.label": "Bits per sample (bit depth)",
      "pcm.bits.hint": "How many bits record each sample. More bits means finer steps (8 bits = 256 levels, 16 bits = 65,536 levels).",
      "pcm.bits.unit": "bits",
      "pcm.ch.label": "Channels",
      "pcm.ch.hint": "The number of separate audio tracks. 1 = mono, 2 = stereo (left and right). Each extra channel adds its own share of data.",
      "pcm.empty": "Enter all three values to see the result.",
      "pcm.none": "—",
      "pcm.r1.label": "Sampling rate used in the calculation (2 × fmax)",
      "pcm.r1.value": "{value} kHz",
      "pcm.r1.formula": "2 × {fmax} kHz = {value} kHz (the theorem requires a rate greater than this)",
      "pcm.r2.label": "Data rate",
      "pcm.r2.formula": "sampling rate × bits per sample × channels",
      "pcm.r3.label": "Data size per minute",
      "pcm.r3.formula": "data rate × 60 ÷ 8",
      "pcm.rate.plain": "{bps} bit/s",
      "pcm.rate.k": "{bps} bit/s ({k} kbit/s)",
      "pcm.bytes.plain": "{bytes} bytes",
      "pcm.bytes.m": "{bytes} bytes (about {m} MB)",
      "pcm.note": "The sampling rate is taken as 2 × fmax. Real standards often use a higher value. k and M mean 1,000 and 1,000,000 (not 1,024).",
      "pcm.example.phone": "Example: telephone voice",
      "pcm.example.cd": "Example: music CD",
      "pcm.example.note": "These are example inputs, not a guarantee of any standard or real specification. The music CD example uses fmax = 22.05 kHz so that the calculation gives the CD rate of 44.1 kHz; the actual sound reaches only about 20 kHz.",
      "pcm.error.nan": "Enter a number.",
      "pcm.error.fmax.range": "Enter a number greater than 0 and up to 1,000.",
      "pcm.error.fmax.decimals": "Use up to three decimal places.",
      "pcm.error.bits.range": "Enter a whole number from 1 to 32.",
      "pcm.error.ch.range": "Enter a whole number from 1 to 8.",

      "quiz.h2": "Practice questions (original)",
      "quiz.intro": "All four questions were written for this page.",
      "quiz.number": "Question {n}",
      "quiz.check": "Check answer",
      "quiz.choose": "Choose an answer",
      "quiz.correct": "✓ Correct.",
      "quiz.wrong": "✕ The correct answer is {letter}.",
      "quiz.retry": "Try again",
      "quiz.letters": ["A", "B", "C", "D"],
      "quiz.choiceLetter": "{letter}.",

      "quiz.q1.text": "A sound contains frequencies up to 10 kHz. To digitize it without loss, which sampling rate does the theorem require?",
      "quiz.q1.choices": [
        "A value greater than 5 kHz",
        "A value greater than 20 kHz",
        "10 kHz or more",
        "Less than 20 kHz"
      ],
      "quiz.q1.explain": "The sampling rate must be greater than twice the highest frequency. Twice 10 kHz is 20 kHz, and exactly 20 kHz is the borderline, so the condition is a rate greater than 20 kHz.",

      "quiz.q2.text": "Mono audio is sampled at 8 kHz with 8 bits per sample. What is the data rate?",
      "quiz.q2.choices": ["8 kbit/s", "16 kbit/s", "64 kbit/s", "128 kbit/s"],
      "quiz.q2.explain": "8,000 samples/s × 8 bits × 1 channel = 64,000 bit/s = 64 kbit/s.",

      "quiz.q3.text": "A 9 Hz sine wave is sampled at 10 Hz. What frequency does the wave through the samples appear to have?",
      "quiz.q3.choices": ["1 Hz", "9 Hz", "10 Hz", "19 Hz"],
      "quiz.q3.explain": "10 Hz is less than twice 9 Hz, so aliasing occurs. The apparent frequency is |9 − 10| = 1 Hz. Set f = 9 and fs = 10 in the chart above to see it.",

      "quiz.q4.text": "Stereo (2 channels) audio is recorded for one minute at 44.1 kHz and 16 bits per sample. About how large is the data (1 MB = 1,000,000 bytes)?",
      "quiz.q4.choices": ["About 1.3 MB", "About 2.6 MB", "About 5.3 MB", "About 10.6 MB"],
      "quiz.q4.explain": "44,100 × 16 × 2 = 1,411,200 bit/s. × 60 ÷ 8 = 10,584,000 bytes, about 10.6 MB. Watch for mixing up bits and bytes (8 bits).",

      "footer.original": "All practice questions are original and were written for this page.",
      "footer.source": "Source code (GitHub)",
      "footer.noNetwork": "This page makes no external requests and stores nothing you enter."
    }
  };

  if (typeof module === "object" && module.exports) {
    module.exports = pack;
  } else {
    root.HST_I18N = pack;
  }
})(this);
