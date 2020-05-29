#ifndef SCREEN_QUAD_H
#define SCREEN_QUAD_H

#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"

#include "render/render.h"
#include "vulkan/vulkan_commands.h"
#include "vulkan/vulkan_renderbuffer.h"
#include "vulkan/vulkan_state.h"

void create_screen_quad(vulkan_state *vk_state, struct vulkan_renderbuffer *renderbuffer, uint32_t width, uint32_t height);

#endif
