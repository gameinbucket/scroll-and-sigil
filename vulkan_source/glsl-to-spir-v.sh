#!/bin/bash

rm *.spv

glslc triangle.vert -o tri_vert.spv
glslc triangle.frag -o tri_frag.spv
