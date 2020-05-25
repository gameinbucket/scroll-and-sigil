#include "screen_quad.h"

void create_screen_quad(vulkan_state *vk_state, struct vulkan_renderbuffer *renderbuffer, uint32_t width, uint32_t height) {
    render_screen(renderbuffer, 0, 0, width, height);
}
