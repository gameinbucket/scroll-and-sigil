#include "vulkan_buffer.h"

uint32_t vk_memory_type(vulkan_state *vk_state, uint32_t filter, VkMemoryPropertyFlags properties) {

    VkPhysicalDeviceMemoryProperties mem_properties = {0};
    vkGetPhysicalDeviceMemoryProperties(vk_state->vk_physical_device, &mem_properties);

    for (uint32_t i = 0; i < mem_properties.memoryTypeCount; i++) {
        if ((filter & (1 << i)) && (mem_properties.memoryTypes[i].propertyFlags & properties) == properties) {
            return i;
        }
    }

    fprintf(stderr, "Error: Failed to find suitable memory type\n");
    exit(1);
}

void vk_create_buffer(vulkan_state *vk_state, VkDeviceSize size, VkBufferUsageFlags usage, VkMemoryPropertyFlags properties, VkBuffer *buffer, VkDeviceMemory *buffer_memory) {

    VkBufferCreateInfo buffer_info = {0};
    buffer_info.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
    buffer_info.size = size;
    buffer_info.usage = usage;
    buffer_info.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

    if (vkCreateBuffer(vk_state->vk_device, &buffer_info, NULL, buffer) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Buffer\n");
        exit(1);
    }

    VkMemoryRequirements mem_requirements = {0};
    vkGetBufferMemoryRequirements(vk_state->vk_device, (*buffer), &mem_requirements);

    VkMemoryAllocateInfo mem_info = {0};
    mem_info.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
    mem_info.allocationSize = mem_requirements.size;
    mem_info.memoryTypeIndex = vk_memory_type(vk_state, mem_requirements.memoryTypeBits, properties);

    VK_RESULT_OK(vkAllocateMemory(vk_state->vk_device, &mem_info, NULL, buffer_memory));

    vkBindBufferMemory(vk_state->vk_device, (*buffer), (*buffer_memory), 0);
}

void vk_copy_buffer(vulkan_state *vk_state, VkCommandPool command_pool, VkBuffer source, VkBuffer destination, VkDeviceSize size) {

    VkCommandBuffer command_buffer = vk_begin_single_time_commands(vk_state, command_pool);

    VkBufferCopy copy_region = {0};
    copy_region.size = size;

    vkCmdCopyBuffer(command_buffer, source, destination, 1, &copy_region);

    vk_end_single_time_commands(vk_state, command_pool, command_buffer);
}
