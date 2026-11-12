/* Japanese text. Keys and wording follow the design document (wording section). */
(function (root) {
  "use strict";
  var pack = {
    lang: "ja",
    name: "日本語",
    // Lines shown only in this language.
    langOnly: {
      "header.examNote": "応用情報・基本情報の標本化・PCM の計算の理解にも使えます。"
    },
    // Starting values of the PCM calculator (kHz, bits, channels): a telephone voice.
    pcmInitial: { fmax: "4", bits: "8", ch: "1" },
    messages: {
      "live.sep": "。",
      "meta.title": "動かして分かる標本化定理｜ナイキスト周波数・折り返し・PCM",
      "meta.description": "つまみを動かして、標本化定理と折り返し（エイリアス）を目で確かめ、PCM のビット/秒とバイト数を計算し、確認問題で試せる1ページ。",
      "h1": "動かして分かる標本化定理",
      "subtitle": "ナイキスト周波数と PCM を、つまみで確かめる",
      "skip": "本文へ",
      "noscript": "このページは JavaScript が必要です。",

      "wave.h2": "波と標本化",
      "legend.wave": "元の波（実線）",
      "legend.samples": "標本点（丸）",
      "legend.recon": "標本点から作り直した波（破線）",
      "chart.seconds": "秒",
      "chart.drawing": "図を描いています…",
      "chart.unavailable": "この環境では図を表示できません。下の判定と計算は使えます。",
      "chart.label.ok": "元の波 {f} Hz を {fs} Hz で標本化。元の波を取り戻せる。",
      "chart.label.edge": "元の波 {f} Hz を {fs} Hz で標本化。境目で、位相しだいで波が消える。",
      "chart.label.ng": "元の波 {f} Hz を {fs} Hz で標本化。元の波を取り戻せない。",

      "verdict.ok.title": "取り戻せる",
      "verdict.edge.title": "境目（位相しだいで消える）",
      "verdict.ng.title": "取り戻せない",
      "verdict.ok.text": "標本化周波数が、元の波の周波数の2倍より大きいので、標本点から元の波を作り直せます。",
      "verdict.edge.text": "標本化周波数がちょうど2倍です。標本の取り方（位相）しだいで、波が消えて見えることがあります。",
      "verdict.ng.text": "標本化周波数が2倍より小さいので、元の波を作り直せません。",
      "verdict.alias": "測った点は {a} Hz の波に見えます。",
      "verdict.alias.zero": "測った点は一定の値に見え、波に見えません。",
      "verdict.rel.gt": "＞",
      "verdict.rel.eq": "＝",
      "verdict.rel.lt": "＜",
      "formula.fs": "fs＝{fs} Hz",
      "formula.rhs": "{rel} 2×{f} Hz",
      "formula.twice": "（＝{twice} Hz）",
      "verdict.symbols": "fs＝標本化周波数、f＝元の波の周波数",

      "slider.f": "元の波の周波数 f",
      "slider.fs": "標本化周波数 fs",
      "slider.unit": "Hz",
      "slider.valuetext": "{v} ヘルツ",

      "preset.lead": "早見：",
      "preset.plenty": "十分に測る",
      "preset.just": "ぎりぎり足りる",
      "preset.exact": "ちょうど2倍",
      "preset.few": "足りない（折り返し）",

      "why.h2": "なぜ音楽 CD は 44.1 kHz なのか",
      "why.text": "人の耳が聞こえるのは、およそ 20 kHz まで。標本化周波数はその2倍より大きくする必要があるので、40 kHz 強です。音楽 CD の 44.1 kHz は、低域フィルタのための幅を見込んだ値です。この値そのものは、当時の録音機材の都合で決まりました。",

      "read.h2": "読み方",
      "read.summary": "読み方を開く",
      "read.1": "標本化定理：波に含まれる最高の周波数を fmax とすると、標本化周波数 fs を fmax の2倍より大きくすれば、元の波を取り戻せます（fs ＞ 2 × fmax）。上の図の f は、この fmax にあたります。",
      "read.2": "折り返し（エイリアス）：たとえば 9 Hz の波を 10 Hz で測ると、1 Hz のゆっくりした波に見えます。fs が足りないと、速い波はこのように遅い波に化けます。化けた周波数は、f と「fs の整数倍のうち f に最も近いもの」との差の大きさです（例：9 と 10 の差で 1 Hz）。",
      "read.3": "ちょうど2倍は境目です。標本の取り方で波が消えて見えるため、この図では標本点の位置を少しずらして（位相 0.3。波の出だしのずれ）、波が消えないようにしています。",

      "pcm.h2": "PCM のデータ量を計算する",
      "pcm.intro": "最高周波数、量子化ビット数、チャネル数を入れると、PCM のデータ量が出ます。標本化周波数は入力しません。fmax の2倍が自動で使われます。",
      "pcm.fmax.label": "音に含まれる最高周波数 fmax",
      "pcm.fmax.unit": "kHz",
      "pcm.fmax.hint": "音に含まれる最も高い周波数。上の図の f と同じ意味です。",
      "pcm.bits.label": "量子化ビット数",
      "pcm.bits.hint": "1回の測定値（1標本）を何ビットの数で記録するか。多いほど細かく表せます（8ビット＝256段階、16ビット＝65,536段階）。",
      "pcm.bits.unit": "ビット",
      "pcm.ch.label": "チャネル数",
      "pcm.ch.hint": "音の系統の数。1＝モノラル、2＝ステレオ（左右）。1つ増えるごとに、データ量はその分だけ増えます。",
      "pcm.empty": "3つの値を入れると、結果が出ます。",
      "pcm.none": "—",
      "pcm.r1.label": "計算に使う標本化周波数（2×fmax）",
      "pcm.r1.value": "{value} kHz",
      "pcm.r1.formula": "2 × {fmax} kHz = {value} kHz（定理の条件では、これより大きい値が必要）",
      "pcm.r2.label": "伝送速度（ビット/秒）",
      "pcm.r2.formula": "標本化周波数 × ビット数 × チャネル数",
      "pcm.r3.label": "1分あたりのデータ量",
      "pcm.r3.formula": "ビット/秒 × 60 ÷ 8",
      "pcm.rate.plain": "{bps} ビット/秒",
      "pcm.rate.k": "{bps} ビット/秒（{k} kビット/秒）",
      "pcm.bytes.plain": "{bytes} バイト",
      "pcm.bytes.m": "{bytes} バイト（約 {m} Mバイト）",
      "pcm.note": "標本化周波数は 2 × fmax の値で計算しています。実際の規格では、これより大きい値を使うことがあります。k と M は 1,000 倍です（1,024 倍ではありません）。",
      "pcm.example.phone": "例：電話の音声",
      "pcm.example.cd": "例：音楽 CD",
      "pcm.example.note": "例は入力値の例です。規格や実際の仕様を保証するものではありません。音楽 CD の例は、CD の 44.1 kHz で計算するため fmax を 22.05 kHz にしています。実際の音は約 20 kHz までです。",
      "pcm.error.nan": "数を入れてください。",
      "pcm.error.fmax.range": "0 より大きく 1,000 以下の数を入れてください。",
      "pcm.error.fmax.decimals": "小数は第3位までで入れてください。",
      "pcm.error.bits.range": "1〜32 の整数を入れてください。",
      "pcm.error.ch.range": "1〜8 の整数を入れてください。",

      "quiz.h2": "確認問題（自作）",
      "quiz.intro": "4問すべて、このページ用に作った問題です。",
      "quiz.number": "問{n}",
      "quiz.check": "答え合わせ",
      "quiz.choose": "答えを選んでください",
      "quiz.correct": "✓ 正解です。",
      "quiz.wrong": "✕ 正解は {letter} です。",
      "quiz.retry": "選び直す",
      "quiz.letters": ["ア", "イ", "ウ", "エ"],
      "quiz.choiceLetter": "{letter}．",

      "quiz.q1.text": "最高 10 kHz の成分を含む音を、劣化なくデジタルにしたい。定理の条件で、標本化周波数に必要なのはどれか。",
      "quiz.q1.choices": [
        "5 kHz より大きい値",
        "20 kHz より大きい値",
        "10 kHz 以上",
        "20 kHz 未満"
      ],
      "quiz.q1.explain": "標本化周波数は最高周波数の2倍より大きくします。10 kHz の2倍は 20 kHz で、ちょうど20 kHz は境目なので、20 kHz より大きい値が条件です。",

      "quiz.q2.text": "8 kHz で標本化し、1標本を 8 ビットで表す、1チャネルの音声の伝送速度はどれか。",
      "quiz.q2.choices": ["8 kビット/秒", "16 kビット/秒", "64 kビット/秒", "128 kビット/秒"],
      "quiz.q2.explain": "8,000 標本/秒 × 8 ビット × 1 チャネル ＝ 64,000 ビット/秒 ＝ 64 kビット/秒です。",

      "quiz.q3.text": "9 Hz の正弦波を 10 Hz で標本化した。標本点を結ぶと、何 Hz の波に見えるか。",
      "quiz.q3.choices": ["1 Hz", "9 Hz", "10 Hz", "19 Hz"],
      "quiz.q3.explain": "10 Hz は 9 Hz の2倍より小さいので折り返しが起きます。化けて見える周波数は |9 − 10| ＝ 1 Hz です。上の図で f = 9、fs = 10 にして確かめられます。",

      "quiz.q4.text": "標本化周波数 44.1 kHz、16 ビット、ステレオ（2チャネル）の音を1分間録音した。データ量は約何 Mバイトか（1 Mバイト＝1,000,000 バイト）。",
      "quiz.q4.choices": ["約 1.3 Mバイト", "約 2.6 Mバイト", "約 5.3 Mバイト", "約 10.6 Mバイト"],
      "quiz.q4.explain": "44,100 × 16 × 2 ＝ 1,411,200 ビット/秒。× 60 ÷ 8 ＝ 10,584,000 バイト、約 10.6 Mバイトです。ビットとバイト（8ビット）の取り違えに注意します。",

      "footer.original": "この問題とデータはこのページ用の自作です。過去問の転載ではありません。IPA（情報処理推進機構）とは関係ありません。",
      "footer.source": "ソースコード（GitHub）",
      "footer.noNetwork": "このページは外部へ通信せず、入力を保存しません。"
    }
  };

  if (typeof module === "object" && module.exports) {
    module.exports = pack;
  } else {
    root.HST_I18N = pack;
  }
})(this);
