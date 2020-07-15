#ifndef VULKAN_UTIL_H
#define VULKAN_UTIL_H

#include <inttypes.h>
#include <stdalign.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "vulkan/vulkan_state.h"

void vulkan_map_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory, size_t size, void *mapped_memory);
void vulkan_unmap_memory(vulkan_state *vk_state, VkDeviceMemory vk_device_memory);
void vulkan_copy_memory(void *mapped_memory, void *data, size_t size);
size_t vuklan_calculate_dynamic_alignment(vulkan_state *vk_state, size_t cpu_size);
VkDescriptorImageInfo new_descriptor_image_info(VkSampler sampler, VkImageView view, VkImageLayout layout);
VkWriteDescriptorSet new_image_descriptor_writer(VkDescriptorSet descriptor, VkDescriptorType type, uint32_t binding, VkDescriptorImageInfo *image_info, uint32_t descriptor_count);
VkWriteDescriptorSet new_buffer_descriptor_writer(VkDescriptorSet descriptor, VkDescriptorType type, uint32_t binding, VkDescriptorBufferInfo *buffer_info, uint32_t descriptor_count);
VkDescriptorSetLayoutBinding new_descriptor_set_layout_binding(VkDescriptorType type, VkShaderStageFlags flags, uint32_t binding, uint32_t descriptor_count);
VkDescriptorSetLayoutCreateInfo new_descriptor_set_layout_create_info(const VkDescriptorSetLayoutBinding *bindings, uint32_t binding_count);

#endif
