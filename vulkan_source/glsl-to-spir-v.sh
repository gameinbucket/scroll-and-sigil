#!/bin/bash

rm *.spv

glslc 3d.vert -o 3d.vert.spv
glslc 3d.frag -o 3d.frag.spv

glslc 2d.vert -o 2d.vert.spv
glslc 2d.frag -o 2d.frag.spv
