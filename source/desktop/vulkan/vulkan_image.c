#include "vulkan_texture.h"

struct vulkan_image_view_and_sample get_vulkan_image_view_and_sample(struct vulkan_image *image) {
    return (struct vulkan_image_view_and_sample){.view = image->vk_texture_image_view, .sample = image->vk_texture_sampler};
}

void vk_create_image(vulkan_state *vk_state, struct vulkan_image_details details, VkImage *image, VkDeviceMemory *image_memory) {

    VkImageCreateInfo image_info = {0};
    image_info.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
    image_info.imageType = VK_IMAGE_TYPE_2D;
    image_info.extent.width = details.width;
    image_info.extent.height = details.height;
    image_info.extent.depth = 1;
    image_info.mipLevels = 1;
    image_info.arrayLayers = 1;
    image_info.format = details.format;
    image_info.tiling = details.tiling;
    image_info.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    image_info.usage = details.usage;
    image_info.samples = VK_SAMPLE_COUNT_1_BIT;
    image_info.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

    if (vkCreateImage(vk_state->vk_device, &image_info, NULL, image) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Image\n");
        exit(1);
    }

    VkMemoryRequirements mem_requirements = {0};
    vkGetImageMemoryRequirements(vk_state->vk_device, *image, &mem_requirements);

    VkMemoryAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
    alloc_info.allocationSize = mem_requirements.size;
    alloc_info.memoryTypeIndex = vk_memory_type(vk_state, mem_requirements.memoryTypeBits, details.properties);

    if (vkAllocateMemory(vk_state->vk_device, &alloc_info, NULL, image_memory) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Memory\n");
        exit(1);
    }

    vkBindImageMemory(vk_state->vk_device, *image, *image_memory, 0);
}

void vk_transition_image_layout(vulkan_state *vk_state, VkCommandPool command_pool, VkImage image, VkImageLayout old_layout, VkImageLayout new_layout) {

    VkCommandBuffer command_buffer = vk_begin_single_time_commands(vk_state, command_pool);

    VkImageMemoryBarrier barrier = {0};
    barrier.sType = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER;
    barrier.oldLayout = old_layout;
    barrier.newLayout = new_layout;
    barrier.srcQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
    barrier.dstQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
    barrier.image = image;
    barrier.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
    barrier.subresourceRange.baseMipLevel = 0;
    barrier.subresourceRange.levelCount = 1;
    barrier.subresourceRange.baseArrayLayer = 0;
    barrier.subresourceRange.layerCount = 1;

    VkPipelineStageFlags source_stage = {0};
    VkPipelineStageFlags destination_stage = {0};

    if (old_layout == VK_IMAGE_LAYOUT_UNDEFINED && new_layout == VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL) {

        barrier.srcAccessMask = 0;
        barrier.dstAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;

        source_stage = VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT;
        destination_stage = VK_PIPELINE_STAGE_TRANSFER_BIT;

    } else if (old_layout == VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL && new_layout == VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL) {

        barrier.srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
        barrier.dstAccessMask = VK_ACCESS_SHADER_READ_BIT;

        source_stage = VK_PIPELINE_STAGE_TRANSFER_BIT;
        destination_stage = VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT;

    } else {
        fprintf(stderr, "Error: Unsupported layout transition\n");
        exit(1);
    }

    vkCmdPipelineBarrier(command_buffer, source_stage, destination_stage, 0, 0, NULL, 0, NULL, 1, &barrier);

    vk_end_single_time_commands(vk_state, command_pool, command_buffer);
}

void vk_copy_buffer_to_image(vulkan_state *vk_state, VkCommandPool command_pool, VkBuffer buffer, VkImage image, uint32_t width, uint32_t height) {

    VkCommandBuffer command_buffer = vk_begin_single_time_commands(vk_state, command_pool);

    VkBufferImageCopy region = {0};
    region.bufferOffset = 0;
    region.bufferRowLength = 0;
    region.bufferImageHeight = 0;
    region.imageSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
    region.imageSubresource.mipLevel = 0;
    region.imageSubresource.baseArrayLayer = 0;
    region.imageSubresource.layerCount = 1;
    region.imageOffset = (VkOffset3D){0, 0, 0};
    region.imageExtent = (VkExtent3D){width, height, 1};

    vkCmdCopyBufferToImage(command_buffer, buffer, image, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, 1, &region);

    vk_end_single_time_commands(vk_state, command_pool, command_buffer);
}

VkImageView vk_create_image_view(vulkan_state *vk_state, VkImage image, VkFormat format, VkImageAspectFlags aspect_flags) {

    VkImageViewCreateInfo info = {0};
    info.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
    info.image = image;
    info.viewType = VK_IMAGE_VIEW_TYPE_2D;
    info.format = format;
    info.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
    info.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
    info.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
    info.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
    info.subresourceRange.aspectMask = aspect_flags;
    info.subresourceRange.baseMipLevel = 0;
    info.subresourceRange.levelCount = 1;
    info.subresourceRange.baseArrayLayer = 0;
    info.subresourceRange.layerCount = 1;

    VkImageView view = {0};

    if (vkCreateImageView(vk_state->vk_device, &info, NULL, &view) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Image View\n");
        exit(1);
    }

    return view;
}

VkFormat vk_find_supported_image_format(vulkan_state *vk_state, VkFormat *candidates, int candidate_count, VkImageTiling tiling, VkFormatFeatureFlags features) {

    for (int i = 0; i < candidate_count; i++) {

        VkFormat format = candidates[i];

        VkFormatProperties properties = {0};
        vkGetPhysicalDeviceFormatProperties(vk_state->vk_physical_device, format, &properties);

        if (tiling == VK_IMAGE_TILING_LINEAR && (properties.linearTilingFeatures & features) == features) {
            return format;

        } else if (tiling == VK_IMAGE_TILING_OPTIMAL && (properties.optimalTilingFeatures & features) == features) {
            return format;
        }
    }

    fprintf(stderr, "Error: No supported format\n");
    exit(1);
}

bool vk_has_stencil_component(VkFormat format) {
    return format == VK_FORMAT_D32_SFLOAT_S8_UINT || format == VK_FORMAT_D24_UNORM_S8_UINT;
}

void delete_vulkan_image(VkDevice vk_device, struct vulkan_image *image) {

    vkDestroySampler(vk_device, image->vk_texture_sampler, NULL);
    vkDestroyImageView(vk_device, image->vk_texture_image_view, NULL);
    vkDestroyImage(vk_device, image->vk_texture_image, NULL);
    vkFreeMemory(vk_device, image->vk_texture_image_memory, NULL);
}
