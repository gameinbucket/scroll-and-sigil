#include "state.h"

float console_on = false;
string *console_type;
float debug_shadow = false;

static void rendering_resize(state *self, int width, int height) {

    self->canvas_width = width;
    self->canvas_height = height;

    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

    vulkan_base_recreate_swapchain(vk_state, vk_base, width, height);

    vulkan_pipeline_recreate(vk_state, vk_base, self->sc->pipeline);
    vulkan_pipeline_recreate(vk_state, vk_base, self->ws->pipeline);
    vulkan_pipeline_recreate(vk_state, vk_base, self->hd->pipeline);
}

static void record_rendering_offscreen(state *self, uint32_t image_index) {

    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

    vulkan_offscreen_buffer *offscreen = self->gbuffer;
    VkCommandBuffer command_buffer = vulkan_offscreen_buffer_begin_recording(vk_state, vk_base, offscreen, image_index);

    world_scene_transfers(vk_state, vk_base, self->ws, command_buffer, image_index);

    vulkan_offscreen_buffer_begin_render_pass(offscreen, command_buffer);

    scene_render(vk_state, vk_base, self->sc, command_buffer, image_index);
    world_scene_render(vk_state, vk_base, self->ws, command_buffer, image_index);

    vulkan_offscreen_buffer_end_recording(vk_state, vk_base, offscreen, image_index);
}

static void copy_rendering(vulkan_state *vk_state, vulkan_base *vk_base, state *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    struct vulkan_pipeline *pipeline = self->pipelines[SHADER_SCREEN];

    {
        struct uniform_projection ubo = {0};

        float view[16];
        float ortho[16];

        matrix_identity(view);
        matrix_translate(view, 0, 0, 0);

        float width = (float)vk_base->swapchain->swapchain_extent.width;
        float height = (float)vk_base->swapchain->swapchain_extent.height;

        float correction[16];
        matrix_vulkan_correction(correction);
        float original[16];
        matrix_orthographic(original, 0, width, 0, height, -1, 1);
        matrix_multiply(ortho, correction, original);

        matrix_multiply(ubo.mvp, ortho, view);

        struct vulkan_uniform_buffer *uniform_buffer = pipeline->pipe_data.sets[0].items[0].uniforms;
        vulkan_copy_memory(uniform_buffer->mapped_memory[image_index], &ubo, sizeof(ubo));
    }

    VkDescriptorSet get_image = self->gbuffer->output_descriptor;

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);
    vulkan_pipeline_cmd_bind_description(pipeline, command_buffer, 0, image_index);
    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 1, 1, &get_image);

    vulkan_render_buffer_draw(self->draw_canvas, command_buffer);
}

static void record_rendering(state *self, uint32_t image_index) {

    bool offscreen = true;

    if (offscreen) {

        record_rendering_offscreen(self, image_index);

        bool copy = true;

        if (copy) {
            vulkan_state *vk_state = self->vk_state;
            struct vulkan_base *vk_base = self->vk_base;

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
            render_pass_info.framebuffer = vk_base->vk_framebuffers[image_index];

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

            VkCommandBuffer command_buffer = vk_base->vk_command_buffers[image_index];

            VkCommandBufferBeginInfo command_begin_info = {0};
            command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
            command_begin_info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

            if (vkBeginCommandBuffer(command_buffer, &command_begin_info) != VK_SUCCESS) {
                fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
                exit(1);
            }

            vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

            vkCmdSetViewport(command_buffer, 0, 1, &viewport);
            vkCmdSetScissor(command_buffer, 0, 1, &scissor);

            copy_rendering(vk_state, vk_base, self, command_buffer, image_index);
            hud_render(vk_state, vk_base, self->hd, command_buffer, image_index);

            vkCmdEndRenderPass(command_buffer);

            if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
                fprintf(stderr, "Error: Vulkan End Command Buffer\n");
                exit(1);
            }
        }

        return;
    }

    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

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
    render_pass_info.framebuffer = vk_base->vk_framebuffers[image_index];

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

    VkCommandBuffer command_buffer = command_buffers[image_index];

    VkCommandBufferBeginInfo command_begin_info = {0};
    command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    command_begin_info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

    if (vkBeginCommandBuffer(command_buffer, &command_begin_info) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
        exit(1);
    }

    vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

    vkCmdSetViewport(command_buffer, 0, 1, &viewport);
    vkCmdSetScissor(command_buffer, 0, 1, &scissor);

    scene_render(vk_state, vk_base, self->sc, command_buffer, image_index);
    world_scene_render(vk_state, vk_base, self->ws, command_buffer, image_index);
    hud_render(vk_state, vk_base, self->hd, command_buffer, image_index);

    vkCmdEndRenderPass(command_buffer);

    if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan End Command Buffer\n");
        exit(1);
    }
}

