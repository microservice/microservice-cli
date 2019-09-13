#!/bin/bash

# Navigate to repo root
cd $(dirname $0)/..

function build_package {
  yarn nexe packages/omg/lib/cli.js \
            -r packages/omg/package.json \
            -r packages/omg-ui/package.json \
            -r packages/omg-ui/lib/ \
            -r packages/omg-validate/package.json \
            -r packages/omg-validate/lib/ $@
}

OUTPUT_NAME="omg"
OUTPUT_NODE_VERSION="10.16.0"
OUTPUT_PLATFORMS="alpine-x64 alpine-x86 linux-x64 linux-x86 mac-x64 windows-x64 windows-x86"

rm -rf built/*
for PLATFORM in $OUTPUT_PLATFORMS; do
  OUTPUT_TARGET="$PLATFORM-$OUTPUT_NODE_VERSION"
  build_package --name $OUTPUT_NAME --target $OUTPUT_TARGET --output built/omg-$PLATFORM
done
