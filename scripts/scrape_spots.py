#!/usr/bin/env python3
"""
Wikipedia「日本の観光地一覧」から観光地データをスクレイピングし、
src/data/spots.ts を生成するスクリプト。

使用API: MediaWiki API (ja.wikipedia.org)
依存: 標準ライブラリのみ (urllib, json, re, time)
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

WIKI_API = "https://ja.wikipedia.org/w/api.php"
USER_AGENT = "RandomTripBot/1.0 (RandomTrip travel app) Python/3.10"
BATCH_SIZE = 20
DELAY_BETWEEN_REQUESTS = 1.0
MAX_RETRIES = 3
MAX_DESCRIPTION_LENGTH = 120

# 都道府県マッピング（地方→都道府県の判定に使用）
PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

# 地方→都道府県のデフォルトマッピング（1県のみの地方用）
REGION_TO_PREFECTURE = {
    "北海道地方": "北海道",
    "沖縄地方": "沖縄県",
}

# 除外パターン（市町村名や非観光地リンク）
EXCLUDE_PATTERNS = [
    r".*[市町村区郡]$",  # 市町村名
    r"^(都道府県|地方|日本).*",
    r"^Category:",
]


def api_request(params: dict) -> dict:
    """Wikipedia APIにリクエストを送信する。"""
    params["format"] = "json"
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** (attempt + 1)
                print(f"  リトライ ({attempt + 1}/{MAX_RETRIES}): {e}, {wait}秒待機...")
                time.sleep(wait)
            else:
                raise


def fetch_wikitext(page_title: str) -> str:
    """Wikipediaページのウィキテキストを取得する。"""
    print(f"ウィキテキスト取得中: {page_title}")
    data = api_request({
        "action": "query",
        "titles": page_title,
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
    })
    pages = data["query"]["pages"]
    page = next(iter(pages.values()))
    if "revisions" not in page:
        raise ValueError(f"ページが見つかりません: {page_title}")
    return page["revisions"][0]["slots"]["main"]["*"]


def extract_links_from_segment(text: str) -> list[str]:
    """テキストセグメントからWikiリンクのタイトルを抽出する。"""
    links = []
    for match in re.finditer(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", text):
        title = match.group(1).strip()
        if title:
            links.append(title)
    return links


def is_prefecture_line(line: str) -> str | None:
    """行が都道府県名のみの行かどうか判定し、都道府県名を返す。"""
    stripped = re.sub(r"^\*+\s*", "", line).strip()
    for pref in PREFECTURES:
        if stripped == pref:
            return pref
    return None


def detect_prefecture_in_line(line: str) -> str | None:
    """行内に都道府県名が含まれているか検出する。"""
    for pref in PREFECTURES:
        if pref in line:
            return pref
    return None


def should_exclude(name: str) -> bool:
    """スポット名が除外対象かどうか判定する。"""
    for pattern in EXCLUDE_PATTERNS:
        if re.match(pattern, name):
            return True
    return False


def parse_spots_from_wikitext(wikitext: str) -> list[dict]:
    """ウィキテキストからスポット名と都道府県を抽出する。"""
    print("ウィキテキスト解析中...")
    spots = []
    seen = set()
    current_region = ""
    current_prefecture = ""

    lines = wikitext.split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 地方ヘッダー: == 北海道地方 ==
        region_match = re.match(r"^==\s*(.+?)\s*==$", line)
        if region_match:
            current_region = region_match.group(1).strip()
            # 北海道と沖縄は地方=都道府県
            current_prefecture = REGION_TO_PREFECTURE.get(current_region, "")
            continue

        # 見出しレベル3以上はスキップ
        if line.startswith("==="):
            continue

        # 箇条書き行のみ処理
        if not line.startswith("*"):
            continue

        # 都道府県名のみの行
        pref = is_prefecture_line(line)
        if pref:
            current_prefecture = pref
            continue

        # ダッシュで分割してスポットを抽出
        # 様々なダッシュ文字に対応: -, −, –, —
        dash_split = re.split(r"\s*[-−–—]\s*", line, maxsplit=1)
        if len(dash_split) < 2:
            continue

        before_dash = dash_split[0]
        after_dash = dash_split[1]

        # ダッシュ前から都道府県を検出（複数県跨ぎの場合）
        line_pref = detect_prefecture_in_line(before_dash)
        prefecture = line_pref or current_prefecture

        if not prefecture:
            continue

        # ダッシュ後のリンクを観光スポットとして抽出
        spot_names = extract_links_from_segment(after_dash)

        for name in spot_names:
            # 除外判定
            if should_exclude(name):
                continue

            # 表示名はクリーニング（曖昧さ回避括弧除去）
            display_name = clean_spot_name(name)
            key = (display_name, prefecture)
            if key not in seen:
                seen.add(key)
                spots.append({
                    "name": display_name,
                    "prefecture": prefecture,
                    "wiki_title": name,  # API用には元のタイトルを保持
                })

    print(f"  抽出スポット数: {len(spots)}")
    return spots


def fetch_descriptions_batch(titles: list[str]) -> dict[str, str]:
    """複数タイトルの説明文をバッチ取得する。"""
    data = api_request({
        "action": "query",
        "titles": "|".join(titles),
        "prop": "extracts",
        "exintro": "true",
        "explaintext": "true",
        "exsentences": "2",
        "redirects": "1",
    })

    descriptions = {}
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        title = page.get("title", "")
        extract = page.get("extract", "")
        if extract:
            descriptions[title] = extract

    # リダイレクトのマッピングを処理
    redirects = data.get("query", {}).get("redirects", [])
    for r in redirects:
        from_title = r.get("from", "")
        to_title = r.get("to", "")
        if to_title in descriptions and from_title not in descriptions:
            descriptions[from_title] = descriptions[to_title]

    # 正規化のマッピングを処理
    normalized = data.get("query", {}).get("normalized", [])
    for n in normalized:
        from_title = n.get("from", "")
        to_title = n.get("to", "")
        if to_title in descriptions and from_title not in descriptions:
            descriptions[from_title] = descriptions[to_title]

    return descriptions


def clean_spot_name(name: str) -> str:
    """スポット名から曖昧さ回避括弧を除去する。"""
    # Wikipedia曖昧さ回避: 「大沼 (七飯町)」→「大沼」
    cleaned = re.sub(r"\s*\([^)]+\)", "", name)
    return cleaned.strip()


def clean_description(raw: str) -> str:
    """Wikipedia説明文をクリーンアップする。"""
    if not raw:
        return ""

    cleaned = raw

    # 冒頭の読み仮名括弧を除去（最初の「（...）」で、ひらがな/カタカナを含むもの）
    # 例: 竹富島（たけとみじま、八重山語:テードゥン、タキドゥン）は → 竹富島は
    cleaned = re.sub(r"（[^）]*[ぁ-ゖァ-ヶー][^）]*）", "", cleaned)
    cleaned = re.sub(r"\([^)]*[ぁ-ゖァ-ヶー][^)]*\)", "", cleaned)

    # 英語名等の除去: （英: ...）
    cleaned = re.sub(r"（英[：:]?\s*[A-Za-z\s,.'&\-]+?）", "", cleaned)
    cleaned = re.sub(r"\(英[：:]?\s*[A-Za-z\s,.'&\-]+?\)", "", cleaned)

    # 空白・改行の正規化
    cleaned = re.sub(r"\s+", "", cleaned)

    # 2文で切る
    sentences = cleaned.split("。")
    if len(sentences) > 2:
        cleaned = "。".join(sentences[:2]) + "。"

    # 先頭の不要な文字を除去
    cleaned = cleaned.strip("、。 ")
    if not cleaned.endswith("。"):
        cleaned += "。"

    # 文字数制限
    if len(cleaned) > MAX_DESCRIPTION_LENGTH:
        # 文の区切りで切る
        truncated = ""
        for sentence in cleaned.split("。"):
            if not sentence:
                continue
            candidate = truncated + sentence + "。"
            if len(candidate) <= MAX_DESCRIPTION_LENGTH:
                truncated = candidate
            else:
                break
        if truncated:
            cleaned = truncated
        else:
            cleaned = cleaned[:MAX_DESCRIPTION_LENGTH - 3] + "..."

    return cleaned


def fetch_all_descriptions(spots: list[dict]) -> None:
    """全スポットの説明文を取得する。"""
    total = len(spots)
    title_to_spots = {}
    for spot in spots:
        title = spot["wiki_title"]
        if title not in title_to_spots:
            title_to_spots[title] = []
        title_to_spots[title].append(spot)

    unique_titles = list(title_to_spots.keys())
    total_batches = (len(unique_titles) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"説明文取得中... ({len(unique_titles)}件, {total_batches}バッチ)")

    for i in range(0, len(unique_titles), BATCH_SIZE):
        batch = unique_titles[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        try:
            descriptions = fetch_descriptions_batch(batch)
            for title in batch:
                desc = descriptions.get(title, "")
                cleaned = clean_description(desc)
                for spot in title_to_spots[title]:
                    spot["description"] = cleaned
        except Exception as e:
            print(f"  バッチ {batch_num} エラー: {e}")
            for title in batch:
                for spot in title_to_spots[title]:
                    if "description" not in spot:
                        spot["description"] = ""

        if batch_num % 10 == 0 or batch_num == total_batches:
            print(f"  進捗: {batch_num}/{total_batches} バッチ完了")

        if i + BATCH_SIZE < len(unique_titles):
            time.sleep(DELAY_BETWEEN_REQUESTS)

    # 説明文がないスポットにフォールバック
    no_desc_count = 0
    for spot in spots:
        if not spot.get("description"):
            spot["description"] = f"{spot['prefecture']}にある観光スポット。"
            no_desc_count += 1

    if no_desc_count > 0:
        print(f"  フォールバック説明文を使用: {no_desc_count}件")


def generate_typescript(spots: list[dict], output_path: str) -> None:
    """TypeScriptファイルを生成する。"""
    print(f"TypeScript生成中: {output_path}")

    lines = [
        'import { Spot } from "@/domain/entities/spot";',
        "",
        "export const SPOTS: readonly Spot[] = [",
    ]

    for i, spot in enumerate(spots, 1):
        # 文字列エスケープ
        name = spot["name"].replace('"', '\\"')
        prefecture = spot["prefecture"].replace('"', '\\"')
        description = spot["description"].replace('"', '\\"')

        lines.append("  {")
        lines.append(f'    id: "{i}",')
        lines.append(f'    name: "{name}",')
        lines.append(f'    prefecture: "{prefecture}",')
        lines.append(f'    description:')
        lines.append(f'      "{description}",')
        lines.append("  },")

    lines.append("] as const;")
    lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"  {len(spots)}件のスポットを書き込みました")


def print_stats(spots: list[dict]) -> None:
    """統計情報を表示する。"""
    print("\n=== 統計情報 ===")
    print(f"総スポット数: {len(spots)}")

    pref_counts: dict[str, int] = {}
    for spot in spots:
        pref = spot["prefecture"]
        pref_counts[pref] = pref_counts.get(pref, 0) + 1

    print(f"都道府県数: {len(pref_counts)}")

    # 都道府県別件数（降順）
    print("\n都道府県別件数:")
    for pref, count in sorted(pref_counts.items(), key=lambda x: -x[1]):
        print(f"  {pref}: {count}件")

    # カバレッジ確認
    missing = [p for p in PREFECTURES if p not in pref_counts]
    if missing:
        print(f"\n未カバー都道府県: {', '.join(missing)}")
    else:
        print("\n全47都道府県をカバーしています")


def main():
    """メインの実行関数。"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(project_root, "src", "data", "spots.ts")

    # 1. ウィキテキスト取得
    wikitext = fetch_wikitext("日本の観光地一覧")

    # 2. スポット名・都道府県を抽出
    spots = parse_spots_from_wikitext(wikitext)

    if len(spots) == 0:
        print("エラー: スポットが抽出できませんでした")
        sys.exit(1)

    # 3. 説明文を取得
    fetch_all_descriptions(spots)

    # 4. 統計情報を表示
    print_stats(spots)

    # 5. TypeScriptファイルを生成
    generate_typescript(spots, output_path)

    # 6. 中間データをJSONとして保存（デバッグ用）
    json_path = os.path.join(script_dir, "spots_output.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(spots, f, ensure_ascii=False, indent=2)
    print(f"中間JSON保存: {json_path}")

    print(f"\n完了! {len(spots)}件のスポットデータを生成しました")


if __name__ == "__main__":
    main()
