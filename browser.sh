#!/bin/bash -eu
cd "$(dirname "$0")"

make -f wasm.mk
python3 -m http.server
