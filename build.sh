#!/bin/sh
# Build dist/legendary-sheet-theme-litm.zip (the folder Foundry installs).
set -e
cd "$(dirname "$0")"
rm -rf dist/legendary-sheet-theme-litm dist/legendary-sheet-theme-litm.zip
mkdir -p dist/legendary-sheet-theme-litm
cp -r module.json LICENSE README.md scripts styles fonts lang dist/legendary-sheet-theme-litm/
(cd dist && zip -qr legendary-sheet-theme-litm.zip legendary-sheet-theme-litm && rm -rf legendary-sheet-theme-litm)
echo dist/legendary-sheet-theme-litm.zip
