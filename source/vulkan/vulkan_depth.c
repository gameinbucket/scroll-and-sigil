#include "vulkan_depth.h"

static VkFormat vk_find_depth_format(vulkan_state *vk_state) {

    VkFormat candidates[3] = {VK_FORMAT_D32_SFLOAT, VK_FORMAT_D32_SFLOAT_S8_UINT, VK_FORMAT_D24_UNORM_S8_UINT};
    return vk_find_supported_image_format(vk_state, candidates, 3, VK_IMAGE_TILING_OPTIMAL, VK_FORMAT_FEATURE_DEPTH_STENCIL_ATTACHMENT_BIT);
}

void vk_choose_depth_format(vulkan_state *vk_state, struct vulkan_depth *depth) {

    depth->vk_depth_format = vk_find_depth_format(vk_state);
}

void vk_create_depth_resources(vulkan_state *vk_state, struct vulkan_depth *depth) {

    struct vulkan_image_details details = {0};
    details.width = depth->width;
    details.height = depth->height;
    details.format = depth->vk_depth_format;
    details.tiling = VK_IMAGE_TILING_OPTIMAL;
    details.usage = VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT;
    details.properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_image(vk_state, details, &depth->vk_depth_image, &depth->vk_depth_image_memory);

    VkImageAspectFlags flags = VK_IMAGE_ASPECT_DEPTH_BIT;

    depth->vk_depth_image_view = vk_create_image_view(vk_state, depth->vk_depth_image, depth->vk_depth_format, flags);
}

void delete_vulkan_depth(VkDevice vk_device, struct vulkan_depth *depth) {

    vkDestroyImageView(vk_device, depth->vk_depth_image_view, NULL);
    vkDestroyImage(vk_device, depth->vk_depth_image, NULL);
    vkFreeMemory(vk_device, depth->vk_depth_image_memory, NULL);
}
