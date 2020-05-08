#include "vulkan_texture.h"

void vk_create_image(vulkan_state *vk_state, struct create_image_details details, VkImage *image, VkDeviceMemory *image_memory) {

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

    VkMemoryRequirements mem_requirements;
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

void vk_transition_image_layout(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, VkImage image, VkFormat format, VkImageLayout old_layout, VkImageLayout new_layout) {

    VkCommandBuffer command_buffer = vk_begin_single_time_commands(vk_state, vk_renderer);

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

    VkPipelineStageFlags source_stage;
    VkPipelineStageFlags destination_stage;

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

    vk_end_single_time_commands(vk_state, vk_renderer, command_buffer);
}

void vk_copy_buffer_to_image(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, VkBuffer buffer, VkImage image, uint32_t width, uint32_t height) {

    VkCommandBuffer command_buffer = vk_begin_single_time_commands(vk_state, vk_renderer);

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

    vk_end_single_time_commands(vk_state, vk_renderer, command_buffer);
}

void vk_create_texture_image(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer, char *path) {

    simple_image *png = read_png_file(NULL, path);

    int width = png->width;
    int height = png->height;

    VkDeviceSize image_byte_size = width * height * 4;

    VkBuffer staging_buffer;
    VkDeviceMemory staging_buffer_memory;

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, image_byte_size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, image_byte_size, 0, &data);
    memcpy(data, png->pixels, image_byte_size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    struct create_image_details image_details = {0};
    image_details.width = width;
    image_details.height = height;
    image_details.format = VK_FORMAT_R8G8B8A8_SRGB;
    image_details.tiling = VK_IMAGE_TILING_OPTIMAL;
    image_details.usage = VK_IMAGE_USAGE_TRANSFER_DST_BIT | VK_IMAGE_USAGE_SAMPLED_BIT;
    image_details.properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    VkImage texture_image;
    VkDeviceMemory texture_image_memory;

    vk_create_image(vk_state, image_details, &texture_image, &texture_image_memory);

    vk_transition_image_layout(vk_state, vk_renderer, texture_image, VK_FORMAT_R8G8B8A8_SRGB, VK_IMAGE_LAYOUT_UNDEFINED, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL);

    vk_copy_buffer_to_image(vk_state, vk_renderer, staging_buffer, texture_image, width, height);

    vk_transition_image_layout(vk_state, vk_renderer, texture_image, VK_FORMAT_R8G8B8A8_SRGB, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);

    vk_renderer->vk_texture_image = texture_image;
    vk_renderer->vk_texture_image_memory = texture_image_memory;

    simple_image_free(png);
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

    VkImageView view;

    if (vkCreateImageView(vk_state->vk_device, &info, NULL, &view) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Image View\n");
        exit(1);
    }

    return view;
}

void vk_create_texture_image_view(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    VkFormat format = VK_FORMAT_R8G8B8A8_SRGB;
    vk_renderer->vk_texture_image_view = vk_create_image_view(vk_state, vk_renderer->vk_texture_image, format, VK_IMAGE_ASPECT_COLOR_BIT);
}

void vk_create_texture_image_sampler(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    VkSamplerCreateInfo sampler_info = {0};
    sampler_info.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
    sampler_info.magFilter = VK_FILTER_LINEAR;
    sampler_info.minFilter = VK_FILTER_LINEAR;
    sampler_info.addressModeU = VK_SAMPLER_ADDRESS_MODE_REPEAT;
    sampler_info.addressModeV = VK_SAMPLER_ADDRESS_MODE_REPEAT;
    sampler_info.addressModeW = VK_SAMPLER_ADDRESS_MODE_REPEAT;
    sampler_info.anisotropyEnable = VK_TRUE;
    sampler_info.maxAnisotropy = 16;
    sampler_info.borderColor = VK_BORDER_COLOR_INT_OPAQUE_BLACK;
    sampler_info.unnormalizedCoordinates = VK_FALSE;
    sampler_info.compareEnable = VK_FALSE;
    sampler_info.compareOp = VK_COMPARE_OP_ALWAYS;
    sampler_info.mipmapMode = VK_SAMPLER_MIPMAP_MODE_LINEAR;

    if (vkCreateSampler(vk_state->vk_device, &sampler_info, NULL, &vk_renderer->vk_texture_sampler) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Sampler\n");
        exit(1);
    }
}

VkFormat vk_find_supported_image_format(vulkan_state *vk_state, VkFormat *candidates, int candidate_count, VkImageTiling tiling, VkFormatFeatureFlags features) {

    for (int i = 0; i < candidate_count; i++) {

        VkFormat format = candidates[i];

        VkFormatProperties properties;
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

VkFormat vk_find_depth_format(vulkan_state *vk_state) {

    VkFormat candidates[3] = {VK_FORMAT_D32_SFLOAT, VK_FORMAT_D32_SFLOAT_S8_UINT, VK_FORMAT_D24_UNORM_S8_UINT};

    return vk_find_supported_image_format(vk_state, candidates, 3, VK_IMAGE_TILING_OPTIMAL, VK_FORMAT_FEATURE_DEPTH_STENCIL_ATTACHMENT_BIT);
}

bool vk_has_stencil_component(VkFormat format) {
    return format == VK_FORMAT_D32_SFLOAT_S8_UINT || format == VK_FORMAT_D24_UNORM_S8_UINT;
}

void vk_choose_depth_format(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {
    vk_renderer->vk_depth_format = vk_find_depth_format(vk_state);
}

void vk_create_depth_resources(vulkan_state *vk_state, struct vulkan_renderer *vk_renderer) {

    struct create_image_details details = {0};
    details.width = vk_renderer->swapchain->swapchain_extent.width;
    details.height = vk_renderer->swapchain->swapchain_extent.height;
    details.format = vk_renderer->vk_depth_format;
    details.tiling = VK_IMAGE_TILING_OPTIMAL;
    details.usage = VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT;
    details.properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    vk_create_image(vk_state, details, &vk_renderer->vk_depth_image, &vk_renderer->vk_depth_image_memory);

    vk_renderer->vk_depth_image_view = vk_create_image_view(vk_state, vk_renderer->vk_depth_image, vk_renderer->vk_depth_format, VK_IMAGE_ASPECT_DEPTH_BIT);
}
