# AGENTS.md

## 作業開始前の必須手順（最優先・例外なし）

1. エージェントは、調査、計画、コマンド実行、スキル利用、ファイル編集、コミット、プッシュを始める前に、必ずリポジトリ直下の `.\COMMON-AGENTS.md` を開き、先頭から末尾まで全文を読む。
2. `COMMON-AGENTS.md` はGit管理外のシンボリックリンクである。`git`や既定のignore設定が有効な`rg --files`の検索結果だけで、ファイルが存在しないと判断してはならない。PowerShellでは最初に次を実行する。

```powershell
Get-Content -Raw -LiteralPath .\COMMON-AGENTS.md
```

3. 読み取りに失敗した場合、出力が省略された場合、または末尾まで読めたことを確認できない場合は、一切の作業を開始せず、パスとシンボリックリンク先を確認して全文を再取得する。必要なら分割して末尾まで読む。
4. 全文を読了するまで、ローカル `AGENTS.md` だけを根拠に作業を続けてはならない。読了後は `COMMON-AGENTS.md` を最優先の指針とし、読了直後の最初の進捗報告で全文を読了したことを明示する。
   このファイルでは `amazon-dp-urls` 固有の補足だけを記載する。

## Environment

- Windows作業コピーは `core.autocrlf=true` のためCRLF、リポジトリ内はLF。`bun run format` が複数ファイルを変更表示しても内容差分がない場合（`git diff --stat` が空）は改行のみの差分なのでコミットせず `git checkout --` で戻す。CI（Linux/LF）では `format:check` が成功する。
- Dependabot PRが古いまま残ると先行マージ済みの他PRと `package.json`/`bun.lock` で競合（`MERGEABLE: CONFLICTING`）する。解消手順：PRブランチに `origin/main` を通常マージし、`package.json` はPRの更新版とmain側の最新版を両方保持、`bun.lock` はmain側を取得後に `bun install` で再生成して監査し、pushする。強制pushは不要。CI（verify/firefox-e2e/classify）が成功すれば自動マージされ、リモートブランチも自動削除される。残った追跡参照は `git fetch --prune` で掃除する。
- Firefox E2Eはローカルで実行せずCIに任せる（ユーザーのメインブラウザFirefoxと競合するため）。

## 依存監査で確定した事項（2026-09-23）

- `bun audit fix` だけでは adm-zip、brace-expansion、image-size の脆弱版が上流の厳密な依存範囲で残る。`package.json` の既存 `overrides` と `bun.lock` を同時に更新し、`bun audit` と関連テスト・ビルドで確認する。上流が安全版を取り込んだ場合は override の必要性を再評価する。
- 2026-10-02の再監査では、既存brace-expansion override自体が脆弱版5.0.9へ固定していた。bun audit fixでfast-uriとundiciを互換範囲内で更新した後、overrideを安全版へ更新して再インストール・監査する。詳細はverification.mdを参照。
- 2026-10-02にnode-forge 1.4.0の未修正脆弱性GHSA-86w9-cpqp-85rvが再監査で検出された。bun audit fixは0件と表示してもbun auditは失敗した。修正版公開状況を再確認し、fixの表示だけで解消と判断しない。上流PRと監査結果はverification.mdに記録する。
- 2026-10-11時点でnode-forgeの公開修正版はない。PR #6では上流PR #1152のRSA検証差分を `patches/node-forge@1.4.0.patch` として適用し、`tests/unit/node-forge-security.test.ts` で正常署名と不正な入れ子要素を検証する。`bun run audit:patched` はこのテスト成功後だけ、版番号に残るGHSA-86w9-cpqp-85rvを監査対象から除く。修正版が公開されたらパッチと例外を再評価する。詳細はverification.mdを参照。
- Firefox E2E は隔離した Windows GitHub runner のデスクトップで実行し、OS クリップボードを検証する。共通指針のヘッドレス原則に対し、この CI ジョブだけは、headless Firefox のクリックでは OS クリップボードへコピーされなかった実測に基づき、デスクトップ経路を使用する。ユーザーのローカル Firefox は操作しない。ローカル実行時は `finally` で元の内容へ戻し、元が空なら Windows Forms で消去する。CI の使い捨て runner では復元を省く。待機失敗は段階ログで判別する（`tests/e2e/context-menu.e2e.ts`）。
