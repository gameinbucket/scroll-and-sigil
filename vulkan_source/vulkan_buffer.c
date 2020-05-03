#include "vulkan_buffer.h"

static uint32_t memory_type(vulkan_state *vk_state, uint32_t filter, VkMemoryPropertyFlags properties) {

    VkPhysicalDeviceMemoryProperties mem_properties;
    vkGetPhysicalDeviceMemoryProperties(vk_state->vk_physical, &mem_properties);

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

    VkMemoryRequirements mem_requirements;
    vkGetBufferMemoryRequirements(vk_state->vk_device, (*buffer), &mem_requirements);

    VkMemoryAllocateInfo mem_info = {0};
    mem_info.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
    mem_info.allocationSize = mem_requirements.size;
    mem_info.memoryTypeIndex = memory_type(vk_state, mem_requirements.memoryTypeBits, properties);

    if (vkAllocateMemory(vk_state->vk_device, &mem_info, NULL, buffer_memory) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Vertex Memory\n");
        exit(1);
    }

    vkBindBufferMemory(vk_state->vk_device, (*buffer), (*buffer_memory), 0);
}

void vk_copy_buffer(vulkan_state *vk_state, VkBuffer source, VkBuffer destination, VkDeviceSize size) {

    VkCommandBufferAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    alloc_info.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    alloc_info.commandPool = vk_state->vk_command_pool;
    alloc_info.commandBufferCount = 1;

    VkCommandBuffer command_buffer;
    vkAllocateCommandBuffers(vk_state->vk_device, &alloc_info, &command_buffer);

    VkCommandBufferBeginInfo beginInfo = {0};
    beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    beginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

    vkBeginCommandBuffer(command_buffer, &beginInfo);

    VkBufferCopy copy_region = {0};
    copy_region.size = size;

    vkCmdCopyBuffer(command_buffer, source, destination, 1, &copy_region);

    vkEndCommandBuffer(command_buffer);

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
    submit_info.pCommandBuffers = &command_buffer;
    submit_info.commandBufferCount = 1;

    vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, VK_NULL_HANDLE);
    vkQueueWaitIdle(vk_state->vk_graphics_queue);

    vkFreeCommandBuffers(vk_state->vk_device, vk_state->vk_command_pool, 1, &command_buffer);
}
