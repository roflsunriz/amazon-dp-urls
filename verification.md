# 検証手順

## Dependabot 自動処理（2026-09-23）

`.github/workflows/dependabot-automation.yml` を actionlint で検査し、PR 用 workflow 名（CI）と一致することを確認する。Dependabot の patch／minor かつ全 PR チェック成功の場合だけ取り込み、major・古い SHA・再失敗は残す。

実際の Dependabot PR がまだない場合、動作経路は未検証として扱う。実 PR 発生後に自動化ジョブ、CI の再試行、マージ結果を確認する。

## 依存脆弱性の確認（2026-09-23）

監査では adm-zip、brace-expansion、image-size を含む推移依存の旧版が検出された。Bun 1.4.0 で lockfile の固定インストールと再監査を行い、既知脆弱性 0 件を確認した。書式・型・lint・単体テスト成功。Firefox E2E は隔離した Windows CI で確認する。

初回の Windows CI では Firefox E2E が10秒待機で失敗した。失敗点を特定するため段階ログと各待機のエラー理由を追加した。ローカル実行では OS クリップボードを検証後に復元する。再実行で成功するまでは E2E を確認済みとしない。

再実行では Amazon のページ読込とコンテキストメニュー表示まで成功したが、元のクリップボードが空の Windows runner で復元時の `Set-Clipboard -Value ''` が例外になり、本来の待機エラーを隠した。CI の使い捨て runner では復元を不要とし、ローカル実行の空クリップボードは Windows Forms で消去するように変更した。コピー成功と対象外ページの確認は引き続き CI で検証する。

大量の Dependabot PR により CI 完了より分類が遅れる場合でも、分類後の `workflow_dispatch` が現在の PR 番号と head SHA を照合して再評価する。別の作成者、古い SHA、未完了の CI はマージしない。
