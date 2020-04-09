#!/bin/sh -e

gcc \
-Wall \
-Wextra \
-Werror \
-pedantic \
-std=c11 \
-Isrc \
src/core/files.c \
src/core/mem.c \
src/core/slice.c \
src/core/string.c \
src/main.c \
-o \
out/scroll

./scroll
