#!/bin/bash

check=""

if [ "$2" == "--full" ]; then
  check="--leak-check=full"
fi

valgrind --track-origins=yes $check "$1"
