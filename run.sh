#!/bin/bash

trap 'if [[ $? -eq 139 ]]; then echo "segfault!"; fi' CHLD

./scroll-and-sigil
