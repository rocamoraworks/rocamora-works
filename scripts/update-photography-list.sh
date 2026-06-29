#!/bin/zsh
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
photo_dir="$repo_root/Images/photography"
target="$repo_root/photography.js"
tmp_file="$(mktemp)"
photo_list="$(mktemp)"

cleanup() {
  rm -f "$tmp_file" "$photo_list"
}
trap cleanup EXIT

if [[ ! -d "$photo_dir" ]]; then
  echo "Missing folder: $photo_dir" >&2
  exit 1
fi

find "$photo_dir" -maxdepth 1 -type f \( \
  -iname "*.jpg" -o \
  -iname "*.jpeg" -o \
  -iname "*.png" -o \
  -iname "*.webp" -o \
  -iname "*.gif" \
\) -exec basename {} \; | sort -f > "$photo_list"

photo_count="$(wc -l < "$photo_list" | tr -d " ")"

awk -v photo_list="$photo_list" '
  BEGIN {
    replacing = 0
  }

  /^const PHOTO_FILES = \[/ {
    print "const PHOTO_FILES = ["
    while ((getline file < photo_list) > 0) {
      gsub(/\\/, "\\\\", file)
      gsub(/"/, "\\\"", file)
      print "  \"" file "\","
    }
    close(photo_list)
    print "];"
    replacing = 1
    next
  }

  replacing {
    if ($0 ~ /^];/) {
      replacing = 0
    }
    next
  }

  {
    print
  }
' "$target" > "$tmp_file"

mv "$tmp_file" "$target"
echo "Updated photography.js with $photo_count image file(s)."
