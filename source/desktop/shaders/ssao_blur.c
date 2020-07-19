#include "ssao_blur.h"

struct vulkan_pipeline *new_ssao_blur(vulkan_state *vk_state, vulkan_base *vk_base, vulkan_offscreen_buffer *offscreen) {

    struct vulkan_pipe_item item1 = {0};
    item1.count = 1;
    item1.byte_size = sizeof(struct uniform_projection);
    item1.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    item1.stages = VK_SHADER_STAGE_VERTEX_BIT;

    struct vulkan_pipe_set set1 = {0};
    set1.number_of_items = 1;
    set1.number_of_copies = vk_base->swapchain->swapchain_image_count;
    set1.items = safe_calloc(set1.number_of_items, sizeof(struct vulkan_pipe_item));
    set1.items[0] = item1;

    struct vulkan_pipe_item item2 = {0};
    item2.count = 1;
    item2.images = safe_calloc(1, sizeof(struct vulkan_image_view_and_sample));
    item2.images[0] = (struct vulkan_image_view_and_sample){.view = offscreen->color.view, .sample = offscreen->color_sampler};
    item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

    struct vulkan_pipe_set set2 = {0};
    set2.number_of_items = 1;
    set2.number_of_copies = 1;
    set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
    set2.items[0] = item2;

    struct vulkan_pipe_item item3 = {0};
    item3.count = 1;
    item3.byte_size = sizeof(float);
    item3.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    item3.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

    struct vulkan_pipe_set set3 = {0};
    set3.number_of_items = 1;
    set3.number_of_copies = 1;
    set3.items = safe_calloc(set3.number_of_items, sizeof(struct vulkan_pipe_item));
    set3.items[0] = item3;

    struct vulkan_pipe_data pipe_settings = {0};
    pipe_settings.vertex = "shaders/spv/screen.vert.spv";
    pipe_settings.fragment = "shaders/spv/ssao-blur.frag.spv";
    pipe_settings.number_of_sets = 3;
    pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
    pipe_settings.sets[0] = set1;
    pipe_settings.sets[1] = set2;
    pipe_settings.sets[2] = set3;

    struct vulkan_render_settings render_settings = {0};
    vulkan_render_settings_init(&render_settings, 2, 0, 0, 0, 0);

    struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
    vulkan_pipeline_settings(pipeline, false, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
    vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);

    // need push constant

    return pipeline;
}
