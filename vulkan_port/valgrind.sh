#!/bin/bash

x="./scroll-and-sigil-vk"

if [ "$1" == "--full" ]; then
  valgrind --track-origins=yes --leak-check=full "$x"
else
  valgrind --track-origins=yes "$x"
fi

