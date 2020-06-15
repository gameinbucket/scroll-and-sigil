#ifndef VULKAN_FRAME_BUFFER_H
#define VULKAN_FRAME_BUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "common/fileio.h"
#include "common/mem.h"

#include "vulkan_base.h"
#include "vulkan_state.h"

void vk_create_framebuffers(vulkan_state *vk_state, struct vulkan_base *vk_base);

#endif
