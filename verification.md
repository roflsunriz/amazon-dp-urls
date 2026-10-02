# 検証手順

## 依存更新の再確認（2026-10-02）

PR #5のweb-ext 10.7.0とPR #6のPrettier 3.9.9は、既存の開発依存にある16件の脆弱性でCIの監査が失敗していた。fast-uri 3.1.8、undici 7.29.1への依存範囲内更新と、brace-expansion overrideの5.0.12への更新後、Bun 1.4.0の固定インストール・監査で脆弱性0件を確認した。Selenium 4.50.0とFirefox API型定義143.0.1も更新対象とした。

adm-zipは上流の依存範囲内で0.6.1が選ばれ、image-sizeは上流が2.0.4を固定しているため、両者のoverrideは削除した。shell-quoteは上流の固定をoverrideで1.11.0へ更新した。

固定インストール、監査、書式、型チェック、lint（エラー・警告0件）、単体テスト47件、AMO用拡張ZIPとソースアーカイブ生成が成功した。検証には `bun install --frozen-lockfile`、`bun audit`、`bun run format:check`、`bun run type-check`、`bun run lint`、`bun run test`、`bun run build:amo` を使う。Firefox E2EはユーザーのローカルFirefoxを操作せず、隔離したWindows CIの同じhead SHAで成功した結果を確認してからマージする。

PR #5のhead `64e70a2ccefacf1e658482ccd691889456d0871c` では、[CI](https://github.com/roflsunriz/amazon-dp-urls/actions/runs/36943741389) のverifyとFirefox E2Eが両方成功し、mainへ取り込まれた。PR #6へmainを通常マージし、既存の安全な依存更新とPrettier 3.9.9を保持してロックファイルの競合を再生成で解消した。

その後の再監査では、[GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) がnode-forge 1.4.0についてHighとして検出された。npm公開最新版1.4.0も影響範囲にあり、公開修正版はない（2026-10-02確認）。`bun audit fix` は0件と表示したが、直後の `bun audit` はこの1件で失敗したため、fixの表示だけでは解消と判断しない。上流の[修正PR #1152](https://github.com/digitalbazaar/forge/pull/1152) は未マージ。PR #6は監査失敗を理由にマージを保留している。

mainの実コミット `0840244bef0bb4680ccec71a9d5bc565c9fbf4d7` で[CIを再実行](https://github.com/roflsunriz/amazon-dp-urls/actions/runs/36944626558)し、Firefox E2E成功・依存監査失敗を確認した。失敗は上記node-forgeの1件であり、PR #5マージ時の監査成功を現在の安全性の根拠にはしない。

### node-forgeの影響と上流修正の評価

依存経路はweb-ext → @devicefarmer/adbkit → node-forge。ADBKitのTCP/USBブリッジでは `dist/src/adb/tcpusb/socket.js` の署名検証がnode-forgeを呼び、`auth.js` は公開指数3も許容する。web-extはAndroid用ADBクライアントとしてADBKitを使用するが、このプロジェクトからTCP/USBブリッジのサーバーを起動する経路は確認できなかった。配布拡張はbackground.js・manifest・icons・localesのみで、node-forgeとADBKitを含まない。ただし開発依存のHighとして監査を通過させない。

上流PR #1152のhead `ceba34402e329f0365134f23fe19898756527d65` は、DigestInfoの外側の要素数に加えて、内側DigestAlgorithmをOIDと任意NULLだけに制限する小さな修正だった。差分をレビュー後、インストール済みnode-forgeの隔離コピーにこの条件だけを適用した。公開指数3の鍵で、NULLあり・なしの正常署名は両方受理し、不正な要素をNULL後・NULLなし・NULL前に置く3ケースは現行版で受理、修正コピーではすべて拒否することを確認した。異なるダイジェストは双方で拒否した。

この限定検証は上流ライブラリ全体の互換性を保証しない。また、Bunの監査はパッケージバージョンを照合するため、1.4.0へローカルパッチを当てても、このアドバイザリの失敗は解消しない。監査抑制・版番号の偽装・未マージコードの本番採用は行わず、公開修正版または検証可能な上流依存の置き換えが必要なブロッカーとして扱う。

## Dependabot 自動処理（2026-09-23）

`.github/workflows/dependabot-automation.yml` を actionlint で検査し、PR 用 workflow 名（CI）と一致することを確認する。Dependabot の patch／minor／major かつ全 PR チェック成功の場合だけ取り込み、古い SHA・再失敗は取り込まない。

実際の Dependabot PR がまだない場合、動作経路は未検証として扱う。実 PR 発生後に自動化ジョブ、CI の再試行、マージ結果を確認する。

## 依存脆弱性の確認（2026-09-23）

監査では adm-zip、brace-expansion、image-size を含む推移依存の旧版が検出された。Bun 1.4.0 で lockfile の固定インストールと再監査を行い、既知脆弱性 0 件を確認した。書式・型・lint・単体テスト成功。Firefox E2E は隔離した Windows CI で確認する。

初回の Windows CI では Firefox E2E が10秒待機で失敗した。失敗点を特定するため段階ログと各待機のエラー理由を追加した。ローカル実行では OS クリップボードを検証後に復元する。再実行で成功するまでは E2E を確認済みとしない。

再実行では Amazon のページ読込とコンテキストメニュー表示まで成功したが、元のクリップボードが空の Windows runner で復元時の `Set-Clipboard -Value ''` が例外になり、本来の待機エラーを隠した。CI の使い捨て runner では復元を不要とし、ローカル実行の空クリップボードは Windows Forms で消去するように変更した。コピー成功と対象外ページの確認は引き続き CI で検証する。

空の復元を除いた再実行では、Amazon メニューの表示後に OS クリップボードへのコピーが10秒以内に観測されなかった。headless Firefox の UI クリックと Windows クリップボードが同じデスクトップ経路を使っていない可能性があるため、隔離された Windows runner で `MOZ_HEADLESS` を外し、実デスクトップ経路を再確認する。ローカルの利用者プロファイルは操作しない。

大量の Dependabot PR により CI 完了より分類が遅れる場合でも、分類後の `workflow_dispatch` が現在の PR 番号と head SHA を照合して再評価する。別の作成者、古い SHA、未完了の CI はマージしない。
