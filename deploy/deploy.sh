#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
SITE_ROOT="${SITE_ROOT:-/var/www/nailsprofi}"
SITE_URL="${SITE_URL:-}"

fail() {
	printf 'Ошибка: %s\n' "$*" >&2
	exit 1
}

usage() {
	cat <<'EOF'
Использование:
  DEPLOY_HOST=IP [SITE_URL=https://example.ru] ./deploy/deploy.sh publish
  DEPLOY_HOST=IP ./deploy/deploy.sh list
  DEPLOY_HOST=IP [SITE_URL=https://example.ru] ./deploy/deploy.sh rollback RELEASE
EOF
}

validate_config() {
	[[ "$DEPLOY_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || fail "задайте корректный DEPLOY_HOST"
	[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || fail "некорректный DEPLOY_USER"
	[[ "$DEPLOY_BRANCH" =~ ^[A-Za-z0-9._/-]+$ && "$DEPLOY_BRANCH" != *..* ]] || fail "некорректный DEPLOY_BRANCH"
	[[ "$SITE_ROOT" =~ ^/[A-Za-z0-9._/-]+$ && "$SITE_ROOT" != *..* ]] || fail "некорректный SITE_ROOT"
	if [[ -n "$SITE_URL" ]]; then
		[[ "$SITE_URL" == http://* || "$SITE_URL" == https://* ]] || fail "SITE_URL должен начинаться с http:// или https://"
		SITE_URL="${SITE_URL%/}"
	fi
}

require_command() {
	command -v "$1" >/dev/null || fail "не найдена команда $1"
}

smoke_test() {
	if [[ -z "$SITE_URL" ]]; then
		printf 'SITE_URL не задан: внешняя HTTP-проверка пропущена.\n'
		return 0
	fi

	local path expected actual
	while read -r path expected; do
		actual="$(curl --silent --show-error --location --output /dev/null \
			--connect-timeout 10 --max-time 30 --write-out '%{http_code}' \
			"$SITE_URL$path")" || return 1
		[[ "$actual" == "$expected" ]] || {
			printf 'Проверка %s: ожидался HTTP %s, получен %s.\n' "$path" "$expected" "$actual" >&2
			return 1
		}
	done <<'EOF'
/ 200
/services/ 200
/.nailsprofi-deploy-not-found 404
EOF
}

activate_release() {
	local release="$1"
	local target="$SITE_ROOT/releases/$release"
	local previous

	previous="$(ssh "$DEPLOY_USER@$DEPLOY_HOST" "readlink '$SITE_ROOT/current' 2>/dev/null || true")"
	ssh "$DEPLOY_USER@$DEPLOY_HOST" \
		"test -f '$target/index.html' && ln -sfn '$target' '$SITE_ROOT/current'"

	if smoke_test; then
		printf 'Активирована версия %s.\n' "$release"
		return 0
	fi

	if [[ "$previous" == "$SITE_ROOT/releases/"* ]]; then
		printf 'Проверка не прошла, возвращаю предыдущую версию.\n' >&2
		ssh "$DEPLOY_USER@$DEPLOY_HOST" \
			"test -f '$previous/index.html' && ln -sfn '$previous' '$SITE_ROOT/current'"
	else
		printf 'Проверка первой версии не прошла, снимаю её с публикации.\n' >&2
		ssh "$DEPLOY_USER@$DEPLOY_HOST" \
			"active=\$(readlink '$SITE_ROOT/current' 2>/dev/null || true); if [ \"\$active\" = '$target' ]; then unlink '$SITE_ROOT/current'; fi"
	fi
	return 1
}

publish() {
	require_command bun
	require_command curl
	require_command git
	require_command rsync
	require_command ssh

	cd "$REPO_ROOT"
	[[ -z "$(git status --porcelain)" ]] || fail "есть незакоммиченные изменения; сначала проверьте и сохраните их"
	[[ "$(git branch --show-current)" == "$DEPLOY_BRANCH" ]] || fail "публикация разрешена только из ветки $DEPLOY_BRANCH"

	git fetch --quiet origin "$DEPLOY_BRANCH"
	local commit remote_commit release remote_release
	commit="$(git rev-parse HEAD)"
	remote_commit="$(git rev-parse "origin/$DEPLOY_BRANCH")"
	[[ "$commit" == "$remote_commit" ]] || fail "локальный commit не совпадает с origin/$DEPLOY_BRANCH"

	bun install --frozen-lockfile
	bun run check
	[[ -f website/dist/index.html ]] || fail "сборка не создала website/dist/index.html"

	release="$(date -u +%Y%m%d%H%M%S)-${commit:0:12}"
	remote_release="$SITE_ROOT/releases/$release"

	ssh "$DEPLOY_USER@$DEPLOY_HOST" "mkdir -p '$remote_release'"
	rsync -rlptz --delete \
		website/dist/ "$DEPLOY_USER@$DEPLOY_HOST:$remote_release/"
	ssh "$DEPLOY_USER@$DEPLOY_HOST" \
		"find '$remote_release' -type d -exec chmod 755 {} + && find '$remote_release' -type f -exec chmod 644 {} +"

	activate_release "$release"
}

list_releases() {
	ssh "$DEPLOY_USER@$DEPLOY_HOST" \
		"find '$SITE_ROOT/releases' -mindepth 1 -maxdepth 1 -type d -printf '%f\\n' | sort -r"
}

rollback() {
	local release="${1:-}"
	[[ "$release" =~ ^[0-9]{14}-[0-9a-f]{12}$ ]] || fail "укажите имя версии из команды list"
	require_command curl
	require_command ssh
	activate_release "$release"
}

main() {
	case "${1:-}" in
		-h|--help|help) usage; return 0 ;;
	esac

	validate_config
	case "${1:-}" in
		publish) publish ;;
		list) list_releases ;;
		rollback) rollback "${2:-}" ;;
		*) usage; exit 1 ;;
	esac
}

main "$@"
