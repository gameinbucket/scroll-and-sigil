cmake_minimum_required(VERSION 3.9)

project(scroll-and-sigil)

include_directories(
    source/shared
    source/desktop
)

file(GLOB SOURCE_SHARED source/shared/**/*.c source/shared/**/*.h)
file(GLOB SOURCE_DESKTOP source/desktop/**/*.c source/desktop/**/*.h)

add_executable(scroll-and-sigil ${SOURCE_SHARED} ${SOURCE_DESKTOP})
