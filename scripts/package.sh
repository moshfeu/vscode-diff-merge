#!/usr/bin/env bash
set -x
cd resources/monaco/
echo "<<yarn>>"
yarn
echo "<<yarn build>>"
yarn build
cd ../..
echo "<<vsce package>>"
vsce package