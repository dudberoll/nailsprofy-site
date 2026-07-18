# Инструменты импорта NailsProfi

Python-пакет содержит три вспомогательные команды:

- `nailsprofi-scrape` — получает публичные услуги, цены и контакты с текущего сайта;
- `nailsprofi-wordpress-export` — преобразует исходный WordPress XML в компактные JSONL-файлы;
- `nailsprofi-blog-import` — обновляет Astro-файл статей из подготовленного `posts.jsonl`.

Для обычного запуска сайта Python не нужен.

## Установка

Из корня проекта:

```bash
python3.11 -m venv scraper/.venv
scraper/.venv/bin/python -m pip install -e "./scraper[dev]"
```

## Импорт блога

```bash
scraper/.venv/bin/nailsprofi-blog-import
```

По умолчанию команда читает `exports/nailsprofi-wordpress/posts.jsonl` и обновляет `website/src/data/blogArticles.json`.

## Сбор публичных данных

```bash
scraper/.venv/bin/nailsprofi-scrape
```

Результат по умолчанию сохраняется в `website/src/data/nailsprofi.json`. Скрипт должен обращаться только к публичным страницам и соблюдать ограничения сайта.

## Тесты

```bash
scraper/.venv/bin/pytest scraper/tests
```
