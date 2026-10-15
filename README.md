[Firefox AMO 掲載ページ](https://addons.mozilla.org/ja/firefox/addon/amazon-clean-dp-url/)

# Amazon Clean DP URL

Amazonの商品ページで右クリックし、**「AmazonのクリーンURLをコピー」**を選ぶと、現在の商品URLを次の形式でクリップボードへコピーするFirefox拡張機能です。

```text
https://www.amazon.co.jp/dp/B012345678
```

検索キーワード、紹介タグ、トラッキング用クエリなどはコピーされません。`/dp/` のほか、`/gp/product/` と `/gp/aw/d/` の商品URLも認識します。

実装はTypeScriptです。ビルド時にBunで単一の `background.js` へまとめ、AMO提出物にはソースや開発依存関係を含めません。

## 対応Amazonストア

米国、日本、英国、ドイツをはじめ、Amazonが展開する各国ストアの商品URLに対応します。現在の公式ストアで使われる `.com`、`.ca`、`.com.mx`、`.com.br`、`.co.uk`、`.de`、`.fr`、`.it`、`.es`、`.nl`、`.pl`、`.se`、`.com.be`、`.ie`、`.com.tr`、`.co.za`、`.eg`、`.sa`、`.ae`、`.in`、`.co.jp`、`.com.au`、`.sg` のドメインを自動認識し、元の国別ドメインを維持します。

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

この内容は [findings.md](findings.md#readme-1) にまとめています。

## AMO提出用ZIPを作る

```powershell
bun run build:amo
```

検証に合格すると、`web-ext-artifacts/` にAMOへ手動アップロードできる拡張機能ZIPと、レビュー担当者向けの再現可能なソースアーカイブが生成されます。

この拡張機能は閲覧履歴や個人情報を収集・送信しません。その旨をFirefoxのデータ収集権限にも `none` として宣言しています。

独自アイコンは、リンクとクリーニングを表す光沢を組み合わせたオリジナルデザインです。16、32、48、96、128pxの透過PNGを同梱しています。

## AMOへ直接提出する

最初に[AMOのAPIキー](https://addons.mozilla.org/developers/addon/api/key/)を取得し、PowerShellで認証情報を環境変数に設定します。

```powershell
$env:WEB_EXT_API_KEY = "user:12345678:..."
$env:WEB_EXT_API_SECRET = "..."
bun run submit:amo
```

`submit:amo` はlint後、`amo-metadata.json` の多言語掲載情報とビルド可能なソースアーカイブを添えてlisted（AMO公開）チャンネルへ提出します。認証情報はファイルへ保存しないでください。

拡張機能名、概要、詳細説明はAMO本番で受け付けられる7ロケール分を `amo-metadata.json` から一括送信します。AMOが新規掲載で受け付けないロケール（アラビア語、ベンガル語、ヒンディー語、ウルドゥー語）は拡張機能内では利用できますが、掲載メタデータには含めません。

## その他

この内容は [findings.md](findings.md#readme-2) にまとめています。

## 依存更新の自動処理

この内容は [findings.md](findings.md#readme-3) にまとめています。

## 開発時の参照先

プロジェクト固有の構成・環境・調査知見は [findings.md](findings.md)、作業規範は [AGENTS.md](AGENTS.md)、検証記録は [verification.md](verification.md) を参照してください。
