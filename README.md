# Amazon Clean DP URL

Amazonの商品ページで右クリックし、**「AmazonのクリーンURLをコピー」**を選ぶと、現在の商品URLを次の形式でクリップボードへコピーするFirefox拡張機能です。

```text
https://www.amazon.co.jp/dp/B012345678
```

検索キーワード、紹介タグ、トラッキング用クエリなどはコピーされません。`/dp/` のほか、`/gp/product/` と `/gp/aw/d/` の商品URLも認識します。

実装はTypeScriptです。ビルド時にBunで単一の `background.js` へまとめ、AMO提出物にはソースや開発依存関係を含めません。

## 対応言語

Firefoxの表示言語に合わせて、拡張機能名、説明、コンテキストメニューを次の言語で表示します。

- 日本語
- 英語（未対応言語のフォールバック）
- 中国語（簡体字）
- ヒンディー語
- スペイン語
- フランス語
- アラビア語
- ポルトガル語（ブラジル）
- ベンガル語
- ロシア語
- ウルドゥー語

## セットアップ

```powershell
bun install
```

## Firefoxですぐ試す

```powershell
bun run dev
```

開発用の一時プロファイルでFirefoxが起動し、拡張機能が自動的に読み込まれます。ソースを変更すると拡張機能も自動リロードされます。

## テスト

URL正規化の単体テスト:

```powershell
bun run test
```

実Firefoxで、拡張機能の一時インストール、コンテキストメニューと独自アイコンの表示、クリック、OSクリップボードへのコピー、Amazon以外でクリップボードを変更しないことまで検証:

```powershell
bun run test:e2e
```

E2EはWindowsとデスクトップ版Firefoxを使用します。Firefoxが標準の場所にない場合は、`FIREFOX_BINARY` 環境変数に `firefox.exe` の絶対パスを指定してください。単体テストとE2Eを続けて実行する場合は `bun run test:all` を使用します。

## AMO提出用ZIPを作る

```powershell
bun run build:amo
```

検証に合格すると、`web-ext-artifacts/` にAMOへ手動アップロードできる拡張機能ZIPと、レビュー担当者向けの再現可能なソースアーカイブが生成されます。

この拡張機能は閲覧履歴や個人情報を収集・送信しません。その旨をFirefoxのデータ収集権限にも `none` として宣言しています。

独自アイコンはリンクとクリーニングの光沢を組み合わせたオリジナルデザインです。16、32、48、96、128pxの透過PNGを同梱しています。

## AMOへ直接提出する

最初に[AMOのAPIキー](https://addons.mozilla.org/developers/addon/api/key/)を取得し、PowerShellで認証情報を環境変数に設定します。

```powershell
$env:WEB_EXT_API_KEY = "user:12345678:..."
$env:WEB_EXT_API_SECRET = "..."
bun run submit:amo
```

`submit:amo` はlint後、`amo-metadata.json` の多言語掲載情報とビルド可能なソースアーカイブを添えてlisted（AMO公開）チャンネルへ提出します。認証情報はファイルへ保存しないでください。

## その他

TypeScript、ビルド結果、マニフェストを検証する場合:

```powershell
bun run lint
```

拡張機能IDは `src/manifest.json` の `browser_specific_settings.gecko.id` に固定済みです。公開後は同じIDを変更しないでください。
