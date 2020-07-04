#include "vulkan_util.h"

void vulkan_map_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory, size_t size, void *mapped_memory) {
    vkMapMemory(vk_state->vk_device, vk_device_memory, 0, size, 0, mapped_memory);
}

void vulkan_unmap_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory) {
    vkUnmapMemory(vk_state->vk_device, vk_device_memory);
}

void vulkan_copy_memory(void *mapped_memory, void *data, size_t size) {
    memcpy(mapped_memory, data, size);
}

size_t vuklan_calculate_dynamic_alignment(vulkan_state *vk_state, size_t cpu_size) {

    size_t min = vk_state->vk_physical_device_properties.limits.minUniformBufferOffsetAlignment;
    size_t dynamic = cpu_size;

    if (min > 0) {
        dynamic = (dynamic + min - 1) & ~(min - 1);
    }

    return dynamic;
}
