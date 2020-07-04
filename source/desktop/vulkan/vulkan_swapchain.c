#include "vulkan_swapchain.h"

struct vulkan_swapchain *create_vulkan_swapchain() {
    return safe_calloc(1, sizeof(struct vulkan_swapchain));
}

static VkSurfaceFormatKHR vk_choose_swap_surface_format(VkSurfaceFormatKHR *available, uint32_t count) {
    for (uint32_t i = 0; i < count; i++) {
        VkSurfaceFormatKHR this = available[i];
        if (this.format == VK_FORMAT_B8G8R8A8_SRGB && this.colorSpace == VK_COLOR_SPACE_SRGB_NONLINEAR_KHR) {
            return this;
        }
    }
    return available[0];
}

static VkPresentModeKHR vk_choose_swap_present_mode(VkPresentModeKHR *available, uint32_t count) {
    const bool mailbox = false;
    const bool immediate = true;

    if (mailbox) {
        for (uint32_t i = 0; i < count; i++) {
            VkPresentModeKHR this = available[i];
            if (this == VK_PRESENT_MODE_MAILBOX_KHR) {
                return this;
            }
        }
    }

    if (immediate) {
        return VK_PRESENT_MODE_IMMEDIATE_KHR;
    }

    return VK_PRESENT_MODE_FIFO_KHR;
}

static VkExtent2D vk_choose_swap_extent(VkSurfaceCapabilitiesKHR capabilities, uint32_t width, uint32_t height) {

    if (capabilities.currentExtent.width != UINT32_MAX) {
        return capabilities.currentExtent;
    }

    VkExtent2D extent = {0};

    extent.width = MIN(capabilities.maxImageExtent.width, width);
    extent.height = MIN(capabilities.maxImageExtent.height, height);

    extent.width = MAX(capabilities.minImageExtent.width, extent.width);
    extent.height = MAX(capabilities.minImageExtent.height, extent.height);

    return extent;
}

void vulkan_swapchain_clean(vulkan_state *vk_state, struct vulkan_swapchain *swapchain) {

    for (uint32_t i = 0; i < swapchain->swapchain_image_count; i++) {
        vkDestroyImageView(vk_state->vk_device, swapchain->swapchain_image_views[i], NULL);
    }

    free(swapchain->swapchain_images);
    free(swapchain->swapchain_image_views);

    vkDestroySwapchainKHR(vk_state->vk_device, swapchain->vk_swapchain, NULL);
}

void vulkan_swapchain_initialize(vulkan_state *vk_state, struct vulkan_swapchain *swapchain, uint32_t width, uint32_t height) {

    struct swapchain_support_details swapchain_details = vk_query_swapchain_support(vk_state, vk_state->vk_physical_device);

    VkSurfaceFormatKHR surface_format = vk_choose_swap_surface_format(swapchain_details.formats, swapchain_details.format_count);
    VkPresentModeKHR present_mode = vk_choose_swap_present_mode(swapchain_details.present_modes, swapchain_details.present_mode_count);
    VkExtent2D extent = vk_choose_swap_extent(swapchain_details.capabilities, width, height);

    swapchain->swapchain_image_format = surface_format.format;
    swapchain->swapchain_extent = extent;

    uint32_t swapchain_image_count = swapchain_details.capabilities.minImageCount + 1;

    uint32_t swapchain_max_image_count = swapchain_details.capabilities.maxImageCount;

    if (swapchain_max_image_count > 0) {
        if (swapchain_image_count > swapchain_max_image_count) {
            swapchain_image_count = swapchain_max_image_count;
        }
    }

    swapchain->swapchain_image_count = swapchain_image_count;

    VkSwapchainCreateInfoKHR vk_swapchain_info = {0};
    vk_swapchain_info.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
    vk_swapchain_info.surface = vk_state->vk_surface;
    vk_swapchain_info.minImageCount = swapchain_image_count;
    vk_swapchain_info.imageFormat = surface_format.format;
    vk_swapchain_info.imageColorSpace = surface_format.colorSpace;
    vk_swapchain_info.imageExtent = extent;
    vk_swapchain_info.imageArrayLayers = 1;
    vk_swapchain_info.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;

    uint32_t unique_queue_families[2] = {vk_state->graphics_family_index, vk_state->present_family_index};

    if (vk_state->graphics_family_index != vk_state->present_family_index) {
        vk_swapchain_info.imageSharingMode = VK_SHARING_MODE_CONCURRENT;
        vk_swapchain_info.queueFamilyIndexCount = 2;
        vk_swapchain_info.pQueueFamilyIndices = unique_queue_families;
    } else {
        vk_swapchain_info.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
    }

    vk_swapchain_info.preTransform = swapchain_details.capabilities.currentTransform;
    vk_swapchain_info.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
    vk_swapchain_info.presentMode = present_mode;
    vk_swapchain_info.clipped = VK_TRUE;
    vk_swapchain_info.oldSwapchain = VK_NULL_HANDLE;

    if (vkCreateSwapchainKHR(vk_state->vk_device, &vk_swapchain_info, NULL, &swapchain->vk_swapchain) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Swapchain\n");
        exit(1);
    }

    vkGetSwapchainImagesKHR(vk_state->vk_device, swapchain->vk_swapchain, &swapchain_image_count, NULL);

    swapchain->swapchain_images = safe_calloc(swapchain_image_count, sizeof(VkImage));

    vkGetSwapchainImagesKHR(vk_state->vk_device, swapchain->vk_swapchain, &swapchain_image_count, swapchain->swapchain_images);

    free_swapchain_support_details(&swapchain_details);
}

void vk_create_swapchain_image_views(vulkan_state *vk_state, struct vulkan_swapchain *swapchain) {

    uint32_t count = swapchain->swapchain_image_count;

    VkFormat format = swapchain->swapchain_image_format;

    swapchain->swapchain_image_views = safe_calloc(count, sizeof(VkImageView));

    for (uint32_t i = 0; i < count; i++) {
        swapchain->swapchain_image_views[i] = vk_create_image_view(vk_state, swapchain->swapchain_images[i], format, VK_IMAGE_ASPECT_COLOR_BIT);
    }
}
