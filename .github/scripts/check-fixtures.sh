#!/usr/bin/env bash
# Runs `cadical` over fixtures/: every valid/ input must be solved (exit 10 or 20), every
# solution/X.sol must be read against solution/X.cnf, and every invalid/ input must be
# rejected with an error (exit 1). Prints one line per file that disagrees.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)/fixtures" || exit 1

failed=0

expect() {
  local want=$1
  shift
  local status
  cadical -q "$@" >/dev/null 2>&1
  status=$?
  if ! [[ " $want " == *" $status "* ]]; then
    echo "cadical $* exited $status, expected $want"
    failed=1
  fi
}

for file in valid/*; do
  expect "10 20" "$file"
done
for file in solution/*.sol; do
  expect "10 20" -r "$file" "${file%.sol}.cnf"
done
for file in invalid/*; do
  expect 1 "$file"
done

exit "$failed"
