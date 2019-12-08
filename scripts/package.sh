#!/usr/bin/env bash
cd resources/monaco/
yarn build
cd ../..
vsce package