#include "vulkan_frame_buffer.h"

void vk_create_framebuffers(vulkan_state *vk_state, struct vulkan_base *vk_base) {

    uint32_t size = vk_base->swapchain->swapchain_image_count;

    vk_base->vk_framebuffers = safe_calloc(size, sizeof(VkFramebuffer));

    for (uint32_t i = 0; i < size; i++) {

        VkImageView attachments[2] = {vk_base->swapchain->swapchain_image_views[i], vk_base->depth.vk_depth_image_view};

        VkFramebufferCreateInfo framebuffer_info = {0};
        framebuffer_info.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
        framebuffer_info.renderPass = vk_base->vk_render_pass;
        framebuffer_info.attachmentCount = 2;
        framebuffer_info.pAttachments = attachments;
        framebuffer_info.width = vk_base->swapchain->swapchain_extent.width;
        framebuffer_info.height = vk_base->swapchain->swapchain_extent.height;
        framebuffer_info.layers = 1;

        if (vkCreateFramebuffer(vk_state->vk_device, &framebuffer_info, NULL, &vk_base->vk_framebuffers[i]) != VK_SUCCESS) {
            fprintf(stderr, "Error: Create Framebuffer\n");
            exit(1);
        }
    }
}
