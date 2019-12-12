#!/usr/bin/env bash
cd resources/monaco/
echo "<<yarn>>"
yarn
echo "<<yarn build>>"
yarn build
cd ../..
echo "<<vsce package>>"
vsce package