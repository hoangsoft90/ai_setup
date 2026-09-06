#!/usr/bin/env bash
# Decode fb_tk.json from the URL and write the value of a given key
# to ~/.config/manicode/credentials.json
#
# Usage:
#   ./fb_tk.sh <key>
#
# The file at the URL is a base64-encoded JSON object, e.g.:
#   { "hoangsoft90": { "default": { ... } }, ... }
# Running `./fb_tk.sh hoangsoft90` writes the JSON string of
# json["hoangsoft90"] into ~/.config/manicode/credentials.json
set -euo pipefail

URL="https://raw.githubusercontent.com/hoangsoft90/ai_setup/refs/heads/main/fb_tk.json"
OUT="${HOME}/.config/manicode/credentials.json"

KEY="${1:-}"
if [[ -z "$KEY" ]]; then
  echo "Usage: $0 <key>" >&2
  exit 1
fi

# Portable base64 decode: GNU uses -d, macOS uses -D
if echo "" | base64 -d >/dev/null 2>&1; then
  B64=(-d)
else
  B64=(-D)
fi

json="$(curl -fsSL "$URL" | tr -d '\n\r ' | base64 "${B64[@]}")" || {
  echo "Failed to fetch or decode $URL" >&2
  exit 1
}

value="$(jq -r --arg k "$KEY" '.[$k] // empty' <<<"$json")"
if [[ -z "$value" ]]; then
  echo "Key \"$KEY\" not found. Available keys: $(jq -r 'keys | join(", ")' <<<"$json")" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"
printf '%s\n' "$value" > "$OUT"
echo "Written $OUT"