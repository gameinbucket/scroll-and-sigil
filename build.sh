#!/bin/bash -eu
cd "$(dirname "$0")"

cd build
cmake ..
cmake --build .
