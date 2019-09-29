#!/bin/bash

# Navigate to repo root
cd $(dirname $0)/..

if [ "$(which pkg)" = "" ]; then
  echo "zeit/pkg is not installed on your system or not in your \$PATH"
  echo "Try doing 'yarn global add pkg' and then re-run this script"
  exit 1
fi

function build_package {
  pkg package.json $@
}

OUTPUT_NAME="omg"
OUTPUT_NODE_VERSION="10"
OUTPUT_PLATFORMS="linux-x64 macos-x64 win-x64"

rm -rf built/*
for PLATFORM in $OUTPUT_PLATFORMS; do
  OUTPUT_TARGET="node$OUTPUT_NODE_VERSION-$PLATFORM"
  echo "Generating $OUTPUT_TARGET"
  build_package --target $OUTPUT_TARGET --output built/omg-$PLATFORM
done
