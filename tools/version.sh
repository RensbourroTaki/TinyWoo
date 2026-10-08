#!/bin/sh
# Schreibt version.js neu: Zeitstempel + Liste der Spiel-Module (fuer die Import-Map in index.html).
# Laeuft automatisch als git pre-commit Hook (.git/hooks/pre-commit ruft dieses Skript auf).
cd "$(git rev-parse --show-toplevel)" || exit 1
V=$(date -u +%Y%m%d%H%M%S)
FILES=$(find game -name '*.js' -not -path 'game/tools/*' | sort | sed "s/.*/'&'/" | paste -sd, -)
printf "// Automatisch erzeugt von tools/version.sh beim Commit. Nicht von Hand bearbeiten.\nwindow.TW_V = '%s';\nwindow.TW_GAME = [%s];\n" "$V" "$FILES" > version.js
git add version.js
