#include "vulkan_uniform_util.h"

void vulkan_uniform_buffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniform_buffer *uniform_buffer) {

    uniform_buffer->count = count;
    uniform_buffer->vk_uniform_buffers = safe_calloc(count, sizeof(VkBuffer));
    uniform_buffer->vk_uniform_buffers_memory = safe_calloc(count, sizeof(VkDeviceMemory));

    VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT;
    VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;
    VkDeviceSize byte_size = uniform_buffer->size;

    for (uint32_t i = 0; i < count; i++) {
        vk_create_buffer(vk_state, byte_size, usage, properties, &uniform_buffer->vk_uniform_buffers[i], &uniform_buffer->vk_uniform_buffers_memory[i]);
    }
}

void vulkan_uniform_mem_copy(vulkan_state *vk_state, VkDeviceMemory vk_uniform_buffers_memory, void *uniforms, size_t size) {

    void *data;
    vkMapMemory(vk_state->vk_device, vk_uniform_buffers_memory, 0, size, 0, &data);
    memcpy(data, uniforms, size);
    vkUnmapMemory(vk_state->vk_device, vk_uniform_buffers_memory);
}