void state_update(state *self) {

    world_update(self->w);

    input *in = &self->in;

    bool third_person = true;

    if (third_person) {

        if (in->look_left) {
            self->c->ry -= 0.05;
            if (self->c->ry < 0) {
                self->c->ry += FLOAT_MATH_TAU;
            }
        }

        if (in->look_right) {
            self->c->ry += 0.05;
            if (self->c->ry >= FLOAT_MATH_TAU) {
                self->c->ry -= FLOAT_MATH_TAU;
            }
        }

        if (in->look_up) {
            self->c->rx -= 0.05;
            if (self->c->rx < 0) {
                self->c->rx += FLOAT_MATH_TAU;
            }
        }

        if (in->look_down) {
            self->c->rx += 0.05;
            if (self->c->rx >= FLOAT_MATH_TAU) {
                self->c->rx -= FLOAT_MATH_TAU;
            }
        }

        camera_update(self->c);

        self->h->rotation_target = -self->c->ry;

        if (in->console) {
            in->console = false;
            console_on = !console_on;
        }

        if (console_on) {
            printf("type?");
        }

    } else {
        float speed = 0.1f;
        float r = self->c->ry;

        float dx = 0;
        float dy = 0;
        float dz = 0;

        const float MAXSPEED = 0.5f;

        if (in->move_forward) {
            dx += sinf(r) * speed;
            dz -= cosf(r) * speed;
        }

        if (in->move_backward) {
            dx -= sinf(r) * speed * 0.5f;
            dz += cosf(r) * speed * 0.5f;
        }

        if (in->move_up) {
            self->c->y += 0.1;
        }

        if (in->move_down) {
            self->c->y -= 0.1;
        }

        if (in->move_left) {
            dx -= cosf(r) * speed * 0.75f;
            dz -= sinf(r) * speed * 0.75f;
        }

        if (in->move_right) {
            dx += cosf(r) * speed * 0.75f;
            dz += sinf(r) * speed * 0.75f;
        }

        if (dx > MAXSPEED) {
            dx = MAXSPEED;
        } else if (dx < -MAXSPEED) {
            dx = -MAXSPEED;
        }

        if (dy > MAXSPEED) {
            dy = MAXSPEED;
        } else if (dy < -MAXSPEED) {
            dy = -MAXSPEED;
        }

        self->c->x += dx;
        self->c->y += dy;
        self->c->z += dz;

        if (in->look_left) {
            self->c->ry -= 0.05;
            if (self->c->ry < 0) {
                self->c->ry += FLOAT_MATH_TAU;
            }
        }

        if (in->look_right) {
            self->c->ry += 0.05;
            if (self->c->ry >= FLOAT_MATH_TAU) {
                self->c->ry -= FLOAT_MATH_TAU;
            }
        }

        if (in->look_up) {
            self->c->rx -= 0.05;
            if (self->c->rx < 0) {
                self->c->rx += FLOAT_MATH_TAU;
            }
        }

        if (in->look_down) {
            self->c->rx += 0.05;
            if (self->c->rx >= FLOAT_MATH_TAU) {
                self->c->rx -= FLOAT_MATH_TAU;
            }
        }
    }
}

