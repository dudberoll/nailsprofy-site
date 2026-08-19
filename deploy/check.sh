#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash -n "$SCRIPT_DIR/server-setup.sh"
bash -n "$SCRIPT_DIR/deploy.sh"

grep -Fq 'server_name __DOMAIN__ www.__DOMAIN__;' "$SCRIPT_DIR/nginx-site.conf.example"
grep -Fq 'try_files $uri $uri/ =404;' "$SCRIPT_DIR/nginx-site.conf.example"

if grep -Fq 'try_files $uri /index.html' "$SCRIPT_DIR/nginx-site.conf.example"; then
	printf 'Ошибка: SPA fallback недопустим для статических страниц Astro.\n' >&2
	exit 1
fi

printf 'Шаблоны deploy проверены.\n'
