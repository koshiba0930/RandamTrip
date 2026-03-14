# 観光地データ拡充計画（1000件以上）

## 概要
現在25件の観光地データをWikipedia「日本の観光地一覧」からスクレイピングし1000件以上に拡充する。

## Phase 1: Pythonスクリプト作成

- [x] 1-1: `scripts/scrape_spots.py` の基本構造作成
- [x] 1-2: `fetch_wikitext()` 関数実装（MediaWiki APIでウィキテキスト取得）
- [x] 1-3: `parse_spots_from_wikitext()` 関数実装（都道府県別スポット名抽出）
- [x] 1-4: `fetch_descriptions_batch()` 関数実装（TextExtracts APIで説明文取得）
- [x] 1-5: `clean_description()` 関数実装（ふりがな除去、文字数制限等）
- [x] 1-6: `generate_typescript()` 関数実装（spots.ts出力）

## Phase 2: スクリプト実行・データ生成

- [x] 2-1: スクリプト実行し `src/data/spots.ts` を生成
- [x] 2-2: 抽出件数が1000件以上であることを確認（1,499件）
- [x] 2-3: 全47都道府県にスポットが存在することを確認

## Phase 3: 動作確認

- [x] 3-1: `npm run build` でビルドエラーがないことを確認
- [ ] 3-2: アプリケーション動作確認（ルーレットが正常動作）
