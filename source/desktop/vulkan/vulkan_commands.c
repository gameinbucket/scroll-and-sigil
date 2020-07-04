#include "vulkan_commands.h"

VkCommandBuffer vk_begin_single_time_commands(vulkan_state *vk_state, VkCommandPool vk_command_pool) {

    VkCommandBufferAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    alloc_info.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    alloc_info.commandPool = vk_command_pool;
    alloc_info.commandBufferCount = 1;

    VkCommandBuffer command_buffer = {0};

    if (vkAllocateCommandBuffers(vk_state->vk_device, &alloc_info, &command_buffer) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Command Buffers\n");
        exit(1);
    }

    VkCommandBufferBeginInfo begin_info = {0};
    begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    begin_info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

    if (vkBeginCommandBuffer(command_buffer, &begin_info) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
        exit(1);
    }

    return command_buffer;
}

void vk_end_single_time_commands(vulkan_state *vk_state, VkCommandPool vk_command_pool, VkCommandBuffer command_buffer) {

    vkEndCommandBuffer(command_buffer);

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
    submit_info.commandBufferCount = 1;
    submit_info.pCommandBuffers = &command_buffer;

    vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, VK_NULL_HANDLE);
    vkQueueWaitIdle(vk_state->vk_graphics_queue);

    vkFreeCommandBuffers(vk_state->vk_device, vk_command_pool, 1, &command_buffer);
}

void vk_create_command_pool(vulkan_state *vk_state, VkCommandPool *vk_command_pool) {

    VkCommandPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    pool_info.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
    pool_info.queueFamilyIndex = vk_state->graphics_family_index;

    if (vkCreateCommandPool(vk_state->vk_device, &pool_info, NULL, vk_command_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Command Pool\n");
        exit(1);
    }
}
