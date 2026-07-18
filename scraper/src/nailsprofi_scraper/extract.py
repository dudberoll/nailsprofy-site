from __future__ import annotations

import re
from collections.abc import Iterable
from urllib.parse import urljoin, urlparse


BASE_URL = "https://nailsprofi.ru/"
PRICE_RE = re.compile(r"\d[\d\s]*")
DURATION_RE = re.compile(r"^\d{1,2}:\d{2}$")


def clean(value: str | None) -> str:
    if not value:
        return ""
    value = " ".join(value.replace("\xa0", " ").split())
    value = re.sub(r"\(\s+", "(", value)
    value = re.sub(r"\s+\)", ")", value)
    return re.sub(r"\s+([,.;:])", r"\1", value)


def unique(values: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


def absolute_url(value: str | None, base_url: str = BASE_URL) -> str:
    return urljoin(base_url, clean(value)) if value else ""


def is_internal_public_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.netloc == "nailsprofi.ru" and not parsed.query


def parse_price(price_text: str) -> tuple[int | None, int | None]:
    values = [int(value.replace(" ", "")) for value in PRICE_RE.findall(price_text)]
    if not values:
        return None, None
    return min(values), max(values)


def extract_service_urls(page) -> list[str]:
    urls = []
    for href in page.css("#primary-menu a::attr(href)").getall():
        url = absolute_url(href)
        if "/uslugi-ceny/" in url and is_internal_public_url(url):
            urls.append(url.rstrip("/"))
    return unique(urls)


def _cell_text(cell) -> str:
    return clean(" ".join(cell.css("::text").getall()))


def extract_price_sections(page) -> list[dict]:
    sections: list[dict] = []

    for table in page.css("#content table"):
        current = "Общие услуги"
        items: list[dict] = []

        for row in table.css("tr"):
            cells = row.css("th, td")
            texts = [_cell_text(cell) for cell in cells]
            texts = [text for text in texts if text]
            if not texts:
                continue

            heading = clean(" ".join(row.css("h2::text, h3::text, h4::text").getall()))
            if heading or len(texts) == 1:
                if items:
                    sections.append({"name": current, "items": items})
                    items = []
                current = heading or texts[0]
                continue

            if texts[0].lower() in {"услуга", "услуги", "наименование"}:
                continue

            duration = next((text for text in texts[1:] if DURATION_RE.match(text)), None)
            price_text = texts[-1]
            price_min, price_max = parse_price(price_text)
            if price_min is None:
                continue

            items.append(
                {
                    "name": texts[0],
                    "duration": duration,
                    "price_text": price_text,
                    "price_rub_min": price_min,
                    "price_rub_max": price_max,
                }
            )

        if items:
            sections.append({"name": current, "items": items})

    return sections


def extract_images(page, limit: int = 80) -> list[dict]:
    images: list[dict] = []
    seen: set[str] = set()

    for image in page.css("#content img"):
        source = image.attrib.get("data-src") or image.attrib.get("src")
        url = absolute_url(source)
        if "/wp-content/uploads/" not in url or url in seen:
            continue
        seen.add(url)
        images.append({"url": url, "alt": clean(image.attrib.get("alt"))})
        if len(images) >= limit:
            break

    return images


def extract_page(page, url: str) -> dict:
    title = clean(page.css("#content h1::text").get()) or clean(page.css("h1::text").get())
    description = clean(page.css('meta[name="description"]::attr(content)').get())
    hero_image = absolute_url(page.css('meta[property="og:image"]::attr(content)').get())

    return {
        "url": url,
        "title": title,
        "description": description,
        "hero_image": hero_image or None,
        "price_sections": extract_price_sections(page),
        "images": extract_images(page),
    }


def extract_contacts(page) -> dict:
    content = page.css("#content")
    phones = unique(clean(value) for value in content.css('a[href^="tel:"]::text').getall())
    emails = unique(clean(value) for value in content.css('a[href^="mailto:"]::text').getall())
    address = clean(
        " ".join(content.css("p.cht1::text, p.cht1 *::text").getall())
    )
    hours = next(
        (
            clean(value)
            for value in content.css("h2::text, h3::text, h4::text").getall()
            if re.search(r"\d{1,2}[-:]\d{2}", value)
        ),
        "",
    )
    social_urls = unique(
        absolute_url(href)
        for href in page.css(".soc-ico a::attr(href)").getall()
        if href and not href.startswith("#")
    )

    return {
        "address": address,
        "hours": hours,
        "phones": phones,
        "emails": emails,
        "social_urls": social_urls,
        "booking_url": f"{BASE_URL}online",
    }


def extract_promotions(page) -> dict:
    content = page.css("#content")
    headings = unique(
        clean(value)
        for value in page.css("h1::text, #content h2::text, #content h3::text, #content h4::text").getall()
    )
    paragraphs = unique(_cell_text(element) for element in content.css("p"))
    offers = unique(_cell_text(element) for element in content.css(".standard-number-list li"))
    return {
        "url": f"{BASE_URL}skidki",
        "headings": headings,
        "offers": offers,
        "paragraphs": [value for value in paragraphs if len(value) >= 20],
        "images": extract_images(page, limit=30),
    }
