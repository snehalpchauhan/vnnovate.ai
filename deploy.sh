#!/usr/bin/env bash
#
# Deploy vnnovate.ai: commit + push → update server → build → restart PM2
#
# Usage:
#   ./deploy.sh "Your commit message"
#   ./deploy.sh --no-commit          # skip git commit/push (server-only update)
#   ./deploy.sh --push-only "msg"    # git only, no server
#
# Credentials (pick one):
#   - KEYS file in repo root (gitignored): ssh user@host + Pass : ...
#   - SSHPASS + DEPLOY_HOST / DEPLOY_USER env vars
#   - SSH key auth (no password)
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# --- defaults (override via env) ---
DEPLOY_HOST="${DEPLOY_HOST:-72.61.227.155}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/vnnovate.ai}"
PM2_APP="${PM2_APP:-vnnovate-web}"
APP_PORT="${APP_PORT:-3020}"
GIT_BRANCH="${GIT_BRANCH:-main}"
GIT_REMOTE="${GIT_REMOTE:-origin}"

SKIP_COMMIT=0
SKIP_SERVER=0
COMMIT_MSG=""

# --- parse args ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-commit)
      SKIP_COMMIT=1
      shift
      ;;
    --push-only)
      SKIP_SERVER=1
      shift
      ;;
    --server-only)
      SKIP_COMMIT=1
      shift
      ;;
    -h|--help)
      sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      COMMIT_MSG="$1"
      shift
      ;;
  esac
done

if [[ -z "$COMMIT_MSG" && "$SKIP_COMMIT" -eq 0 ]]; then
  COMMIT_MSG="Deploy $(date '+%Y-%m-%d %H:%M')"
fi

# --- load SSH from KEYS (never committed) ---
load_keys() {
  local keys_file="$ROOT_DIR/KEYS"
  [[ -f "$keys_file" ]] || return 0

  local ssh_line pass_line
  ssh_line="$(grep -E '^ssh ' "$keys_file" | head -1 || true)"
  pass_line="$(sed -n 's/^[Pp]ass[[:space:]]*:[[:space:]]*//p' "$keys_file" | head -1 | tr -d '\r' || true)"

  if [[ -n "$ssh_line" ]]; then
    # ssh root@72.61.227.155
    local target="${ssh_line#ssh }"
    if [[ "$target" == *@* ]]; then
      DEPLOY_USER="${target%%@*}"
      DEPLOY_HOST="${target#*@}"
    else
      DEPLOY_HOST="$target"
    fi
  fi

  if [[ -n "$pass_line" && -z "${SSHPASS:-}" ]]; then
    export SSHPASS="$pass_line"
  fi
}

load_keys

SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

ssh_cmd() {
  if [[ -n "${SSHPASS:-}" ]]; then
    if ! command -v sshpass >/dev/null 2>&1; then
      echo "error: sshpass not found. Install: brew install sshpass (or use SSH keys and unset SSHPASS)" >&2
      exit 1
    fi
    sshpass -e ssh -o StrictHostKeyChecking=accept-new "$SSH_TARGET" "$@"
  else
    ssh -o StrictHostKeyChecking=accept-new "$SSH_TARGET" "$@"
  fi
}

rsync_cmd() {
  local ssh_wrapper="ssh -o StrictHostKeyChecking=accept-new"
  if [[ -n "${SSHPASS:-}" ]]; then
    if ! command -v sshpass >/dev/null 2>&1; then
      echo "error: sshpass not found" >&2
      exit 1
    fi
    ssh_wrapper="sshpass -e ssh -o StrictHostKeyChecking=accept-new"
    export SSHPASS
  fi
  # shellcheck disable=SC2086
  rsync -avz --delete \
    --exclude node_modules \
    --exclude .next \
    --exclude model \
    --exclude .git \
    --exclude .cursor \
    --exclude .claude \
    --exclude KEYS \
    --exclude '.env*' \
    -e "$ssh_wrapper" \
    "$ROOT_DIR/" \
    "${SSH_TARGET}:${DEPLOY_PATH}/"
}

echo "==> Deploy target: ${SSH_TARGET}:${DEPLOY_PATH} (branch ${GIT_BRANCH})"

# --- 1. Git commit & push ---
if [[ "$SKIP_COMMIT" -eq 0 ]]; then
  echo "==> Git: staging changes..."
  if git diff --quiet && git diff --cached --quiet && [[ -z "$(git status -u --porcelain)" ]]; then
    echo "    No local changes to commit."
  else
    git add -A
    # Respect .gitignore; never stage KEYS
    git reset HEAD -- KEYS 2>/dev/null || true
    if git diff --cached --quiet; then
      echo "    Nothing staged after respecting .gitignore."
    else
      echo "==> Git: commit — ${COMMIT_MSG}"
      git commit -m "$COMMIT_MSG"
    fi
  fi

  echo "==> Git: push ${GIT_REMOTE}/${GIT_BRANCH}..."
  git push "${GIT_REMOTE}" "${GIT_BRANCH}"
else
  echo "==> Skipping git commit/push (--no-commit / --server-only)"
fi

if [[ "$SKIP_SERVER" -eq 1 ]]; then
  echo "==> Done (--push-only)."
  exit 0
fi

# --- 2. Update code on server ---
echo "==> Server: syncing code..."
if ssh_cmd "test -d '${DEPLOY_PATH}/.git'"; then
  echo "    Using git pull on server..."
  ssh_cmd "set -e
    cd '${DEPLOY_PATH}'
    git fetch '${GIT_REMOTE}'
    git checkout '${GIT_BRANCH}'
    git reset --hard '${GIT_REMOTE}/${GIT_BRANCH}'
  "
else
  echo "    No git repo on server — using rsync from local tree..."
  rsync_cmd
fi

# --- 3. Install, build, restart ---
echo "==> Server: npm ci && build..."
ssh_cmd "set -e
  cd '${DEPLOY_PATH}'
  npm ci
  npm run build
"

echo "==> Server: restart PM2 (${PM2_APP})..."
ssh_cmd "set -e
  cd '${DEPLOY_PATH}'
  if pm2 describe '${PM2_APP}' >/dev/null 2>&1; then
    pm2 restart '${PM2_APP}'
  else
    PORT='${APP_PORT}' pm2 start npm --name '${PM2_APP}' -- start -- -p '${APP_PORT}'
    pm2 save
  fi
  sleep 2
  curl -sI 'http://127.0.0.1:${APP_PORT}' | head -3 || true
  pm2 list | grep -E '${PM2_APP}|name' || pm2 list
"

echo ""
echo "==> Deploy complete."
echo "    Site: http://vnnovate.ai"
echo "    Logs: ssh ${SSH_TARGET} 'pm2 logs ${PM2_APP}'"
