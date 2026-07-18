from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path


WP_NS = {"content": "http://purl.org/rss/1.0/modules/content/", "wp": "http://wordpress.org/export/1.2/"}
ARTICLE_CATEGORIES = {"blog", "stati"}


class ImageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.images: list[dict] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "img":
            return
        values = dict(attrs)
        src = values.get("data-src") or values.get("src")
        if src:
            self.images.append({"url": src, "alt": values.get("alt") or ""})


def text(item: ET.Element, path: str) -> str:
    return item.findtext(path, default="", namespaces=WP_NS).strip()


def item_id(item: ET.Element) -> int | None:
    value = text(item, "wp:post_id")
    return int(value) if value.isdigit() else None


def categories(item: ET.Element, domain: str) -> list[dict]:
    result = []
    for category in item.findall("category"):
        if category.attrib.get("domain") == domain:
            result.append({"slug": category.attrib.get("nicename", ""), "name": category.text or ""})
    return result


def html_images(html: str) -> list[dict]:
    parser = ImageParser()
    parser.feed(html)
    seen = set()
    images = []
    for image in parser.images:
        if image["url"] in seen:
            continue
        seen.add(image["url"])
        images.append(image)
    return images


def upload_path(url: str) -> str:
    match = re.search(r"/wp-content/uploads/(.+)$", url)
    return match.group(1) if match else ""


def parse_attachment(item: ET.Element) -> dict | None:
    url = text(item, "wp:attachment_url")
    wp_id = item_id(item)
    if not url or wp_id is None:
        return None
    parent = text(item, "wp:post_parent")
    return {
        "wp_id": wp_id,
        "parent_wp_id": int(parent) if parent.isdigit() else None,
        "title": item.findtext("title") or "",
        "url": url,
        "upload_path": upload_path(url),
        "mime_type": text(item, "wp:post_mime_type"),
    }


def parse_article(item: ET.Element) -> dict | None:
    if text(item, "wp:post_type") != "post" or text(item, "wp:status") != "publish":
        return None

    post_categories = categories(item, "category")
    if not any(category["slug"] in ARTICLE_CATEGORIES for category in post_categories):
        return None

    wp_id = item_id(item)
    if wp_id is None:
        return None

    content_html = item.findtext("content:encoded", default="", namespaces=WP_NS)
    return {
        "wp_id": wp_id,
        "title": item.findtext("title") or "",
        "slug": text(item, "wp:post_name"),
        "url": item.findtext("link") or "",
        "date": text(item, "wp:post_date"),
        "modified": text(item, "wp:post_modified"),
        "status": "publish",
        "categories": post_categories,
        "tags": categories(item, "post_tag"),
        "excerpt": item.findtext("excerpt:encoded", default="", namespaces={**WP_NS, "excerpt": "http://wordpress.org/export/1.2/excerpt/"})
        or "",
        "content_html": content_html,
        "images": html_images(content_html),
    }


def read_export(path: Path) -> tuple[list[dict], dict[int, dict]]:
    articles: list[dict] = []
    attachments: dict[int, dict] = {}
    for _, item in ET.iterparse(path, events=("end",)):
        if item.tag == "item":
            article = parse_article(item)
            if article:
                articles.append(article)
            attachment = parse_attachment(item)
            if attachment:
                attachments[attachment["wp_id"]] = attachment
            item.clear()
    return articles, attachments


def export_wordpress(input_path: Path, output_dir: Path) -> dict:
    articles, attachments = read_export(input_path)
    selected_ids = {article["wp_id"] for article in articles}
    attachments_by_url = {attachment["url"]: attachment for attachment in attachments.values()}

    media_by_url: dict[str, dict] = {}
    for attachment in attachments.values():
        if attachment["parent_wp_id"] in selected_ids:
            media_by_url[attachment["url"]] = attachment

    for article in articles:
        for image in article["images"]:
            attachment = attachments_by_url.get(image["url"])
            if attachment:
                image["attachment_wp_id"] = attachment["wp_id"]
                media_by_url.setdefault(attachment["url"], attachment)
            media_by_url.setdefault(
                image["url"],
                {
                    "wp_id": attachment["wp_id"] if attachment else None,
                    "parent_wp_id": article["wp_id"],
                    "title": image["alt"],
                    "url": image["url"],
                    "upload_path": upload_path(image["url"]),
                    "mime_type": "",
                },
            )

    output_dir.mkdir(parents=True, exist_ok=True)
    write_jsonl(output_dir / "posts.jsonl", articles)
    media = sorted(media_by_url.values(), key=lambda item: (item["upload_path"], item["url"]))
    write_jsonl(output_dir / "media.jsonl", media)

    summary = {
        "source": str(input_path),
        "article_categories": sorted(ARTICLE_CATEGORIES),
        "posts": len(articles),
        "media": len(media),
        "all_attachments_in_export": len(attachments),
        "post_categories": Counter(
            category["slug"] for article in articles for category in article["categories"]
        ),
    }
    (output_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return summary


def write_jsonl(path: Path, rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as output:
        for row in rows:
            output.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export published WordPress articles and media from WXR")
    parser.add_argument("input", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("wordpress-export"))
    args = parser.parse_args()

    summary = export_wordpress(args.input, args.output_dir)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