void state_render(state *self) {

    SDL_Window *window = self->window;
    vulkan_state *vk_state = self->vk_state;
    struct vulkan_base *vk_base = self->vk_base;

    uint32_t current_frame = vk_state->current_frame;

    VK_RESULT_OK(vkWaitForFences(vk_state->vk_device, 1, &vk_base->vk_flight_fences[current_frame], VK_TRUE, VK_SYNC_TIMEOUT));

    uint32_t image_index;
    VkResult vkres = vkAcquireNextImageKHR(vk_state->vk_device, vk_base->swapchain->vk_swapchain, VK_SYNC_TIMEOUT, vk_base->vk_image_available_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        rendering_resize(self, width, height);
        return;
    } else {
        vk_ok(vkres);
    }

    record_rendering(self, image_index);

    if (vk_base->vk_images_in_flight[image_index] != VK_NULL_HANDLE) {
        vkres = vkWaitForFences(vk_state->vk_device, 1, &vk_base->vk_images_in_flight[image_index], VK_TRUE, VK_SYNC_TIMEOUT);
        vk_ok(vkres);
    }

    vk_base->vk_images_in_flight[image_index] = vk_base->vk_flight_fences[current_frame];

    VkSemaphore wait_image_available_semaphores[1] = {vk_base->vk_image_available_semaphores[current_frame]};
    VkPipelineStageFlags wait_stages[1] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};

    VkSemaphore signal_render_complete_semaphores[1] = {vk_base->vk_render_finished_semaphores[current_frame]};

    const bool offscreen_rendering = true;
    vulkan_offscreen_buffer *offscreen = self->gbuffer;
    if (offscreen_rendering) {

        VkSubmitInfo submit_info = {0};
        submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

        submit_info.waitSemaphoreCount = 1;
        submit_info.pWaitSemaphores = wait_image_available_semaphores;
        submit_info.pWaitDstStageMask = wait_stages;
        submit_info.signalSemaphoreCount = 1;
        submit_info.pSignalSemaphores = &offscreen->semaphore;
        submit_info.commandBufferCount = 1;
        submit_info.pCommandBuffers = &offscreen->command_buffers[image_index];

        VK_RESULT_OK(vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, VK_NULL_HANDLE));
    }

    VkSubmitInfo submit_info = {0};
    submit_info.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

    submit_info.waitSemaphoreCount = 1;
    if (offscreen_rendering) {
        submit_info.pWaitSemaphores = &offscreen->semaphore;
    } else {
        submit_info.pWaitSemaphores = wait_image_available_semaphores;
    }
    submit_info.pWaitDstStageMask = wait_stages;
    submit_info.signalSemaphoreCount = 1;
    submit_info.pSignalSemaphores = signal_render_complete_semaphores;
    submit_info.commandBufferCount = 1;
    submit_info.pCommandBuffers = &vk_base->vk_command_buffers[image_index];

    vkres = vkResetFences(vk_state->vk_device, 1, &vk_base->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    vkres = vkQueueSubmit(vk_state->vk_graphics_queue, 1, &submit_info, vk_base->vk_flight_fences[current_frame]);
    vk_ok(vkres);

    VkSwapchainKHR swapchains[1] = {vk_base->swapchain->vk_swapchain};

    VkPresentInfoKHR present_info = {0};
    present_info.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
    present_info.waitSemaphoreCount = 1;
    present_info.pWaitSemaphores = signal_render_complete_semaphores;
    present_info.swapchainCount = 1;
    present_info.pSwapchains = swapchains;
    present_info.pImageIndices = &image_index;

    vkres = vkQueuePresentKHR(vk_state->vk_present_queue, &present_info);

    if (vkres == VK_ERROR_OUT_OF_DATE_KHR || vkres == VK_SUBOPTIMAL_KHR || vk_state->framebuffer_resized) {
        int width;
        int height;
        SDL_Vulkan_GetDrawableSize(window, &width, &height);
        vk_state->framebuffer_resized = false;
        rendering_resize(self, width, height);
    } else {
        vk_ok(vkres);
    }

    vk_state->current_frame = (current_frame + 1) % VULKAN_MAX_FRAMES_IN_FLIGHT;
}

static void create_texture(image_system *is, vulkan_state *vk_state, VkCommandPool command_pool, struct vulkan_image *image, char *path, VkFilter filter, VkSamplerAddressMode mode) {
    image_details details = create_vulkan_texture(vk_state, command_pool, image, path, filter, mode);
    image_details *info = safe_box(&details, sizeof(image_details));
    image_system_add_image(is, path, info);
}

