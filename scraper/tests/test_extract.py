import json

from scrapling.parser import Selector

from nailsprofi_scraper.extract import (
    extract_contacts,
    extract_price_sections,
    extract_promotions,
    parse_price,
)
from nailsprofi_scraper.blog_import import html_to_blocks, import_blog
from nailsprofi_scraper.wordpress_export import export_wordpress


def test_parse_price_range() -> None:
    assert parse_price("от 2 500 до 3 700 р.") == (2500, 3700)
    assert parse_price("1900 р.") == (1900, 1900)
    assert parse_price("по запросу") == (None, None)


def test_extract_price_sections() -> None:
    page = Selector(
        """
        <div id="content">
          <table>
            <tr><td colspan="3"><h3>Маникюр</h3></td></tr>
            <tr><td>Аппаратный маникюр</td><td>01:00</td><td>1800 р.</td></tr>
            <tr><td>Дизайн</td><td>от 100 до 300 р.</td></tr>
          </table>
        </div>
        """
    )

    assert extract_price_sections(page) == [
        {
            "name": "Маникюр",
            "items": [
                {
                    "name": "Аппаратный маникюр",
                    "duration": "01:00",
                    "price_text": "1800 р.",
                    "price_rub_min": 1800,
                    "price_rub_max": 1800,
                },
                {
                    "name": "Дизайн",
                    "duration": None,
                    "price_text": "от 100 до 300 р.",
                    "price_rub_min": 100,
                    "price_rub_max": 300,
                },
            ],
        }
    ]


def test_extract_contacts_from_main_content() -> None:
    page = Selector(
        """
        <div id="content">
          <p class="cht1">Москва, улица Тимура Фрунзе 18<br>метро Парк Культуры</p>
          <h3>С 10-00 до 21-00 без выходных.</h3>
          <a href="tel:+74956170019">+7 (495) 617 00 19</a>
          <a href="mailto:info@nailsprofi.ru">info@nailsprofi.ru</a>
        </div>
        <div class="soc-ico"><a href="https://t.me/nailsprofisalon">Telegram</a></div>
        """
    )

    contacts = extract_contacts(page)
    assert contacts["address"] == "Москва, улица Тимура Фрунзе 18 метро Парк Культуры"
    assert contacts["hours"] == "С 10-00 до 21-00 без выходных."
    assert contacts["phones"] == ["+7 (495) 617 00 19"]
    assert contacts["emails"] == ["info@nailsprofi.ru"]


def test_extract_promotions_from_list() -> None:
    page = Selector(
        """
        <h1>Скидки и бонусы</h1>
        <div id="content">
          <h4>Студия красоты</h4>
          <div class="standard-number-list">
            <ul><li>В день рождения скидка <span>-20%</span></li></ul>
          </div>
        </div>
        """
    )

    promotions = extract_promotions(page)
    assert promotions["headings"] == ["Скидки и бонусы", "Студия красоты"]
    assert promotions["offers"] == ["В день рождения скидка -20%"]


def test_export_wordpress_articles_and_media(tmp_path) -> None:
    source = tmp_path / "export.xml"
    source.write_text(
        """<?xml version="1.0" encoding="UTF-8" ?>
<rss
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <item>
      <title>Статья</title>
      <link>https://nailsprofi.ru/stati/article.html</link>
      <content:encoded><![CDATA[<p>Текст</p><img src="https://nailsprofi.ru/wp-content/uploads/2011/01/a.jpg" alt="A">]]></content:encoded>
      <excerpt:encoded><![CDATA[Коротко]]></excerpt:encoded>
      <wp:post_id>10</wp:post_id>
      <wp:post_date>2011-01-01 10:00:00</wp:post_date>
      <wp:post_modified>2011-01-02 10:00:00</wp:post_modified>
      <wp:post_name>article</wp:post_name>
      <wp:status>publish</wp:status>
      <wp:post_type>post</wp:post_type>
      <category domain="category" nicename="stati"><![CDATA[Статьи]]></category>
    </item>
    <item>
      <title>A</title>
      <link>https://nailsprofi.ru/stati/article.html/attachment/a</link>
      <wp:post_id>11</wp:post_id>
      <wp:post_parent>10</wp:post_parent>
      <wp:post_type>attachment</wp:post_type>
      <wp:post_mime_type>image/jpeg</wp:post_mime_type>
      <wp:attachment_url><![CDATA[https://nailsprofi.ru/wp-content/uploads/2011/01/a.jpg]]></wp:attachment_url>
    </item>
    <item>
      <title>Черновик</title>
      <wp:post_id>12</wp:post_id>
      <wp:status>draft</wp:status>
      <wp:post_type>post</wp:post_type>
      <category domain="category" nicename="stati"><![CDATA[Статьи]]></category>
    </item>
  </channel>
</rss>
""",
        encoding="utf-8",
    )

    summary = export_wordpress(source, tmp_path / "out")

    assert summary["posts"] == 1
    assert summary["media"] == 1
    post = (tmp_path / "out/posts.jsonl").read_text(encoding="utf-8")
    media = (tmp_path / "out/media.jsonl").read_text(encoding="utf-8")
    assert '"title":"Статья"' in post
    assert '"attachment_wp_id":11' in post
    assert '"upload_path":"2011/01/a.jpg"' in media


def test_import_blog_strips_images(tmp_path) -> None:
    source = tmp_path / "posts.jsonl"
    source.write_text(
        json.dumps(
            {
                "wp_id": 10,
                "title": "Статья",
                "slug": "article",
                "url": "https://nailsprofi.ru/stati/article.html",
                "date": "2011-01-01 10:00:00",
                "categories": [{"slug": "stati", "name": "Статьи"}],
                "excerpt": "",
                "content_html": "<h2>Заголовок</h2><p>Текст <img src='a.jpg'> после картинки.</p>",
            },
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    articles = import_blog(source, tmp_path / "blog.json")

    assert articles[0]["category"] == "Статьи"
    assert articles[0]["body"] == ["## Заголовок", "Текст после картинки."]
    assert "img" not in json.dumps(articles, ensure_ascii=False)


def test_html_to_blocks_ignores_figures() -> None:
    assert html_to_blocks("<figure><img src='x'><figcaption>Фото</figcaption></figure><p>Текст</p>") == [
        "Текст"
    ]


def test_html_to_blocks_strips_visual_composer_image_urls() -> None:
    blocks = html_to_blocks(
        '[vc_row bg_image_new="url^https://nailsprofi.ru/wp-content/uploads/2017/07/service-head.jpg"]'
        "[vc_column_text]Текст статьи[/vc_column_text]"
    )

    assert blocks == ["Текст статьи"]
