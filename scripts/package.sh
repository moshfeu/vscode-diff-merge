#!/usr/bin/env bash
set -x
cd resources/monaco/
echo "<<yarn>>"
yarn
if [ $? -ne 0 ] ; then
  exit 125
fi
echo "<<yarn test:unit>>"
yarn test:unit
if [ $? -ne 0 ] ; then
  exit 125
fi
echo "<<yarn build>>"
yarn build
if [ $? -ne 0 ] ; then
  exit 125
fi
# No need. publish-vscode-extension does it.
# cd ../..
# echo "<<vsce package>>"
# yarn run vsce package
# if [ $? -ne 0 ] ; then
#   exit 125
# fi