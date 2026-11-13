<div align="center">

# Hands-On Sampling Theorem

**Nyquist and PCM, interactively.**<br>
**動かして分かる標本化定理。ナイキストと PCM を、つまみで確かめる。**

[![Live page](https://img.shields.io/badge/live-GitHub%20Pages-2f6f62.svg)](https://r38k51.github.io/hands-on-sampling-theorem/)
[![Static page](https://img.shields.io/badge/page-static%20HTML-blue.svg)](#english)
[![No dependencies](https://img.shields.io/badge/dependencies-none-green.svg)](#english)
[![Languages: EN / JA](https://img.shields.io/badge/languages-EN%20%2F%20JA-orange.svg)](#english)
[![Node 22+ for build and tests](https://img.shields.io/badge/node-22%2B%20(build%2Ftests)-339933.svg)](package.json)

[English](#english) · [日本語](#日本語) · [Live page / 公開ページ](https://r38k51.github.io/hands-on-sampling-theorem/)

<img src="docs/screenshots/en-top.png" alt="English page: waves and sampling / 英語版：波と標本化" width="720">

</div>

---

<a id="english"></a>

## English

[日本語はこちら](#日本語)

A single static page. Move the knobs to see sampling, aliasing and the Nyquist limit, calculate the data size of PCM audio, and test yourself with four original practice questions. English (`/`) and Japanese (`/ja/`).

**Live page:** https://r38k51.github.io/hands-on-sampling-theorem/

### Features

- **Sampling and aliasing you can see.** Move the knobs and watch how the sampling rate decides whether a wave is captured or folded back (aliased).
- **The Nyquist limit.** See where the limit sits relative to the signal.
- **PCM size calculator.** Enter the sampling rate, bit depth and channels to get bits per second and bytes.
- **Four original practice questions** to test yourself.
- **English and Japanese pages**, each usable on a phone.

### Screenshots

![English page: waves and sampling](docs/screenshots/en-top.png)

![Japanese page on a phone](docs/screenshots/ja-mobile.png)

The screenshots show the page itself; no personal data is involved.

### Requirements

- A modern browser to use the page.
- Node 22 or later, only to build and to run the tests. The page has no dependencies.

### Run locally

```sh
npm run build        # write index.html, ja/index.html and sitemap.xml
npm test             # run the unit tests (node --test "test/*.test.js")
python -m http.server 8000
```

Then open `http://localhost:8000/` (English) or `http://localhost:8000/ja/` (Japanese). Opening the files directly (`file://`) is not supported.

### Tests

```sh
npm test
```

### License

[MIT](LICENSE). Copyright (c) 2026 R38K51.

---

<a id="日本語"></a>

## 日本語

[English](#english)

動かして分かる標本化定理。つまみを動かして標本化定理と折り返し（エイリアス）を目で確かめ、PCM のビット/秒とバイト数を計算し、自作の確認問題で試せる1ページです。英語版（`/`）と日本語版（`/ja/`）があります。

**公開ページ：** https://r38k51.github.io/hands-on-sampling-theorem/

### 特徴

- **標本化と折り返しを目で見られる。** つまみを動かして、標本化の周波数しだいで波がそのまま捉えられるか、折り返される（エイリアス）かを確かめます。
- **ナイキスト周波数。** 信号に対して限界がどこにあるかを見られます。
- **PCM のデータ量の計算。** 標本化周波数、ビット数、チャンネル数を入れると、ビット/秒とバイト数が出ます。
- **自作の確認問題4問**で試せます。
- **英語版と日本語版**があり、どちらもスマホで使えます。

### 画面

![英語版：波と標本化](docs/screenshots/en-top.png)

![スマホでの日本語版](docs/screenshots/ja-mobile.png)

画面はページそのものの様子で、個人情報は写っていません。

### 必要なもの

- ページを使うには、新しめのブラウザ。
- Node 22 以上は、ビルドとテストのときだけ必要です。ページ自体は依存パッケージがありません。

### 手元で動かす

```sh
npm run build        # index.html、ja/index.html、sitemap.xml を書き出す
npm test             # 単体テストを実行する（node --test "test/*.test.js"）
python -m http.server 8000
```

そのあと `http://localhost:8000/`（英語版）または `http://localhost:8000/ja/`（日本語版）を開きます。ファイルを直接開く方法（`file://`）には対応していません。

### テスト

```sh
npm test
```

### ライセンス

[MIT](LICENSE)。Copyright (c) 2026 R38K51。
