#ifndef VULKAN_FRAMEBUFFER_H
#define VULKAN_FRAMEBUFFER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/fileio.h"
#include "core/mem.h"

#include "vulkan_pipeline.h"
#include "vulkan_state.h"

void vk_create_framebuffers(vulkan_state *vk_state, struct vulkan_pipeline *pipeline);

#endif
