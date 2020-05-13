#!/bin/bash

if [ $(uname) = 'Darwin' ]; then
    lldb ./scroll-and-sigil
else
    gdb -ex run ./scroll-and-sigil
fi
