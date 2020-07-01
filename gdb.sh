#!/bin/bash

if [ $(uname) = 'Darwin' ]; then
    lldb "$1"
else
    gdb -ex run "$1"
fi
