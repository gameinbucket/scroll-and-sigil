#ifndef VULKAN_FRAMEBUFFER_H
#define VULKAN_FRAMEBUFFER_H

#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "file.h"
#include "mem.h"
#include "vulkan_struct.h"

void vk_create_framebuffers(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer);

#endif
