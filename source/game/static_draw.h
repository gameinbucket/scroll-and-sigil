#ifndef STATIC_DRAW_H
#define STATIC_DRAW_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "core/mem.h"
#include "vulkan/vulkan_base.h"
#include "vulkan/vulkan_pipeline.h"

void static_draw_build_command_buffers(struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline);

#endif
