#include "static_draw.h"

void static_draw_build_command_buffers(struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline, struct vulkan_render_buffer *render) {

    uint32_t size = vk_base->swapchain->swapchain_image_count;

    VkCommandBuffer *command_buffers = vk_base->vk_command_buffers;

    VkClearValue clear_color = {.color = (VkClearColorValue){{0.0f, 0.0f, 0.0f, 1.0f}}};
    VkClearValue clear_depth = {.depthStencil = (VkClearDepthStencilValue){1.0f, 0}};
    VkClearValue clear_values[2] = {clear_color, clear_depth};

    VkRenderPassBeginInfo render_pass_info = {0};
    render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
    render_pass_info.renderPass = vk_base->vk_render_pass;
    render_pass_info.renderArea.offset = (VkOffset2D){0, 0};
    render_pass_info.renderArea.extent = vk_base->swapchain->swapchain_extent;
    render_pass_info.pClearValues = clear_values;
    render_pass_info.clearValueCount = 2;

    uint32_t width = vk_base->swapchain->swapchain_extent.width;
    uint32_t height = vk_base->swapchain->swapchain_extent.height;

    VkViewport viewport = {0};
    viewport.width = width;
    viewport.height = height;
    viewport.minDepth = 0.0f;
    viewport.maxDepth = 1.0f;

    VkRect2D scissor = {0};
    scissor.extent = (VkExtent2D){width, height};
    scissor.offset = (VkOffset2D){0, 0};

    for (uint32_t i = 0; i < size; i++) {

        render_pass_info.framebuffer = vk_base->vk_framebuffers[i];

        VkCommandBuffer command_buffer = command_buffers[i];

        VkCommandBufferBeginInfo command_begin_info = {0};
        command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;

        if (vkBeginCommandBuffer(command_buffer, &command_begin_info) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
            exit(1);
        }

        vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

        vkCmdSetViewport(command_buffer, 0, 1, &viewport);
        vkCmdSetScissor(command_buffer, 0, 1, &scissor);

        vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline);
        VkBuffer vertex_buffers[1] = {render->vk_vertex_buffer};
        VkDeviceSize vertex_offsets[1] = {0};
        vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);
        vkCmdBindIndexBuffer(command_buffer, render->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);
        vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 0, 1, &pipeline->vk_descriptor_sets[i], 0, NULL);
        vkCmdDrawIndexed(command_buffer, render->index_max, 1, 0, 0, 0);

        vkCmdEndRenderPass(command_buffer);

        if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan End Command Buffer\n");
            exit(1);
        }
    }
}