state *create_state(SDL_Window *window, vulkan_state *vk_state) {

    state *self = safe_calloc(1, sizeof(state));

    self->window = window;
    self->vk_state = vk_state;

    SDL_Vulkan_GetDrawableSize(window, &self->canvas_width, &self->canvas_height);

    struct vulkan_base *vk_base = create_vulkan_base(vk_state);
    vulkan_base_initialize(vk_state, vk_base, self->canvas_width, self->canvas_height);

    self->vk_base = vk_base;

    image_system *is = create_image_system();
    self->is = is;

    self->images = safe_calloc(TEXTURE_COUNT, sizeof(struct vulkan_image));
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_BARON], "textures/baron.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_EDGE);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_GRASS], "textures/tiles/grass.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_REPEAT);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_PLANK_FLOOR], "textures/tiles/plank-floor.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_REPEAT);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_PLANKS], "textures/tiles/planks.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_REPEAT);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_STONE], "textures/tiles/stone.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_REPEAT);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_STONE_FLOOR], "textures/tiles/stone-floor.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_REPEAT);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_PARTICLES], "textures/particles.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_EDGE);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_SCENERY], "textures/scenery.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_EDGE);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_FONT], "textures/font.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_EDGE);
    create_texture(is, vk_state, vk_base->vk_command_pool, &self->images[TEXTURE_HERO], "textures/hero.png", VK_FILTER_NEAREST, VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_EDGE);

    self->image_descriptors = create_image_descriptor_system(vk_state, TEXTURE_COUNT, self->images);

    self->pipelines = safe_calloc(SHADER_COUNT, sizeof(struct vulkan_pipeline *));

    sound_system *ss = create_sound_system();
    self->ss = ss;

    model_system *ms = create_model_system();
    self->ms = ms;

    world *w = create_world();
    self->w = w;

    mega_wad_load_resources(ss, is, ms);
    mega_wad_load_map(w, &self->in, ms);

    camera *c = create_camera(4);
    self->c = c;

    int thing_count = w->thing_count;
    thing **things = w->things;
    for (int i = 0; i < thing_count; i++) {
        if (things[i]->type == THING_TYPE_HERO) {
            self->h = things[i];
            self->c->target = self->h;
            break;
        }
    }

    world_scene *ws = create_world_scene(w);
    ws->image_descriptors = self->image_descriptors;
    ws->c = c;
    world_scene_initialize(vk_state, vk_base, vk_base->vk_command_pool, ws);
    world_scene_geometry(vk_state, vk_base, ws);
    self->ws = ws;

    self->gbuffer = create_vulkan_offscreen_buffer(vk_state, vk_base, self->canvas_width, self->canvas_height);

    VkPipelineColorBlendAttachmentState color_attach = create_color_blend_attachment(VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT, VK_FALSE);

    // {
    //     struct vulkan_pipe_item item1 = {0};
    //     item1.count = 1;
    //     item1.byte_size = sizeof(struct uniform_projection);
    //     item1.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    //     item1.stages = VK_SHADER_STAGE_VERTEX_BIT;

    //     struct vulkan_pipe_set set1 = {0};
    //     set1.number_of_items = 1;
    //     set1.number_of_copies = vk_base->swapchain->swapchain_image_count;
    //     set1.items = safe_calloc(set1.number_of_items, sizeof(struct vulkan_pipe_item));
    //     set1.items[0] = item1;

    //     struct vulkan_pipe_item item2 = {0};
    //     item2.count = 1;
    //     item2.images = safe_calloc(1, sizeof(struct vulkan_image_view_and_sample));
    //     item2.images[0] = get_vulkan_offscreen_buffer_color_view_and_sample(self->gbuffer);
    //     item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
    //     item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

    //     struct vulkan_pipe_set set2 = {0};
    //     set2.number_of_items = 1;
    //     set2.number_of_copies = 1;
    //     set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
    //     set2.items[0] = item2;

    //     struct vulkan_pipe_data pipe_settings = {0};
    //     pipe_settings.vertex = "shaders/spv/screen.vert.spv";
    //     pipe_settings.fragment = "shaders/spv/screen.frag.spv";
    //     pipe_settings.number_of_sets = 2;
    //     pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
    //     pipe_settings.sets[0] = set1;
    //     pipe_settings.sets[1] = set2;

    //     struct vulkan_render_settings render_settings = {0};
    //     vulkan_render_settings_init(&render_settings, 2, 0, 0, 0, 0);

    //     struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
    //     vulkan_pipeline_settings(pipeline, false, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
    //     vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);

    //     self->pipelines[SHADER_SCREEN] = pipeline;

    //     self->draw_canvas = create_vulkan_render_buffer(vk_state, render_settings, 4, 6);
    //     render_screen(self->draw_canvas, 0, 0, self->canvas_width, self->canvas_height);
    //     vulkan_render_buffer_immediate_flush(vk_state, vk_base->vk_command_pool, self->draw_canvas);
    // }

    // make pipelines (*void)
    self->pipelines[SHADER_SCREEN] = new_screen_shader(vk_state, vk_base, self->gbuffer);

    self->pipelines[SHADER_SSAO] = new_ssao_blur(vk_state, vk_base, self->gbuffer);

    {
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
        item2.images = safe_calloc(TEXTURE_COUNT, sizeof(struct vulkan_image_view_and_sample));
        for (int i = 0; i < TEXTURE_COUNT; i++) {
            item2.images[i] = get_vulkan_image_view_and_sample(&self->images[i]);
        }
        item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

        struct vulkan_pipe_set set2 = {0};
        set2.number_of_items = 1;
        set2.number_of_copies = TEXTURE_COUNT;
        set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
        set2.items[0] = item2;

        struct vulkan_pipe_data pipe_settings = {0};
        pipe_settings.vertex = "shaders/spv/texture3d.deferred.vert.spv";
        pipe_settings.fragment = "shaders/spv/texture3d.deferred.frag.spv";
        pipe_settings.number_of_sets = 2;
        pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
        pipe_settings.sets[0] = set1;
        pipe_settings.sets[1] = set2;
        pipe_settings.use_render_pass = true;
        pipe_settings.render_pass = self->gbuffer->render_pass;
        pipe_settings.color_blend_attachments_count = 3;
        pipe_settings.color_blend_attachments = safe_calloc(pipe_settings.color_blend_attachments_count, sizeof(VkPipelineColorBlendAttachmentState));
        pipe_settings.color_blend_attachments[0] = color_attach;
        pipe_settings.color_blend_attachments[1] = color_attach;
        pipe_settings.color_blend_attachments[2] = color_attach;

        struct vulkan_render_settings render_settings = {0};
        vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 0);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
        vulkan_pipeline_settings(pipeline, true, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
        vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);

        self->pipelines[SHADER_DEFERRED_TEXTURE_3D] = pipeline;
    }

    {
        struct vulkan_pipe_item item1 = {0};
        item1.count = 1;
        item1.byte_size = sizeof(struct uniform_projection_and_normal);
        item1.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        item1.stages = VK_SHADER_STAGE_VERTEX_BIT;

        struct vulkan_pipe_set set1 = {0};
        set1.number_of_items = 1;
        set1.number_of_copies = vk_base->swapchain->swapchain_image_count;
        set1.items = safe_calloc(set1.number_of_items, sizeof(struct vulkan_pipe_item));
        set1.items[0] = item1;

        struct vulkan_pipe_item item2 = {0};
        item2.count = 1;
        item2.images = safe_calloc(TEXTURE_COUNT, sizeof(struct vulkan_image_view_and_sample));
        for (int i = 0; i < TEXTURE_COUNT; i++) {
            item2.images[i] = get_vulkan_image_view_and_sample(&self->images[i]);
        }
        item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

        struct vulkan_pipe_set set2 = {0};
        set2.number_of_items = 1;
        set2.number_of_copies = TEXTURE_COUNT;
        set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
        set2.items[0] = item2;

        struct vulkan_pipe_item item3 = {0};
        item3.count = 1;
        item3.byte_size = sizeof(struct uniform_bones);
        item3.object_instances = 4;
        item3.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC;
        item3.stages = VK_SHADER_STAGE_VERTEX_BIT;

        struct vulkan_pipe_set set3 = {0};
        set3.number_of_items = 1;
        set3.number_of_copies = vk_base->swapchain->swapchain_image_count;
        set3.items = safe_calloc(set3.number_of_items, sizeof(struct vulkan_pipe_item));
        set3.items[0] = item3;

        struct vulkan_pipe_data pipe_settings = {0};
        pipe_settings.vertex = "shaders/spv/model.deferred.vert.spv";
        pipe_settings.fragment = "shaders/spv/model.deferred.frag.spv";
        pipe_settings.number_of_sets = 3;
        pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
        pipe_settings.sets[0] = set1;
        pipe_settings.sets[1] = set2;
        pipe_settings.sets[2] = set3;
        pipe_settings.use_render_pass = true;
        pipe_settings.render_pass = self->gbuffer->render_pass;
        pipe_settings.color_blend_attachments_count = 3;
        pipe_settings.color_blend_attachments = safe_calloc(pipe_settings.color_blend_attachments_count, sizeof(VkPipelineColorBlendAttachmentState));
        pipe_settings.color_blend_attachments[0] = color_attach;
        pipe_settings.color_blend_attachments[1] = color_attach;
        pipe_settings.color_blend_attachments[2] = color_attach;

        struct vulkan_render_settings render_settings = {0};
        vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 1);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
        vulkan_pipeline_settings(pipeline, true, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_NONE);
        vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);

        self->pipelines[SHADER_DEFERRED_RENDER_MODEL] = pipeline;
    }

    {
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

        struct vulkan_pipe_data pipe_settings = {0};
        pipe_settings.vertex = "shaders/spv/color2d.vert.spv";
        pipe_settings.fragment = "shaders/spv/color2d.frag.spv";
        pipe_settings.number_of_sets = 1;
        pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
        pipe_settings.sets[0] = set1;

        struct vulkan_render_settings render_settings = {0};
        vulkan_render_settings_init(&render_settings, 2, 4, 0, 0, 0);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
        vulkan_pipeline_settings(pipeline, false, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
        vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);
        self->pipelines[SHADER_COLOR_2D] = pipeline;

        struct vulkan_render_buffer *render = create_vulkan_render_buffer(vk_state, render_settings, 4, 6);
        render_rectangle(render, 0, 0, 64, 64, 1.0f, 0.0f, 0.0f, 1.0f);
        vulkan_render_buffer_immediate_flush(vk_state, vk_base->vk_command_pool, render);

        self->hd = create_hud(pipeline, render);
    }

    {
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
        item2.images = safe_calloc(item2.count, sizeof(struct vulkan_image_view_and_sample));
        item2.images[0] = get_vulkan_image_view_and_sample(&self->images[TEXTURE_GRASS]);
        item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

        struct vulkan_pipe_set set2 = {0};
        set2.number_of_items = 1;
        set2.number_of_copies = 1;
        set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
        set2.items[0] = item2;

        struct vulkan_pipe_data pipe_settings = {0};
        pipe_settings.vertex = "shaders/spv/texture3d_color.vert.spv";
        pipe_settings.fragment = "shaders/spv/texture3d_color.frag.spv";
        pipe_settings.number_of_sets = 2;
        pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
        pipe_settings.sets[0] = set1;
        pipe_settings.sets[1] = set2;
        pipe_settings.use_render_pass = true;
        pipe_settings.render_pass = self->gbuffer->render_pass;
        pipe_settings.color_blend_attachments_count = 3;
        pipe_settings.color_blend_attachments = safe_calloc(pipe_settings.color_blend_attachments_count, sizeof(VkPipelineColorBlendAttachmentState));
        pipe_settings.color_blend_attachments[0] = color_attach;
        pipe_settings.color_blend_attachments[1] = color_attach;
        pipe_settings.color_blend_attachments[2] = color_attach;

        struct vulkan_render_settings render_settings = {0};
        vulkan_render_settings_init(&render_settings, 3, 3, 2, 0, 0);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
        vulkan_pipeline_settings(pipeline, true, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
        vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);
        self->pipelines[SHADER_TEXTURE_3D_COLOR] = pipeline;

        struct vulkan_render_buffer *render = create_vulkan_render_buffer(vk_state, render_settings, VK_CUBE_VERTEX_COUNT * 10, VK_CUBE_INDICE_COUNT * 10);
        render_cube(render);
        vulkan_render_buffer_immediate_flush(vk_state, vk_base->vk_command_pool, render);

        self->sc = create_scene(pipeline, render);
        self->sc->image_descriptors = self->image_descriptors;
    }

    {
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
        item2.images = safe_calloc(TEXTURE_COUNT, sizeof(struct vulkan_image_view_and_sample));
        for (int i = 0; i < TEXTURE_COUNT; i++) {
            item2.images[i] = get_vulkan_image_view_and_sample(&self->images[i]);
        }
        item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

        struct vulkan_pipe_set set2 = {0};
        set2.number_of_items = 1;
        set2.number_of_copies = TEXTURE_COUNT;
        set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
        set2.items[0] = item2;

        struct vulkan_pipe_data pipe_settings = {0};
        pipe_settings.vertex = "shaders/spv/texture3d.vert.spv";
        pipe_settings.fragment = "shaders/spv/texture3d.frag.spv";
        pipe_settings.number_of_sets = 2;
        pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
        pipe_settings.sets[0] = set1;
        pipe_settings.sets[1] = set2;

        struct vulkan_render_settings render_settings = {0};
        vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 0);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
        vulkan_pipeline_settings(pipeline, true, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_BACK_BIT);
        vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);

        self->pipelines[SHADER_TEXTURE_3D] = pipeline;
    }

    {
        struct vulkan_pipe_item item1 = {0};
        item1.count = 1;
        item1.byte_size = sizeof(struct uniform_projection_and_normal);
        item1.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
        item1.stages = VK_SHADER_STAGE_VERTEX_BIT;

        struct vulkan_pipe_set set1 = {0};
        set1.number_of_items = 1;
        set1.number_of_copies = vk_base->swapchain->swapchain_image_count;
        set1.items = safe_calloc(set1.number_of_items, sizeof(struct vulkan_pipe_item));
        set1.items[0] = item1;

        struct vulkan_pipe_item item2 = {0};
        item2.count = 1;
        item2.images = safe_calloc(TEXTURE_COUNT, sizeof(struct vulkan_image_view_and_sample));
        for (int i = 0; i < TEXTURE_COUNT; i++) {
            item2.images[i] = get_vulkan_image_view_and_sample(&self->images[i]);
        }
        item2.type = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        item2.stages = VK_SHADER_STAGE_FRAGMENT_BIT;

        struct vulkan_pipe_set set2 = {0};
        set2.number_of_items = 1;
        set2.number_of_copies = TEXTURE_COUNT;
        set2.items = safe_calloc(set2.number_of_items, sizeof(struct vulkan_pipe_item));
        set2.items[0] = item2;

        struct vulkan_pipe_item item3 = {0};
        item3.count = 1;
        item3.byte_size = sizeof(struct uniform_bones);
        item3.object_instances = 4;
        item3.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC;
        item3.stages = VK_SHADER_STAGE_VERTEX_BIT;

        struct vulkan_pipe_set set3 = {0};
        set3.number_of_items = 1;
        set3.number_of_copies = vk_base->swapchain->swapchain_image_count;
        set3.items = safe_calloc(set3.number_of_items, sizeof(struct vulkan_pipe_item));
        set3.items[0] = item3;

        struct vulkan_pipe_data pipe_settings = {0};
        pipe_settings.vertex = "shaders/spv/model.vert.spv";
        pipe_settings.fragment = "shaders/spv/model.frag.spv";
        pipe_settings.number_of_sets = 3;
        pipe_settings.sets = safe_calloc(pipe_settings.number_of_sets, sizeof(struct vulkan_pipe_set));
        pipe_settings.sets[0] = set1;
        pipe_settings.sets[1] = set2;
        pipe_settings.sets[2] = set3;

        struct vulkan_render_settings render_settings = {0};
        vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 1);
        struct vulkan_pipeline *pipeline = create_vulkan_pipeline(pipe_settings, render_settings);
        vulkan_pipeline_settings(pipeline, true, VK_FRONT_FACE_COUNTER_CLOCKWISE, VK_CULL_MODE_NONE);
        vulkan_pipeline_static_initialize(vk_state, vk_base, pipeline);

        self->pipelines[SHADER_RENDER_MODEL] = pipeline;
    }

    ws->pipeline = self->pipelines[SHADER_DEFERRED_TEXTURE_3D];
    ws->pipeline_model = self->pipelines[SHADER_DEFERRED_RENDER_MODEL];

    return self;
}

void delete_state(state *self) {

    delete_scene(self->vk_state, self->sc);
    delete_world_scene(self->vk_state, self->vk_base, self->ws);
    delete_hud(self->vk_state, self->hd);

    delete_vulkan_renderbuffer(self->vk_state, self->draw_canvas);

    if (self->gbuffer != NULL) {
        delete_vulkan_offscreen_buffer(self->vk_state, self->vk_base, self->gbuffer);
    }

    for (int i = 0; i < SHADER_COUNT; i++) {
        if (self->pipelines[i] != NULL) {
            delete_vulkan_pipeline(self->vk_state, self->pipelines[i]);
        }
    }

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        delete_vulkan_image(self->vk_state->vk_device, &self->images[i]);
    }

    delete_image_descriptor_system(self->vk_state, self->image_descriptors);

    delete_vulkan_base(self->vk_state, self->vk_base);

    delete_sound_system(self->ss);
    delete_model_system(self->ms);

    free(self);
}
