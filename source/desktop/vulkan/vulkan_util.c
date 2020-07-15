#include "vulkan_util.h"

void vulkan_map_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory, size_t size, void *mapped_memory) {
    vkMapMemory(vk_state->vk_device, vk_device_memory, 0, size, 0, mapped_memory);
}

void vulkan_unmap_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory) {
    vkUnmapMemory(vk_state->vk_device, vk_device_memory);
}

void vulkan_copy_memory(void *mapped_memory, void *data, size_t size) {
    memcpy(mapped_memory, data, size);
}

size_t vuklan_calculate_dynamic_alignment(vulkan_state *vk_state, size_t cpu_size) {

    size_t min = vk_state->vk_physical_device_properties.limits.minUniformBufferOffsetAlignment;
    size_t dynamic = cpu_size;

    if (min > 0) {
        dynamic = (dynamic + min - 1) & ~(min - 1);
    }

    return dynamic;
}

VkDescriptorImageInfo new_descriptor_image_info(VkSampler sampler, VkImageView view, VkImageLayout layout) {
    VkDescriptorImageInfo info = {0};
    info.sampler = sampler;
    info.imageView = view;
    info.imageLayout = layout;
    return info;
}

VkWriteDescriptorSet new_image_descriptor_writer(VkDescriptorSet descriptor, VkDescriptorType type, uint32_t binding, VkDescriptorImageInfo *image_info, uint32_t descriptor_count) {
    VkWriteDescriptorSet write = {0};
    write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
    write.dstSet = descriptor;
    write.descriptorType = type;
    write.dstBinding = binding;
    write.pImageInfo = image_info;
    write.descriptorCount = descriptor_count;
    return write;
}

VkWriteDescriptorSet new_buffer_descriptor_writer(VkDescriptorSet descriptor, VkDescriptorType type, uint32_t binding, VkDescriptorBufferInfo *buffer_info, uint32_t descriptor_count) {
    VkWriteDescriptorSet write = {0};
    write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
    write.dstSet = descriptor;
    write.descriptorType = type;
    write.dstBinding = binding;
    write.pBufferInfo = buffer_info;
    write.descriptorCount = descriptor_count;
    return write;
}

VkDescriptorSetLayoutBinding new_descriptor_set_layout_binding(VkDescriptorType type, VkShaderStageFlags flags, uint32_t binding, uint32_t descriptor_count) {
    VkDescriptorSetLayoutBinding layout = {0};
    layout.descriptorType = type;
    layout.stageFlags = flags;
    layout.binding = binding;
    layout.descriptorCount = descriptor_count;
    return layout;
}

VkDescriptorSetLayoutCreateInfo new_descriptor_set_layout_create_info(const VkDescriptorSetLayoutBinding *bindings, uint32_t binding_count) {
    VkDescriptorSetLayoutCreateInfo info = {0};
    info.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
    info.pBindings = bindings;
    info.bindingCount = binding_count;
    return info;
}
