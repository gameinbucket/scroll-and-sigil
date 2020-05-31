#include "hud.h"

struct hud *create_hud() {
    struct hud *self = safe_calloc(1, sizeof(struct hud));
    return self;
}

void render_hud(struct hud *self, VkCommandBuffer command_buffer) {

    vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, self->vk_pipeline);
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, self->vk_pipeline_layout, 0, 1, &self->vk_descriptor_set, 0, NULL);

    VkBuffer vertex_buffers[1] = {self->renderbuffer->vk_vertex_buffer};
    VkDeviceSize vertex_offsets[1] = {0};

    vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);
    vkCmdBindIndexBuffer(command_buffer, self->renderbuffer->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

    vkCmdDrawIndexed(command_buffer, self->renderbuffer->index_count, 1, 0, 0, 0);
}

void delete_hud(vulkan_state *vk_state, struct hud *self) {

    vkDestroyPipeline(vk_state->vk_device, self->vk_pipeline, NULL);
    vkDestroyPipelineLayout(vk_state->vk_device, self->vk_pipeline_layout, NULL);

    delete_vulkan_renderbuffer(vk_state, self->renderbuffer);

    free(self);
}
