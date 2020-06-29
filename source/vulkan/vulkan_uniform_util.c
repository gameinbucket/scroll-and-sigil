#include "vulkan_uniform_util.h"

void vulkan_uniform_buffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniform_buffer *uniform_buffer) {

    uniform_buffer->count = count;

    uniform_buffer->mapped_memory = safe_calloc(count, sizeof(void *));
    uniform_buffer->vk_uniform_buffers = safe_calloc(count, sizeof(VkBuffer));
    uniform_buffer->vk_uniform_buffers_memory = safe_calloc(count, sizeof(VkDeviceMemory));

    VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT;
    VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;
    VkDeviceSize byte_size = uniform_buffer->size;

    uniform_buffer->dynamic_alignment = vuklan_calculate_dynamic_alignment(vk_state, uniform_buffer->size);

    for (uint32_t i = 0; i < count; i++) {
        vk_create_buffer(vk_state, byte_size, usage, properties, &uniform_buffer->vk_uniform_buffers[i], &uniform_buffer->vk_uniform_buffers_memory[i]);
        vulkan_map_memory(vk_state, uniform_buffer->vk_uniform_buffers_memory[i], uniform_buffer->size, &uniform_buffer->mapped_memory[i]);
    }
}

void vulkan_uniform_buffer_clean(vulkan_state *vk_state, struct vulkan_uniform_buffer *uniform_buffer) {

    for (uint32_t i = 0; i < uniform_buffer->count; i++) {
        vulkan_unmap_memory(vk_state, uniform_buffer->mapped_memory[i]);
        vkDestroyBuffer(vk_state->vk_device, uniform_buffer->vk_uniform_buffers[i], NULL);
        vkFreeMemory(vk_state->vk_device, uniform_buffer->vk_uniform_buffers_memory[i], NULL);
    }

    free(uniform_buffer->mapped_memory);
    free(uniform_buffer->vk_uniform_buffers);
    free(uniform_buffer->vk_uniform_buffers_memory);
}
