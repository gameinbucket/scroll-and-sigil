#!/bin/bash -eu
cd "$(dirname "$0")"

make -f wasm.mk
cd electron
npm start
cd $OLDPWD
