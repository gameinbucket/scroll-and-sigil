#!/bin/bash -eu
cd "$(dirname "$0")"

make -f wasm.mk
npm start
