#!/bin/bash

if [ $(uname) = 'Darwin' ]; then
    lldb ./scroll-and-sigil
else
    gdb ./scroll-and-sigil
fi
