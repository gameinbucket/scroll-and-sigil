#include "vulkan_framebuffer.h"

void vk_create_framebuffers(vulkan_state *vk_state) {

    VkFramebuffer *swapchain_framebuffers = safe_calloc(vk_state->swapchain_image_count, sizeof(VkFramebuffer));
}
