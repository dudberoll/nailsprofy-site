from __future__ import annotations

import argparse
import json
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path


DEFAULT_INPUT = Path(__file__).resolve().parents[3] / "exports/nailsprofi-wordpress/posts.jsonl"
DEFAULT_OUTPUT = Path(__file__).resolve().parents[3] / "website/src/data/blogArticles.json"
WORDS_PER_MINUTE = 180
SHORTCODE_RE = re.compile(r"\[/?[a-zA-Z0-9_-]+[^\]]*\]")
UPLOAD_URL_RE = re.compile(r"https?://nailsprofi\.ru/wp-content/uploads/[^\s\"'<>\\\]]+")


class ContentHTMLParser(HTMLParser):
    paragraph_tags = {"p", "div", "blockquote"}
    heading_tags = {"h1", "h2", "h3", "h4", "h5", "h6"}
    skip_tags = {"script", "style", "noscript", "figure"}
    void_skip_tags = {"img"}

    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[str] = []
        self.parts: list[str] = []
        self.skip_depth = 0
        self.block_kind = "paragraph"
        self.heading_level = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.void_skip_tags:
            return
        if tag in self.skip_tags:
            self.skip_depth += 1
            return
        if tag == "br":
            self.parts.append(" ")
            return
        if tag in self.heading_tags:
            self.flush()
            self.block_kind = "heading"
            self.heading_level = int(tag[1])
            return
        if tag == "li":
            self.flush()
            self.block_kind = "list"
            return
        if tag in self.paragraph_tags:
            self.flush()
            self.block_kind = "paragraph"

    def handle_endtag(self, tag: str) -> None:
        if tag in self.skip_tags and self.skip_depth:
            self.skip_depth -= 1
            return
        if tag in self.heading_tags or tag == "li" or tag in self.paragraph_tags:
            self.flush()

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self.parts.append(data)

    def flush(self) -> None:
        text = clean(" ".join(self.parts))
        if text:
            if self.block_kind == "heading":
                marker = "##" if self.heading_level <= 3 else "###"
                self.blocks.append(f"{marker} {text}")
            elif self.block_kind == "list":
                self.blocks.append(f"- {text}")
            else:
                self.blocks.append(text)
        self.parts = []
        self.block_kind = "paragraph"
        self.heading_level = 0


def clean(value: str) -> str:
    value = unescape(value).replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


def html_to_blocks(html: str) -> list[str]:
    parser = ContentHTMLParser()
    parser.feed(strip_wordpress_markup(html))
    parser.flush()
    return parser.blocks


def strip_wordpress_markup(value: str) -> str:
    value = UPLOAD_URL_RE.sub("", value)
    return SHORTCODE_RE.sub("", value)


def reading_time(paragraphs: list[str]) -> str:
    words = sum(
        len(paragraph.removeprefix("## ").removeprefix("### ").removeprefix("- ").split())
        for paragraph in paragraphs
    )
    minutes = max(1, round(words / WORDS_PER_MINUTE))
    if minutes == 1:
        return "1 минута"
    if 2 <= minutes <= 4:
        return f"{minutes} минуты"
    return f"{minutes} минут"


def primary_category(post: dict) -> str:
    categories = post.get("categories") or []
    for slug in ("stati", "blog"):
        for category in categories:
            if category.get("slug") == slug:
                return category.get("name") or slug
    return categories[0].get("name") if categories else "Блог"


def convert_post(post: dict) -> dict:
    body = html_to_blocks(post.get("content_html") or "")
    text = clean(post.get("excerpt") or "")
    if not text and body:
        text = body[0].removeprefix("## ").removeprefix("### ").removeprefix("- ")
    if len(text) > 180:
        text = text[:177].rsplit(" ", 1)[0] + "..."

    return {
        "id": str(post["wp_id"]),
        "wp_id": post["wp_id"],
        "slug": post.get("slug") or str(post["wp_id"]),
        "url": post.get("url") or "",
        "date": post.get("date") or "",
        "category": primary_category(post),
        "title": clean(post.get("title") or ""),
        "text": text,
        "readingTime": reading_time(body),
        "body": body,
        "tips": [],
    }


def existing_article_by_post_id(output_path: Path) -> dict[int, dict]:
    if not output_path.exists():
        return {}

    existing_articles = json.loads(output_path.read_text(encoding="utf-8"))
    return {int(article["wp_id"]): article for article in existing_articles}


def has_structured_wordpress_content(value: str) -> bool:
    return "<!-- wp:heading" in value or "<!-- wp:list" in value


def import_blog(input_path: Path, output_path: Path) -> list[dict]:
    articles = []
    existing_articles = existing_article_by_post_id(output_path)
    with input_path.open(encoding="utf-8") as source:
        for line in source:
            post = json.loads(line)
            imported_article = convert_post(post)
            article = existing_articles.get(imported_article["wp_id"], imported_article)

            if article is not imported_article and has_structured_wordpress_content(post.get("content_html") or ""):
                article = {**article, "body": imported_article["body"], "readingTime": imported_article["readingTime"]}
            if article["title"] and article["body"]:
                articles.append(article)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(articles, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return articles


def main() -> None:
    parser = argparse.ArgumentParser(description="Import WordPress posts JSONL into the Astro blog data file")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    articles = import_blog(args.input, args.output)
    print(f"Saved {len(articles)} articles to {args.output}")


if __name__ == "__main__":
    main()
