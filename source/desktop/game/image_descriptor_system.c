#include "image_descriptor_system.h"

void image_descriptor_system_pool(vulkan_state *vk_state, image_descriptor_system *system) {

    uint32_t total = system->image_total;

    VkDescriptorPoolSize pool_size_sampler = {0};
    pool_size_sampler.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    pool_size_sampler.descriptorCount = total;

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = 1;
    pool_info.pPoolSizes = &pool_size_sampler;
    pool_info.maxSets = total;

    VK_RESULT_OK(vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &system->descriptor_pool));
}

void image_descriptor_system_layout(vulkan_state *vk_state, image_descriptor_system *system) {

    VkDescriptorSetLayoutBinding sampler_layout_binding = {0};
    sampler_layout_binding.binding = 0;
    sampler_layout_binding.descriptorCount = 1;
    sampler_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    sampler_layout_binding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

    VkDescriptorSetLayoutCreateInfo layout_info = {0};
    layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    layout_info.bindingCount = 1;
    layout_info.pBindings = &sampler_layout_binding;

    VK_RESULT_OK(vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &system->descriptor_layout));
}

void image_descriptor_system_create_descriptors(vulkan_state *vk_state, image_descriptor_system *system) {

    uint32_t total = system->image_total;

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(total, sizeof(VkDescriptorSetLayout));

    for (uint32_t i = 0; i < total; i++) {
        memcpy(&descriptor_set_layouts[i], &system->descriptor_layout, sizeof(VkDescriptorSetLayout));
    }

    VkDescriptorSetAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    alloc_info.descriptorPool = system->descriptor_pool;
    alloc_info.descriptorSetCount = total;
    alloc_info.pSetLayouts = descriptor_set_layouts;

    system->image_descriptors = safe_calloc(total, sizeof(VkDescriptorSet));

    VK_RESULT_OK(vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, system->image_descriptors));

    free(descriptor_set_layouts);
}

void image_descriptor_system_update_descriptors(vulkan_state *vk_state, image_descriptor_system *system) {

    uint32_t total = system->image_total;

    for (uint32_t i = 0; i < total; i++) {

        VkDescriptorSet vk_descriptor_set = system->image_descriptors[i];

        struct vulkan_image *image = &system->images[i];

        VkDescriptorImageInfo image_info = new_descriptor_image_info(image->vk_texture_sampler, image->vk_texture_image_view, VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);

        VkWriteDescriptorSet descriptor_write_sampler = {0};
        descriptor_write_sampler.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
        descriptor_write_sampler.dstSet = vk_descriptor_set;
        descriptor_write_sampler.dstBinding = 0;
        descriptor_write_sampler.dstArrayElement = 0;
        descriptor_write_sampler.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        descriptor_write_sampler.descriptorCount = 1;
        descriptor_write_sampler.pImageInfo = &image_info;

        VkWriteDescriptorSet descriptor_writes = descriptor_write_sampler;

        vkUpdateDescriptorSets(vk_state->vk_device, 1, &descriptor_writes, 0, NULL);
    }
}

image_descriptor_system *create_image_descriptor_system(vulkan_state *vk_state, uint32_t image_total, struct vulkan_image *images) {

    image_descriptor_system *system = safe_calloc(1, sizeof(image_descriptor_system));

    system->image_total = image_total;
    system->images = images;

    image_descriptor_system_layout(vk_state, system);
    image_descriptor_system_pool(vk_state, system);
    image_descriptor_system_create_descriptors(vk_state, system);
    image_descriptor_system_update_descriptors(vk_state, system);

    return system;
}

void delete_image_descriptor_system(vulkan_state *vk_state, image_descriptor_system *system) {

    vkDestroyDescriptorPool(vk_state->vk_device, system->descriptor_pool, NULL);
    vkDestroyDescriptorSetLayout(vk_state->vk_device, system->descriptor_layout, NULL);

    free(system->images);
    free(system->image_descriptors);
}

VkDescriptorSet image_descriptor_system_get(image_descriptor_system *system, uint32_t index) {
    return system->image_descriptors[index];
}
