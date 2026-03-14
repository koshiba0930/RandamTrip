# 日本地図ルーレットUI実装計画

## Context
現在のスロット風テキストアニメーション（地名が上下にスライド）を、日本地図の都道府県がランダムに色付けされるビジュアルに変更する。Stopボタンで行き先の県に止まり、結果表示は現在通り。

## アプローチ
Geolonia japanese-prefectures の SVG データ（viewBox 0 0 1000 1000, 47都道府県が個別 `<g>` 要素）をReactコンポーネント化。useRouletteフックは変更不要（displaySpot.prefectureで現在ハイライトする県が決まる）。

## 実装手順

### Phase 1: データ層

- [x] 1-1: `src/data/prefecture-map.ts` 作成
- [x] 1-2: `src/data/japan-svg-paths.ts` 作成（SVGファイルを直接読み込むため不要）

### Phase 2: 地図コンポーネント

- [x] 2-1: `src/presentation/components/japan-map.tsx` 作成

### Phase 3: 統合

- [x] 3-1: `roulette-container.tsx` 修正
- [x] 3-2: `page.tsx` のレイアウト調整
- [x] 3-3: `roulette-animation.tsx` 削除

### Phase 4: 動作確認

- [x] 4-1: `npm run build` でビルドエラーがないことを確認
