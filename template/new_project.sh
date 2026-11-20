#!/usr/bin/env bash
# Scaffold a new neon space explainer next to the other projects.
#   bash .claude/skills/neon-space-explainer/template/new_project.sh <name>
set -e
NAME=$1
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"   # the motiongraphics folder
TPL="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/$NAME"
[ -e "$DEST" ] && { echo "$DEST already exists"; exit 1; }
mkdir -p "$DEST"/{refs,public,renders,previews,contact-sheets}
cp -r "$TPL/src" "$TPL/scripts" "$TPL/tsconfig.json" "$TPL/remotion.config.ts" "$DEST/"
cat > "$DEST/package.json" <<JSON
{ "name": "$NAME", "version": "1.0.0", "private": true, "license": "UNLICENSED", "type": "module",
  "scripts": { "dev": "remotion studio", "lint": "tsc" } }
JSON
# shared node_modules (Remotion 4 + google-fonts + node-web-audio-api) via a junction — never `ln -s` (Git Bash copies dirs)
cmd //c mklink //J "$(cygpath -w "$DEST/node_modules")" "$(cygpath -w "$ROOT/propellerads-cinematic/node_modules")" >/dev/null
echo "created $DEST"
