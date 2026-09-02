#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash -n "$SCRIPT_DIR/server-setup.sh"
bash -n "$SCRIPT_DIR/deploy.sh"

grep -Fq 'server_name __DOMAIN__ www.__DOMAIN__;' "$SCRIPT_DIR/nginx-site.conf.example"
grep -Fq 'try_files $uri $uri/ =404;' "$SCRIPT_DIR/nginx-site.conf.example"
grep -Fq 'map_hash_max_size 4096;' "$SCRIPT_DIR/nginx-site.conf.example"
grep -Fq 'map_hash_bucket_size 128;' "$SCRIPT_DIR/nginx-site.conf.example"
grep -Fq 'include /etc/nginx/nailsprofi-legacy-redirects.map;' "$SCRIPT_DIR/nginx-site.conf.example"
grep -Fq 'return 301 $nailsprofi_legacy_redirect$is_args$args;' "$SCRIPT_DIR/nginx-site.conf.example"

REDIRECT_COUNT="$(grep -Ec '^"/[^" ]+" "/blog/[^" ]+";$' "$SCRIPT_DIR/legacy-redirects.map")"
if [[ "$REDIRECT_COUNT" -ne 886 ]]; then
	printf 'Ошибка: ожидалось 886 готовых редиректов, найдено %s.\n' "$REDIRECT_COUNT" >&2
	exit 1
fi

if grep -Fq 'try_files $uri /index.html' "$SCRIPT_DIR/nginx-site.conf.example"; then
	printf 'Ошибка: SPA fallback недопустим для статических страниц Astro.\n' >&2
	exit 1
fi

printf 'Шаблоны deploy проверены.\n'
