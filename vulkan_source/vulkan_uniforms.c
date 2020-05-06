#include "vulkan_uniforms.h"

void vk_create_descriptor_set_layout(vulkan_state *vk_state) {

    VkDescriptorSetLayoutBinding ubo_layout_binding = {0};
    ubo_layout_binding.binding = 0;
    ubo_layout_binding.descriptorCount = 1;
    ubo_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    ubo_layout_binding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;

    VkDescriptorSetLayoutBinding sampler_layout_binding = {0};
    sampler_layout_binding.binding = 1;
    sampler_layout_binding.descriptorCount = 1;
    sampler_layout_binding.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    sampler_layout_binding.stageFlags = VK_SHADER_STAGE_FRAGMENT_BIT;

    VkDescriptorSetLayoutBinding bindings[2] = {ubo_layout_binding, sampler_layout_binding};

    VkDescriptorSetLayoutCreateInfo layout_info = {0};
    layout_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    layout_info.bindingCount = 2;
    layout_info.pBindings = bindings;

    if (vkCreateDescriptorSetLayout(vk_state->vk_device, &layout_info, NULL, &vk_state->vk_descriptor_set_layout) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Set Layout\n");
        exit(1);
    }
}

void vk_create_uniform_buffers(vulkan_state *vk_state) {

    VkDeviceSize size = sizeof(struct uniform_buffer_object);

    uint32_t count = vk_state->swapchain_image_count;

    vk_state->vk_uniform_buffers = safe_calloc(count, sizeof(VkBuffer));
    vk_state->vk_uniform_buffers_memory = safe_calloc(count, sizeof(VkDeviceMemory));

    VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT;
    VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT;

    for (uint32_t i = 0; i < count; i++) {
        vk_create_buffer(vk_state, size, usage, properties, &vk_state->vk_uniform_buffers[i], &vk_state->vk_uniform_buffers_memory[i]);
    }
}

void vk_update_uniform_buffer(vulkan_state *vk_state, uint32_t current_image, struct uniform_buffer_object ubo) {

    void *data;
    vkMapMemory(vk_state->vk_device, vk_state->vk_uniform_buffers_memory[current_image], 0, sizeof(ubo), 0, &data);
    memcpy(data, &ubo, sizeof(ubo));
    vkUnmapMemory(vk_state->vk_device, vk_state->vk_uniform_buffers_memory[current_image]);
}

void vk_create_descriptor_pool(vulkan_state *vk_state) {

    uint32_t size = vk_state->swapchain_image_count;

    VkDescriptorPoolSize pool_size_uniform = {0};
    pool_size_uniform.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    pool_size_uniform.descriptorCount = size;

    VkDescriptorPoolSize pool_size_samppler = {0};
    pool_size_samppler.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    pool_size_samppler.descriptorCount = size;

    VkDescriptorPoolSize pool_sizes[2] = {pool_size_uniform, pool_size_samppler};

    VkDescriptorPoolCreateInfo pool_info = {0};
    pool_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    pool_info.poolSizeCount = 2;
    pool_info.pPoolSizes = pool_sizes;
    pool_info.maxSets = size;

    if (vkCreateDescriptorPool(vk_state->vk_device, &pool_info, NULL, &vk_state->vk_descriptor_pool) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Create Descriptor Pool\n");
        exit(1);
    }
}

void vk_create_descriptor_sets(vulkan_state *vk_state) {

    uint32_t size = vk_state->swapchain_image_count;

    VkDescriptorSetLayout *descriptor_set_layouts = safe_calloc(size, sizeof(VkDescriptorSetLayout));

    for (uint32_t i = 0; i < size; i++) {
        memcpy(&descriptor_set_layouts[i], &vk_state->vk_descriptor_set_layout, sizeof(VkDescriptorSetLayout));
    }

    VkDescriptorSetAllocateInfo alloc_info = {0};
    alloc_info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
    alloc_info.descriptorPool = vk_state->vk_descriptor_pool;
    alloc_info.descriptorSetCount = size;
    alloc_info.pSetLayouts = descriptor_set_layouts;

    vk_state->vk_descriptor_sets = safe_calloc(size, sizeof(VkDescriptorSet));

    if (vkAllocateDescriptorSets(vk_state->vk_device, &alloc_info, vk_state->vk_descriptor_sets) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan  Allocate Descriptor Sets\n");
        exit(1);
    }

    free(descriptor_set_layouts);

    for (uint32_t i = 0; i < size; i++) {

        VkDescriptorBufferInfo buffer_info = {0};
        buffer_info.buffer = vk_state->vk_uniform_buffers[i];
        buffer_info.offset = 0;
        buffer_info.range = sizeof(struct uniform_buffer_object);

        VkDescriptorImageInfo image_info = {0};
        image_info.imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
        image_info.imageView = vk_state->vk_texture_image_view;
        image_info.sampler = vk_state->vk_texture_sampler;

        VkWriteDescriptorSet descriptor_write_uniform = {0};
        descriptor_write_uniform.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
        descriptor_write_uniform.dstSet = vk_state->vk_descriptor_sets[i];
        descriptor_write_uniform.dstBinding = 0;
        descriptor_write_uniform.dstArrayElement = 0;
        descriptor_write_uniform.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        descriptor_write_uniform.descriptorCount = 1;
        descriptor_write_uniform.pBufferInfo = &buffer_info;

        VkWriteDescriptorSet descriptor_write_sampler = {0};
        descriptor_write_sampler.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
        descriptor_write_sampler.dstSet = vk_state->vk_descriptor_sets[i];
        descriptor_write_sampler.dstBinding = 1;
        descriptor_write_sampler.dstArrayElement = 0;
        descriptor_write_sampler.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        descriptor_write_sampler.descriptorCount = 1;
        descriptor_write_sampler.pImageInfo = &image_info;

        VkWriteDescriptorSet descriptor_writes[2] = {descriptor_write_uniform, descriptor_write_sampler};

        vkUpdateDescriptorSets(vk_state->vk_device, 2, descriptor_writes, 0, NULL);
    }
}
