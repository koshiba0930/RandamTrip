# microCMS連携セットアップ計画

## 概要
microCMSクライアントコードは実装済みだが、`.env.local`がプレースホルダーのままで404エラーが発生している。microCMSサービスのセットアップと接続設定を行い、観光地データをmicroCMSで管理できるようにする。

## Phase 1: microCMSセットアップ（ユーザー作業）

- [ ] microCMSアカウント作成・サービス作成（https://app.microcms.io/）
- [ ] API作成（エンドポイント: `spots`、リスト形式）
  - フィールド定義:
    - `name`（テキストフィールド）: 観光地名
    - `prefecture`（テキストフィールド）: 都道府県
    - `description`（テキストエリア）: 概要
- [ ] APIキー確認（サービス設定 → APIキー）
- [ ] 既存25件の観光地データを登録

## Phase 2: 環境変数設定（ユーザー作業）

- [ ] `.env.local` を実際の値に更新
  - `MICROCMS_SERVICE_DOMAIN=実際のサービスドメイン`
  - `MICROCMS_API_KEY=実際のAPIキー`

## Phase 3: コード修正

- [x] `src/infrastructure/microcms/client.ts` のデバッグ用 `console.log`（34行目）を削除

## Phase 4: 動作確認

- [ ] `npm run dev` で開発サーバー起動し、microCMSからデータ取得を確認（404解消）
- [ ] ルーレットが正常に動作することを確認
- [ ] `npm run build` でビルドエラーがないことを確認
