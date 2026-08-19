#!/usr/bin/env bash

set -Eeuo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
SITE_ROOT="${SITE_ROOT:-/var/www/nailsprofi}"
DEPLOY_PUBLIC_KEY="${DEPLOY_PUBLIC_KEY:-}"

fail() {
	printf 'Ошибка: %s\n' "$*" >&2
	exit 1
}

[[ "$(id -u)" -eq 0 ]] || fail "запустите скрипт от root"
[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || fail "некорректный DEPLOY_USER"
[[ "$SITE_ROOT" =~ ^/[A-Za-z0-9._/-]+$ && "$SITE_ROOT" != *..* ]] || fail "некорректный SITE_ROOT"
[[ "$DEPLOY_PUBLIC_KEY" == ssh-*\ * || "$DEPLOY_PUBLIC_KEY" == ecdsa-*\ * ]] || fail "задайте DEPLOY_PUBLIC_KEY"
command -v apt-get >/dev/null || fail "скрипт рассчитан на Ubuntu/Debian с apt-get"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx rsync curl ufw certbot python3-certbot-nginx

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
	useradd --create-home --user-group --shell /bin/bash "$DEPLOY_USER"
fi

DEPLOY_GROUP="$(id -gn "$DEPLOY_USER")"
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
[[ -n "$DEPLOY_HOME" ]] || fail "не удалось определить домашний каталог $DEPLOY_USER"

install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
if ! grep -qxF "$DEPLOY_PUBLIC_KEY" "$DEPLOY_HOME/.ssh/authorized_keys"; then
	printf '%s\n' "$DEPLOY_PUBLIC_KEY" >> "$DEPLOY_HOME/.ssh/authorized_keys"
fi
chown "$DEPLOY_USER:$DEPLOY_GROUP" "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"

install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_ROOT"
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_ROOT/releases"

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

systemctl enable --now nginx

printf '\nСервер подготовлен. Следующие шаги:\n'
printf '1. В новом окне проверьте: ssh %s@IP_СЕРВЕРА\n' "$DEPLOY_USER"
printf '2. Установите конфигурацию Nginx из deploy/nginx-site.conf.example.\n'
printf '3. Проверьте nginx -t и только затем публикуйте первую версию.\n'
