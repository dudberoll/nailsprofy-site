from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from scrapling.fetchers import Fetcher

from .extract import (
    BASE_URL,
    extract_contacts,
    extract_page,
    extract_promotions,
    extract_service_urls,
)


DEFAULT_OUTPUT = Path(__file__).resolve().parents[3] / "website/src/data/nailsprofi.json"


def fetch(url: str):
    page = Fetcher.get(url, stealthy_headers=True)
    time.sleep(0.4)
    return page


def scrape() -> dict:
    home = fetch(BASE_URL)
    service_urls = extract_service_urls(home)

    services = []
    for url in service_urls:
        page = fetch(url)
        service = extract_page(page, url)
        if service["price_sections"]:
            services.append(service)

    contacts = extract_contacts(fetch(f"{BASE_URL}contacts"))
    promotions = extract_promotions(fetch(f"{BASE_URL}skidki"))
    portfolio = extract_page(fetch(f"{BASE_URL}nashi-raboty"), f"{BASE_URL}nashi-raboty")

    return {
        "source": BASE_URL,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "contacts": contacts,
        "services": services,
        "promotions": promotions,
        "portfolio": {
            "url": portfolio["url"],
            "title": portfolio["title"],
            "images": portfolio["images"],
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape public data from nailsprofi.ru")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = scrape()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    item_count = sum(
        len(section["items"])
        for service in data["services"]
        for section in service["price_sections"]
    )
    print(
        f"Saved {len(data['services'])} service pages and {item_count} prices "
        f"to {args.output}"
    )


if __name__ == "__main__":
    main()
