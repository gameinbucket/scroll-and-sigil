#include "vulkan_render_buffer.h"

void vulkan_render_buffer_draw(vulkan_render_buffer *render, VkCommandBuffer command_buffer) {

    if (render->vertex_position == 0) {
        return;
    }

    VkBuffer vertex_buffers[1] = {render->vk_vertex_buffer};
    VkDeviceSize vertex_offsets[1] = {0};

    vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);
    vkCmdBindIndexBuffer(command_buffer, render->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

    vkCmdDrawIndexed(command_buffer, render->index_position, 1, 0, 0, 0);
}

static void index_buffers(vulkan_state *vk_state, vulkan_render_buffer *b) {

    VkDeviceSize size = b->index_max * sizeof(uint32_t);

    {
        VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
        VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT;

        vk_create_buffer(vk_state, size, usage, properties, &b->vk_index_staging_buffer, &b->vk_index_staging_buffer_memory);

        if (b->memory_host_visible) {
            vulkan_map_memory(vk_state, b->vk_index_staging_buffer_memory, size, &b->indices);
        } else {
            vulkan_map_memory(vk_state, b->vk_index_staging_buffer_memory, size, &b->mapped_index_memory);
        }
    }

    {
        VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_INDEX_BUFFER_BIT;
        VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

        vk_create_buffer(vk_state, size, usage, properties, &b->vk_index_buffer, &b->vk_index_buffer_memory);
    }
}

static void vertex_buffers(vulkan_state *vk_state, vulkan_render_buffer *b) {

    VkDeviceSize size = b->vertex_max * b->settings.stride * sizeof(float);

    {
        VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;
        VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT;

        vk_create_buffer(vk_state, size, usage, properties, &b->vk_vertex_staging_buffer, &b->vk_vertex_staging_buffer_memory);

        if (b->memory_host_visible) {
            vulkan_map_memory(vk_state, b->vk_vertex_staging_buffer_memory, size, &b->vertices);
        } else {
            vulkan_map_memory(vk_state, b->vk_vertex_staging_buffer_memory, size, &b->mapped_vertex_memory);
        }
    }

    {
        VkBufferUsageFlagBits usage = VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT;
        VkMemoryPropertyFlagBits properties = VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT;

        vk_create_buffer(vk_state, size, usage, properties, &b->vk_vertex_buffer, &b->vk_vertex_buffer_memory);
    }
}

void vulkan_render_buffer_zero(struct vulkan_render_buffer *b) {

    b->index_offset = 0;
    b->index_position = 0;
    b->vertex_position = 0;
}

void vulkan_render_buffer_flush(vulkan_state *vk_state, VkCommandBuffer command_buffer, struct vulkan_render_buffer *b) {

    VkBufferMemoryBarrier barrier = {0};
    barrier.sType = VK_STRUCTURE_TYPE_BUFFER_MEMORY_BARRIER;
    barrier.srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
    barrier.dstAccessMask = VK_ACCESS_VERTEX_ATTRIBUTE_READ_BIT;

    VkPipelineStageFlags source_stage = VK_PIPELINE_STAGE_TRANSFER_BIT;
    VkPipelineStageFlags destination_stage = VK_PIPELINE_STAGE_VERTEX_INPUT_BIT;

    {
        VkDeviceSize size = b->vertex_position * sizeof(float);

        if (!b->memory_host_visible) {
            vulkan_copy_memory(b->mapped_vertex_memory, b->vertices, size);
        }

        VkMappedMemoryRange memory_range = {0};
        memory_range.sType = VK_STRUCTURE_TYPE_MAPPED_MEMORY_RANGE;
        memory_range.memory = b->vk_vertex_staging_buffer_memory;
        memory_range.size = VK_WHOLE_SIZE;

        VK_RESULT_OK(vkFlushMappedMemoryRanges(vk_state->vk_device, 1, &memory_range));

        VkDeviceSize max_size = b->vertex_max * b->settings.stride * sizeof(float);
        // size_t active_size = b->vertex_position * sizeof(float);

        vk_copy_buffer(vk_state, command_buffer, b->vk_vertex_staging_buffer, b->vk_vertex_buffer, max_size);

        barrier.buffer = b->vk_vertex_buffer;
        barrier.size = max_size;

        vkCmdPipelineBarrier(command_buffer, source_stage, destination_stage, 0, 0, NULL, 1, &barrier, 0, NULL);
    }

    {
        VkDeviceSize size = b->index_position * sizeof(uint32_t);

        if (!b->memory_host_visible) {
            vulkan_copy_memory(b->mapped_index_memory, b->indices, size);
        }

        VkMappedMemoryRange memory_range = {0};
        memory_range.sType = VK_STRUCTURE_TYPE_MAPPED_MEMORY_RANGE;
        memory_range.memory = b->vk_index_staging_buffer_memory;
        memory_range.size = VK_WHOLE_SIZE;

        VK_RESULT_OK(vkFlushMappedMemoryRanges(vk_state->vk_device, 1, &memory_range));

        VkDeviceSize max_size = b->index_max * sizeof(uint32_t);
        // size_t active_size = b->index_position * sizeof(uint32_t);

        vk_copy_buffer(vk_state, command_buffer, b->vk_index_staging_buffer, b->vk_index_buffer, max_size);

        barrier.buffer = b->vk_index_buffer;
        barrier.size = max_size;

        vkCmdPipelineBarrier(command_buffer, source_stage, destination_stage, 0, 0, NULL, 1, &barrier, 0, NULL);
    }
}

void vulkan_render_buffer_immediate_flush(vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_render_buffer *b) {

    VkCommandBuffer command_buffer = vk_begin_single_time_commands(vk_state, command_pool);

    vulkan_render_buffer_flush(vk_state, command_buffer, b);

    vk_end_single_time_commands(vk_state, command_pool, command_buffer);
}

vulkan_render_buffer *create_vulkan_render_buffer(vulkan_state *vk_state, struct vulkan_render_settings settings, size_t vertex_size, size_t index_size) {

    vulkan_render_buffer *b = safe_calloc(1, sizeof(struct vulkan_render_buffer));
    b->settings = settings;
    b->vertex_max = vertex_size;
    b->index_max = index_size;
    b->memory_host_visible = true;

    if (!b->memory_host_visible) {
        b->vertices = safe_malloc(vertex_size * settings.stride * sizeof(float));
        b->indices = safe_malloc(index_size * sizeof(uint32_t));
    }

    index_buffers(vk_state, b);
    vertex_buffers(vk_state, b);

    return b;
}

void delete_vulkan_renderbuffer(vulkan_state *vk_state, vulkan_render_buffer *b) {

    vkDestroyBuffer(vk_state->vk_device, b->vk_vertex_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, b->vk_vertex_buffer_memory, NULL);

    vkDestroyBuffer(vk_state->vk_device, b->vk_index_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, b->vk_index_buffer_memory, NULL);

    vulkan_unmap_memory(vk_state, b->vk_vertex_staging_buffer_memory);
    vkDestroyBuffer(vk_state->vk_device, b->vk_vertex_staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, b->vk_vertex_staging_buffer_memory, NULL);

    vulkan_unmap_memory(vk_state, b->vk_index_staging_buffer_memory);
    vkDestroyBuffer(vk_state->vk_device, b->vk_index_staging_buffer, NULL);
    vkFreeMemory(vk_state->vk_device, b->vk_index_staging_buffer_memory, NULL);

    if (!b->memory_host_visible) {
        free(b->vertices);
        free(b->indices);
    }

    free(b);
}
