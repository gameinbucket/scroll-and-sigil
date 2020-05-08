#!/bin/bash -eu

cd shaders

rm -f ./spv/*.spv

find -type f -print0 | while IFS= read -r -d '' file; do 
    name="$(basename "$file")"
    glslc "$file" -o "./spv/$name.spv"
done
