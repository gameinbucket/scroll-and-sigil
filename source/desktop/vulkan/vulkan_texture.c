#include "vulkan_texture.h"

static void vk_create_texture_image_view(vulkan_state *vk_state, struct vulkan_image *image) {

    VkFormat format = VK_FORMAT_R8G8B8A8_SRGB;
    image->vk_texture_image_view = vk_create_image_view(vk_state, image->vk_texture_image, format, VK_IMAGE_ASPECT_COLOR_BIT);
}

static void vk_create_texture_image_sampler(vulkan_state *vk_state, struct vulkan_image *image, VkFilter filter, VkSamplerAddressMode mode) {

    VkSamplerCreateInfo sampler_info = {0};
    sampler_info.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
    sampler_info.magFilter = filter;
    sampler_info.minFilter = filter;
    sampler_info.addressModeU = mode;
    sampler_info.addressModeV = mode;
    sampler_info.addressModeW = mode;
    sampler_info.anisotropyEnable = VK_TRUE;
    sampler_info.maxAnisotropy = 16;
    sampler_info.borderColor = VK_BORDER_COLOR_INT_OPAQUE_BLACK;
    sampler_info.unnormalizedCoordinates = VK_FALSE;
    sampler_info.compareEnable = VK_FALSE;
    sampler_info.compareOp = VK_COMPARE_OP_ALWAYS;
    sampler_info.mipmapMode = VK_SAMPLER_MIPMAP_MODE_LINEAR;

    if (vkCreateSampler(vk_state->vk_device, &sampler_info, NULL, &image->vk_texture_sampler) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Sampler\n");
        exit(1);
    }
}

image_details create_vulkan_texture(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_image *image, char *path, VkFilter filter, VkSamplerAddressMode mode) {

    image_pixels *png = read_png_file(NULL, path);

    int width = png->width;
    int height = png->height;

    VkDeviceSize image_byte_size = width * height * 4;

    VkBuffer staging_buffer = {0};
    VkDeviceMemory staging_buffer_memory = {0};

    VkBufferUsageFlagBits staging_usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
    VkMemoryPropertyFlagBits staging_properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    vk_create_buffer(vk_state, image_byte_size, staging_usage, staging_properties, &staging_buffer, &staging_buffer_memory);

    void *data;
    vkMapMemory(vk_state->vk_device, staging_buffer_memory, 0, image_byte_size, 0, &data);
    memcpy(data, png->pixels, image_byte_size);
    vkUnmapMemory(vk_state->vk_device, staging_buffer_memory);

    struct vulkan_image_details details = {0};
    details.width = width;
    details.height = height;
    details.format = VK_FORMAT_R8G8B8A8_SRGB;
    details.tiling = VK_IMAGE_TILING_OPTIMAL;
    details.usage = VK_IMAGE_USAGE_TRANSFER_DST_BIT | VK_IMAGE_USAGE_SAMPLED_BIT;
    details.properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

    VkImage texture_image = {0};
    VkDeviceMemory texture_image_memory = {0};

    vk_create_image(vk_state, details, &texture_image, &texture_image_memory);

    vk_transition_image_layout(vk_state, command_pool, texture_image, VK_IMAGE_LAYOUT_UNDEFINED, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL);

    vk_copy_buffer_to_image(vk_state, command_pool, staging_buffer, texture_image, width, height);

    vk_transition_image_layout(vk_state, command_pool, texture_image, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);

    vkDestroyBuffer(vk_state->vk_device, staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, staging_buffer_memory, NULL);

    image->vk_texture_image = texture_image;
    image->vk_texture_image_memory = texture_image_memory;

    delete_image_pixels(png);

    vk_create_texture_image_view(vk_state, image);
    vk_create_texture_image_sampler(vk_state, image, filter, mode);

    return (image_details){
        .width = width,
        .height = height,
    };
}
