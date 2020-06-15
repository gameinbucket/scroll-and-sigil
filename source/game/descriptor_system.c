#include "descriptor_system.h"

void vulkan_descriptor_system_pool(vulkan_state *vk_state, struct vulkan_descriptor_system *system) {

    uint32_t size = system->image_count;

    VkDescriptorPoolSize pool_size_sampler = {0};
    pool_size_sampler.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    pool_size_sampler.descriptorCount = size;

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = 1;
    pool_info.pPoolSizes = &pool_size_sampler;
    pool_info.maxSets = size;

    if (vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &system->vk_descriptor_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Pool\n");
        exit(1);
    }
}

void vulkan_descriptor_system_layout(vulkan_state *vk_state, VkDescriptorSetLayout *vk_descriptor_set_layout) {

    VkDescriptorSetLayoutBinding sampler_layout_binding = {0};
    sampler_layout_binding.binding = 0;
    sampler_layout_binding.descriptorCount = 1;
    sampler_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    sampler_layout_binding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

    VkDescriptorSetLayoutCreateInfo layout_info = {0};
    layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    layout_info.bindingCount = 1;
    layout_info.pBindings = &sampler_layout_binding;

    if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, vk_descriptor_set_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
        exit(1);
    }
}

void vulkan_descriptor_system_create_sets(vulkan_state *vk_state, struct vulkan_descriptor_system *system) {

    uint32_t size = system->image_count;

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(size, sizeof(VkDescriptorSetLayout));

    for (uint32_t i = 0; i < size; i++) {
        memcpy(&descriptor_set_layouts[i], &system->vk_image_descriptor_set_layout, sizeof(VkDescriptorSetLayout));
    }

    VkDescriptorSetAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    alloc_info.descriptorPool = system->vk_descriptor_pool;
    alloc_info.descriptorSetCount = size;
    alloc_info.pSetLayouts = descriptor_set_layouts;

    system->vk_image_descriptor_sets = safe_calloc(size, sizeof(VkDescriptorSet));

    if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, system->vk_image_descriptor_sets) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Descriptor Sets\n");
        exit(1);
    }

    free(descriptor_set_layouts);
}

void vulkan_descriptor_system_update_set(vulkan_state *vk_state, struct vulkan_descriptor_system *system, uint32_t index) {

    VkDescriptorSet vk_descriptor_set = system->vk_image_descriptor_sets[index];

    VkDescriptorImageInfo image_info = {0};
    VkWriteDescriptorSet descriptor_write_sampler = {0};
    VkWriteDescriptorSet descriptor_writes = {0};

    struct vulkan_image *image = system->images[index];

    image_info.imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
    image_info.imageView = image->vk_texture_image_view;
    image_info.sampler = image->vk_texture_sampler;

    descriptor_write_sampler.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
    descriptor_write_sampler.dstSet = vk_descriptor_set;
    descriptor_write_sampler.dstBinding = 0;
    descriptor_write_sampler.dstArrayElement = 0;
    descriptor_write_sampler.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    descriptor_write_sampler.descriptorCount = 1;
    descriptor_write_sampler.pImageInfo = &image_info;

    descriptor_writes = descriptor_write_sampler;

    vkUpdateDescriptorSets(vk_state->vk_device, 1, &descriptor_writes, 0, NULL);
}

void vulkan_descriptor_system_update_sets(vulkan_state *vk_state, struct vulkan_descriptor_system *system) {

    uint32_t size = system->image_count;
    for (uint32_t i = 0; i < size; i++) {
        vulkan_descriptor_system_update_set(vk_state, system, i);
    }
}

void descriptor_system_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_descriptor_system *system) {

    system->swapchain_image_count = vk_base->swapchain->swapchain_image_count;

    vulkan_descriptor_system_layout(vk_state, &system->vk_image_descriptor_set_layout);
    vulkan_descriptor_system_pool(vk_state, system);
    vulkan_descriptor_system_create_sets(vk_state, system);
    vulkan_descriptor_system_update_sets(vk_state, system);
}
