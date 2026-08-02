# 更新手順

## 前提

- Bun 1.3以降
- Node.js 22以降
- デスクトップ版Firefox
- E2Eを実行するWindows環境

## 依存関係の更新

```powershell
bun install
bun outdated
bun audit
```

依存関係を変更した場合は、`package.json` と `bun.lock` の差分を確認します。

## 翻訳の更新

1. `src/_locales/<locale>/messages.json` を更新します。
2. 新しいメッセージキーは全ロケールへ同時に追加します。
3. 新しいロケールを追加した場合は、`tests/unit/locales.test.ts` の拡張機能ロケール一覧を更新します。AMO本番の対応ロケールである場合だけ、AMO用ロケール一覧と `amo-metadata.json` も更新します。AMOが受け付けないロケールは拡張機能内で対応していても掲載メタデータへ追加しません。
4. 地域付きロケールは、`_locales` では `pt_BR` のようにアンダースコア、AMOメタデータでは `pt-BR` のようにハイフンを使用します。

## バージョン更新

AMOへ新しいバージョンを提出する前に、次の2ファイルを同じバージョンへ更新します。

- `package.json`
- `src/manifest.json`

## 検証

```powershell
bun run format
bun run lint
bun run type-check
bun run build
bun run test
bun run test:e2e
bun audit
```

E2Eは実Firefoxを起動します。Firefoxが標準の場所にない場合は、`FIREFOX_BINARY` に実行ファイルの絶対パスを設定します。

## AMO提出物の生成

```powershell
bun run build:amo
```

`web-ext-artifacts/` に生成された拡張機能ZIPを展開し、`manifest.json`、`background.js`、`icons/`、`_locales/` だけが含まれることを確認します。`amazon-clean-dp-url-source.tar.gz` には、レビュー担当者が同じ成果物を再ビルドするためのソース、ロックファイル、英語の手順書が含まれます。

## ロールバック

未コミットの更新を戻す場合は、対象ファイルの差分を確認してから個別に復元します。コミット済みの場合は履歴を書き換えず、対象コミットを打ち消すrevertコミットを作成します。以前のAMO版へ戻す場合も、同じバージョン番号は再利用せず、新しいバージョン番号で旧コードを再提出します。
