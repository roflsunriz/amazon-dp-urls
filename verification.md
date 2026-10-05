# 検証手順

## 依存更新の再確認（2026-10-02）

PR #5のweb-ext 10.7.0とPR #6のPrettier 3.9.9は、既存の開発依存にある16件の脆弱性でCIの監査が失敗していた。fast-uri 3.1.8、undici 7.29.1への依存範囲内更新と、brace-expansion overrideの5.0.12への更新後、Bun 1.4.0の固定インストール・監査で脆弱性0件を確認した。Selenium 4.50.0とFirefox API型定義143.0.1も更新対象とした。

adm-zipは上流の依存範囲内で0.6.1が選ばれ、image-sizeは上流が2.0.4を固定しているため、両者のoverrideは削除した。shell-quoteは上流の固定をoverrideで1.11.0へ更新した。

固定インストール、監査、書式、型チェック、lint（エラー・警告0件）、単体テスト47件、AMO用拡張ZIPとソースアーカイブ生成が成功した。検証には `bun install --frozen-lockfile`、`bun audit`、`bun run format:check`、`bun run type-check`、`bun run lint`、`bun run test`、`bun run build:amo` を使う。Firefox E2EはユーザーのローカルFirefoxを操作せず、隔離したWindows CIの同じhead SHAで成功した結果を確認してからマージする。

## Dependabot 自動処理（2026-09-23）

`.github/workflows/dependabot-automation.yml` を actionlint で検査し、PR 用 workflow 名（CI）と一致することを確認する。Dependabot の patch／minor／major かつ全 PR チェック成功の場合だけ取り込み、古い SHA・再失敗は取り込まない。

実際の Dependabot PR がまだない場合、動作経路は未検証として扱う。実 PR 発生後に自動化ジョブ、CI の再試行、マージ結果を確認する。

## 依存脆弱性の確認（2026-09-23）

監査では adm-zip、brace-expansion、image-size を含む推移依存の旧版が検出された。Bun 1.4.0 で lockfile の固定インストールと再監査を行い、既知脆弱性 0 件を確認した。書式・型・lint・単体テスト成功。Firefox E2E は隔離した Windows CI で確認する。

初回の Windows CI では Firefox E2E が10秒待機で失敗した。失敗点を特定するため段階ログと各待機のエラー理由を追加した。ローカル実行では OS クリップボードを検証後に復元する。再実行で成功するまでは E2E を確認済みとしない。

再実行では Amazon のページ読込とコンテキストメニュー表示まで成功したが、元のクリップボードが空の Windows runner で復元時の `Set-Clipboard -Value ''` が例外になり、本来の待機エラーを隠した。CI の使い捨て runner では復元を不要とし、ローカル実行の空クリップボードは Windows Forms で消去するように変更した。コピー成功と対象外ページの確認は引き続き CI で検証する。

空の復元を除いた再実行では、Amazon メニューの表示後に OS クリップボードへのコピーが10秒以内に観測されなかった。headless Firefox の UI クリックと Windows クリップボードが同じデスクトップ経路を使っていない可能性があるため、隔離された Windows runner で `MOZ_HEADLESS` を外し、実デスクトップ経路を再確認する。ローカルの利用者プロファイルは操作しない。

大量の Dependabot PR により CI 完了より分類が遅れる場合でも、分類後の `workflow_dispatch` が現在の PR 番号と head SHA を照合して再評価する。別の作成者、古い SHA、未完了の CI はマージしない。

## 2026-10-05: GitHub受付・READMEの整備（公開前）

- 比較元: `0840244bef0bb4680ccec71a9d5bc565c9fbf4d7`（`main`）。
- 受付フォーム 2 件のYAML構造、重複キー・ID、入力型、選択肢、予約ファイル名を一括検査し、エラー0件。
- 既存の固有質問・入力例・必須条件を原文と照合。READMEのリンク・画像・コマンド・条件を確認し、裏付けがある誤記だけを訂正した。
- 既存のCI、Dependabot、labeler、ライセンスのファイル内容は比較元から変更していない。
- 製品のビルド・インストール・実機操作、GitHub上のフォーム表示、公開後CIは今回の静的検証に含めない。公開後に実際の受付表示と必要ラベルの適用を確認する。

## 2026-10-05 マージ後CIの再監査

旧文書PRは依存監査が失敗したheadでマージされ、mainでも監査が失敗した。現在の最新web-ext 10.7.0、adbkit 3.3.9、node-forge 1.4.0にも同じ経路が存在する。公式GitHub Advisoryは修正版なしと明記している: https://github.com/advisories/GHSA-86w9-cpqp-85rv 。監査抑制、チェック削除、古いweb-extへの強制降格は行わない。web-extのlint・XPI生成・Mozilla署名の利用経路を維持する。最小案はnode-forge修正版またはweb-ext/adbkitの依存除去版を待って更新し、監査と既存全チェックを再実行すること。
