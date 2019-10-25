#!/bin/bash

function build_worker {
  yarn parcel build ../../node_modules/monaco-editor/esm/vs/$1 --out-dir lib --out-file $2 --no-source-maps
}

build_worker editor/editor.worker.js monaco.editor.worker.js
build_worker language/json/json.worker.js monaco.json.worker.js
