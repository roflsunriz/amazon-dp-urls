# findings.md

このリポジトリ固有の実現手段と調査知見の正本です。作業前に全文を読み、行動規範は [AGENTS.md](AGENTS.md) と [COMMON-AGENTS.md](COMMON-AGENTS.md) に従ってください。移動元の本文は以下に保持しています。

## 共通方針の適用と具体的な例外

| 項目                       | このリポジトリでの扱い                                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象の共通ルール           | ブラウザ検証のヘッドレス原則                                                                                                                                                                              |
| 理由と適用範囲             | OSクリップボードはheadless Firefoxのクリックでコピーされなかった実測があるため、Firefox E2Eだけ隔離したWindows CIの実デスクトップで行う。ローカルの利用者Firefoxは操作しない。                            |
| 同等の品質を保つ手段・検証 | CIのFirefox E2Eでメニュー実クリックとOSクリップボードを検証し、通常の型・lint・単体テストも維持する。根拠: `tests/e2e/context-menu.e2e.ts`、`.github/workflows/ci.yml`、[既存検証記録](verification.md)。 |

## 文書の役割と適用範囲

- 共通ルールの対象は「ローカル AGENTS.md との関係」「設計と実装方針」「検証」「ドキュメント」。この文書は本リポジトリの構成と既存運用に適用し、共通の行動規範を弱めません。
- ファイル配置・ツール・環境をここに集約する理由は、作業規範と実装上の事実を分け、次の作業者が根拠を確認できるようにするためです。下記の既存手段は同じ対象の設定・CI・検証記録と照合して使います。
- README は利用開始・操作、更新手順は更新と復旧、verification.md は検証手順と実測証跡、専門の設計・研究文書は詳細な根拠を担います。これらの用途は維持し、この文書から参照します。
- 更新・検証の代替は一律のBunコマンドに固定せず、下記の採用技術と既存CIに対応する検査を使います。実行不能や未検証の条件は成功扱いせず verification.md に残します。

<a id="agents-1"></a>

## Environment

- Windows作業コピーは `core.autocrlf=true` のためCRLF、リポジトリ内はLF。`bun run format` が複数ファイルを変更表示しても内容差分がない場合（`git diff --stat` が空）は改行のみの差分なのでコミットせず `git checkout --` で戻す。CI（Linux/LF）では `format:check` が成功する。
- Dependabot PRが古いまま残ると先行マージ済みの他PRと `package.json`/`bun.lock` で競合（`MERGEABLE: CONFLICTING`）する。解消手順：PRブランチに `origin/main` を通常マージし、`package.json` はPRの更新版とmain側の最新版を両方保持、`bun.lock` はmain側を取得後に `bun install` で再生成して監査し、pushする。強制pushは不要。CI（verify/firefox-e2e/classify）が成功すれば自動マージされ、リモートブランチも自動削除される。残った追跡参照は `git fetch --prune` で掃除する。
- Firefox E2Eはローカルで実行せずCIに任せる（ユーザーのメインブラウザFirefoxと競合するため）。

移動元: `AGENTS.md`。

<a id="agents-2"></a>

## 依存監査で確定した事項（2026-09-23）

- `bun audit fix` だけでは adm-zip、brace-expansion、image-size の脆弱版が上流の厳密な依存範囲で残る。`package.json` の既存 `overrides` と `bun.lock` を同時に更新し、`bun audit` と関連テスト・ビルドで確認する。上流が安全版を取り込んだ場合は override の必要性を再評価する。
- 2026-10-02の再監査では、既存brace-expansion override自体が脆弱版5.0.9へ固定していた。bun audit fixでfast-uriとundiciを互換範囲内で更新した後、overrideを安全版へ更新して再インストール・監査する。詳細はverification.mdを参照。
- 2026-10-02にnode-forge 1.4.0の未修正脆弱性GHSA-86w9-cpqp-85rvが再監査で検出された。bun audit fixは0件と表示してもbun auditは失敗した。修正版公開状況を再確認し、fixの表示だけで解消と判断しない。上流PRと監査結果はverification.mdに記録する。
- 2026-10-11時点でnode-forgeの公開修正版はない。PR #6では上流PR #1152のRSA検証差分を `patches/node-forge@1.4.0.patch` として適用し、`tests/unit/node-forge-security.test.ts` で正常署名と不正な入れ子要素を検証する。`bun run audit:patched` はこのテスト成功後だけ、版番号に残るGHSA-86w9-cpqp-85rvを監査対象から除く。修正版が公開されたらパッチと例外を再評価する。詳細はverification.mdを参照。
- Firefox E2E は隔離した Windows GitHub runner のデスクトップで実行し、OS クリップボードを検証する。共通指針のヘッドレス原則に対し、この CI ジョブだけは、headless Firefox のクリックでは OS クリップボードへコピーされなかった実測に基づき、デスクトップ経路を使用する。ユーザーのローカル Firefox は操作しない。ローカル実行時は `finally` で元の内容へ戻し、元が空なら Windows Forms で消去する。CI の使い捨て runner では復元を省く。待機失敗は段階ログで判別する（`tests/e2e/context-menu.e2e.ts`）。

移動元: `AGENTS.md`。

<a id="readme-1"></a>

## テスト

URL正規化の単体テストを実行します。

```powershell
bun run test
```

実Firefoxで次の項目を検証します。一時インストール、コンテキストメニューと独自アイコンの表示、クリック、OSクリップボードへのコピーを確認します。Amazon以外ではクリップボードが変わらないことも確認します。

```powershell
bun run test:e2e
```

E2EはWindowsとデスクトップ版Firefoxを使用します。Firefoxが標準の場所にない場合は、`FIREFOX_BINARY` 環境変数に `firefox.exe` の絶対パスを指定してください。単体テストとE2Eを続けて実行する場合は `bun run test:all` を使用します。

移動元: `README.md`。

<a id="readme-2"></a>

## その他

TypeScript、ビルド結果、マニフェストを検証する場合は、次を実行します。

```powershell
bun run lint
```

拡張機能IDは `src/manifest.json` の `browser_specific_settings.gecko.id` に固定済みです。公開後は同じIDを変更しないでください。

移動元: `README.md`。

<a id="readme-3"></a>

## 依存更新の自動処理

Dependabot は対象の依存関係を毎週確認します。patch／minor／major 更新は PR のチェック（CI）が成功した後に自動で squash merge されます。CI の失敗ジョブは 1 回だけ再実行します。再失敗時は指定した lockfile を再生成し、CI を再実行します。互換性や監査に問題がある更新は、修正後の CI 成功を確認するまで取り込みません。

移動元: `README.md`。

## 根拠と検証記録

- [README.md](README.md): 利用者向けの導入と操作。
- [verification.md](verification.md): 検証手順、実測結果、未確認事項。
- [how-to-update.md](how-to-update.md): 更新・復旧の実手順。

## AMOソースアーカイブの文書同梱

`scripts/build-source.ts` は明示した `rootFiles` だけをソースアーカイブへ追加する。READMEの開発知見を分離したため、同じ参照先をレビュー担当者が読めるよう `findings.md` も対象に含める。配布拡張ZIPには開発文書を追加しない。確認は `bun run build:source` 後にソースTAR.GZのエントリと文書内容を照合する。
