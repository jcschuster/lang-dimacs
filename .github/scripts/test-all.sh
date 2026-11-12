#!/usr/bin/env bash
# Runs every check in the repository, keeps going past a failure, and ends with one
# `PASS name` or `FAIL name` line per check. Exits non-zero if any failed. Expects the
# devshell (`nix develop`):
#
#     .github/scripts/test-all.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

results=()
failed=0

check() {
  local name=$1
  shift
  echo "== $name"
  if "$@"; then
    results+=("PASS $name")
  else
    results+=("FAIL $name")
    failed=1
  fi
}

check "LICENSE and NOTICE copies match" bash -c \
  'cmp LICENSE packages/codemirror-lang-dimacs/LICENSE && cmp NOTICE packages/codemirror-lang-dimacs/NOTICE'
check "cadical agrees with the fixtures" .github/scripts/check-fixtures.sh
check "pnpm install" pnpm install --frozen-lockfile
check "pnpm build" pnpm -r run build
check "pnpm test" pnpm -r test

echo
printf '%s\n' "${results[@]}"
exit "$failed"
