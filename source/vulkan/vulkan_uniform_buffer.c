#include "vulkan_uniform_buffer.h"

void vulkan_uniform_buffer_clean(vulkan_state *vk_state, struct vulkan_uniform_buffer *uniform_buffer) {

    for (uint32_t i = 0; i < uniform_buffer->count; i++) {
        vkDestroyBuffer(vk_state->vk_device, uniform_buffer->vk_uniform_buffers[i], NULL);
        vkFreeMemory(vk_state->vk_device, uniform_buffer->vk_uniform_buffers_memory[i], NULL);
    }

    free(uniform_buffer->vk_uniform_buffers);
    free(uniform_buffer->vk_uniform_buffers_memory);
}
