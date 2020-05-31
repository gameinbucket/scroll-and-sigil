#include "vulkan_uniformbuffer.h"

void vulkan_uniformbuffer_clean(vulkan_state *vk_state, struct vulkan_uniformbuffer *uniformbuffer) {

    for (uint32_t i = 0; i < uniformbuffer->count; i++) {
        vkDestroyBuffer(vk_state->vk_device, uniformbuffer->vk_uniform_buffers[i], NULL);
        vkFreeMemory(vk_state->vk_device, uniformbuffer->vk_uniform_buffers_memory[i], NULL);
    }

    free(uniformbuffer->vk_uniform_buffers);
    free(uniformbuffer->vk_uniform_buffers_memory);
}
