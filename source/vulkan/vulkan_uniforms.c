#include "vulkan_uniforms.h"

void vulkan_uniformbuffer_initialize(vulkan_state *vk_state, uint32_t count, struct vulkan_uniformbuffer *uniformbuffer) {

    VkDeviceSize size = sizeof(struct uniform_buffer_object);

    uniformbuffer->count = count;
    uniformbuffer->vk_uniform_buffers = safe_calloc(count, sizeof(VkBuffer));
    uniformbuffer->vk_uniform_buffers_memory = safe_calloc(count, sizeof(VkDeviceMemory));

    VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT;
    VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    for (uint32_t i = 0; i < count; i++) {
        vk_create_buffer(vk_state, size, usage, properties, &uniformbuffer->vk_uniform_buffers[i], &uniformbuffer->vk_uniform_buffers_memory[i]);
    }
}

void vk_update_uniform_buffer(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t image_index, struct uniform_buffer_object ubo) {

    void *data;
    vkMapMemory(vk_state->vk_device, pipeline->uniforms->vk_uniform_buffers_memory[image_index], 0, sizeof(ubo), 0, &data);
    memcpy(data, &ubo, sizeof(ubo));
    vkUnmapMemory(vk_state->vk_device, pipeline->uniforms->vk_uniform_buffers_memory[image_index]);
}
