# RandomTrip 実行計画

## フェーズ1: プロジェクトセットアップ

- [x] **1-1: Next.js プロジェクト初期化**
  - `create-next-app` でプロジェクトを初期化（TypeScript, Tailwind CSS, App Router, src/ ディレクトリ）
  - 対象: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  - 完了条件: `npm run dev` でデフォルトページが表示される

- [x] **1-2: Framer Motion 導入**
  - `framer-motion` パッケージをインストール
  - 対象: `package.json`
  - 完了条件: framer-motion が dependencies に含まれる

- [x] **1-3: クリーンアーキテクチャ用ディレクトリ作成**
  - domain / application / infrastructure / presentation の各ディレクトリを作成
  - 対象: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/data/`, `src/presentation/`
  - 完了条件: 全ディレクトリが存在する

## フェーズ2: ドメイン層 & データ層

- [x] **2-1: Spot エンティティ定義**
  - Spot の型定義を実装
  - 対象: `src/domain/entities/spot.ts`
  - 完了条件: Spot 型がエクスポートされている

- [x] **2-2: SpotRepository インターフェース定義**
  - リポジトリの抽象インターフェースを定義
  - 対象: `src/domain/repositories/spot-repository.ts`
  - 完了条件: インターフェースがエクスポートされている

- [x] **2-3: 観光地マスターデータ作成**
  - 国内の有名観光地 25 件のデータを定数として定義
  - 対象: `src/data/spots.ts`
  - 完了条件: Spot 型に準拠した観光地データが 20 件以上存在する

- [x] **2-4: StaticSpotRepository 実装**
  - `spots.ts` のデータを返すリポジトリ実装
  - 対象: `src/infrastructure/repositories/static-spot-repository.ts`
  - 完了条件: `getAll()` で全データ、`getById()` で ID 指定データが取得できる

## フェーズ3: アプリケーション層

- [x] **3-1: ランダム選出ユースケース実装**
  - SpotRepository から全件取得し、ランダムに1件を返すユースケース
  - 対象: `src/application/usecases/select-random-spot.ts`
  - 完了条件: 呼び出すたびにランダムな Spot が返却される

## フェーズ4: プレゼンテーション層（基本UI）

- [x] **4-1: ルーレットボタンコンポーネント**
  - 「運命を決める」ボタンを実装。Framer Motion でホバー・タップアニメーション付き
  - 対象: `src/presentation/components/roulette-button.tsx`
  - 完了条件: クリックイベントが発火するボタンが表示される

- [x] **4-2: 結果表示コンポーネント**
  - 選ばれた観光地の名称（大）、都道府県、概要を表示。「もう一度回す」ボタン付き
  - 対象: `src/presentation/components/result-display.tsx`
  - 完了条件: Spot データを受け取り、情報が正しく表示される

- [x] **4-3: useRoulette カスタムフック**
  - ルーレットの状態管理（idle → spinning → result）。減速制御によるアニメーション連携を含む
  - 対象: `src/presentation/hooks/use-roulette.ts`
  - 完了条件: 各状態が正しく遷移し、result 状態で Spot データが取得できる

- [x] **4-4: メインページ統合**
  - page.tsx で全コンポーネントを組み合わせ、画面を構成
  - 対象: `src/app/page.tsx`, `src/app/layout.tsx`
  - 完了条件: ボタン押下 → 結果表示の基本フローが動作する

## フェーズ5: ルーレットアニメーション

- [x] **5-1: ルーレットアニメーションコンポーネント**
  - Framer Motion の `AnimatePresence` + `motion.div` で地名スライドトランジション
  - 対象: `src/presentation/components/roulette-animation.tsx`
  - 完了条件: アニメーションが滑らかに動作し、期待感を演出できる

- [x] **5-2: useRoulette にアニメーション連携を追加**
  - spinning 状態中にダミー Spot を提供し、タイマーで減速制御（チケット4-3と統合実装済み）
  - 対象: `src/presentation/hooks/use-roulette.ts`
  - 完了条件: spinning 中に表示用 Spot が高速→低速で切り替わり、最終的に選ばれた Spot で停止する

## フェーズ6: 仕上げ

- [x] **6-1: UI/UX ポリッシュ**
  - レイアウト・余白・タイポグラフィ・カラー調整。レスポンシブ対応
  - 対象: `src/app/globals.css`, 各コンポーネント
  - 完了条件: モバイル・デスクトップ両方で見やすく美しいUI

- [x] **6-2: ビルド・Lint 確認**
  - `npm run build` と `npm run lint` がエラーなく通ることを確認
  - 完了条件: ビルド成功、Lint エラーゼロ
