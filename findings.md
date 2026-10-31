# 調査知見

- headless Firefoxの実クリックではOSクリップボードへコピーされなかった。E2Eは隔離したWindows CIのデスクトップで行い、利用者のローカルFirefoxを操作しない。ローカル実行時は `finally` で元のクリップボードを復元する。
- Windows作業コピーはCRLF、リポジトリはLF。format後に `git diff --stat` が空なら改行だけの表示差分なのでコミットしない。
- 上流の厳密な依存範囲は `bun audit fix` だけでは解消しない。`overrides` と `bun.lock` を同時更新し、実効版を確認する。node-forge は公開修正版 1.4.2 を使い、署名構造の回帰テストを維持する。
- deepmerge 4.3.1 は公開修正版がないため、両方のマージ経路で `__proto__` を拒否する限定パッチを適用する。minimatch 3.1.5 は作者の勧告対象である 10 系の増幅処理を持たず、ソースのハッシュと攻撃パターンの非増幅を検証する。監査は全deepmerge配置を確認して追加コピーを拒否し、対象2件を表示して版・パッチ・回帰の不一致と未知の警告を失敗させる。
- 古いDependabot PRは先行マージと `package.json`/`bun.lock` が競合し得る。`origin/main` を通常マージし、manifestの両変更を保ち、lockfileをmain基点で再生成する。強制pushしない。
- Firefox拡張IDは公開後に変更しない。AMO用ソースアーカイブは `scripts/build-source.ts` の明示リスト方式なので、開発上必要な文書を増減したら同リストとTAR.GZ内容も確認する。
