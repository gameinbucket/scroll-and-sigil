#ifndef VULKAN_INSTANCE_H
#define VULKAN_INSTANCE_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan_state.h"

void initialize_vulkan_instance(SDL_Window *window, vulkan_state *vk_state);

#endif
