#ifndef VULKAN_STRUCT_H
#define VULKAN_STRUCT_H

#include <stdalign.h>
#include <stdbool.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#define MAX(x, y) (x > y ? x : y)
#define MIN(x, y) (x < y ? x : y)

#define vk_ok(code)                                                                                                                                                                                    \
    if (code != VK_SUCCESS) {                                                                                                                                                                          \
        fprintf(stderr, "Vulkan Error: Line: %d, Code: %d\n", __LINE__, code);                                                                                                                         \
        exit(1);                                                                                                                                                                                       \
    }

#define VULKAN_ENABLE_VALIDATION

#define VULKAN_VALIDATION_LAYER_COUNT 1
static const char *const VULKAN_VALIDATION_LAYERS[VULKAN_VALIDATION_LAYER_COUNT] = {"VK_LAYER_KHRONOS_validation"};

#define VULKAN_DEVICE_EXTENSION_COUNT 1
static const char *const VULKAN_DEVICE_EXTENSIONS[VULKAN_DEVICE_EXTENSION_COUNT] = {VK_KHR_SWAPCHAIN_EXTENSION_NAME};

#define VULKAN_MAX_FRAMES_IN_FLIGHT 2

struct uniform_buffer_object {
    alignas(16) float mvp[16];
};

struct vulkan_uniform_buffer {
    VkBuffer *vk_uniform_buffers;
    VkDeviceMemory *vk_uniform_buffers_memory;
};

struct vulkan_render_buffer {
    int position;
    int color;
    int texture;
    int normal;
    uint32_t vertex_stride;
    float *vertices;
    uint32_t *indices;
    uint32_t vertex_count;
    uint32_t index_count;
    uint32_t index_offset;
    VkBuffer vk_vertex_buffer;
    VkDeviceMemory vk_vertex_buffer_memory;
    VkBuffer vk_index_buffer;
    VkDeviceMemory vk_index_buffer_memory;
};

struct vulkan_swapchain {
    VkSwapchainKHR vk_swapchain;
    VkFormat swapchain_image_format;
    VkExtent2D swapchain_extent;
    VkImage *swapchain_images;
    VkImageView *swapchain_image_views;
    uint32_t swapchain_image_count;
};

struct vulkan_pipeline {
    char *vertex_shader_path;
    char *fragment_shader_path;
    struct vulkan_render_buffer *rendering;
};

struct vulkan_renderer {
    struct vulkan_swapchain *swapchain;
    VkRenderPass vk_render_pass;
    VkDescriptorSetLayout vk_descriptor_set_layout;
    VkDescriptorPool vk_descriptor_pool;
    VkDescriptorSet *vk_descriptor_sets;
    VkPipelineLayout vk_pipeline_layout;
    VkPipeline vk_pipeline;
    VkFramebuffer *vk_framebuffers;
    VkCommandPool vk_command_pool;
    VkCommandBuffer *vk_command_buffers;
    struct vulkan_pipeline *pipeline;
    struct vulkan_uniform_buffer *uniforms;
    VkFence *vk_flight_fences;
    VkFence *vk_images_in_flight;
    VkSemaphore *vk_image_available_semaphores;
    VkSemaphore *vk_render_finished_semaphores;
    VkImage vk_texture_image;
    VkDeviceMemory vk_texture_image_memory;
    VkImageView vk_texture_image_view;
    VkSampler vk_texture_sampler;
    VkImage vk_depth_image;
    VkDeviceMemory vk_depth_image_memory;
    VkImageView vk_depth_image_view;
    VkFormat vk_depth_format;
};

typedef struct vulkan_state vulkan_state;

struct vulkan_state {
    VkInstance vk_instance;
    VkSurfaceKHR vk_surface;
    VkPhysicalDevice vk_physical_device;
    VkDevice vk_device;
    VkQueue vk_present_queue;
    VkQueue vk_graphics_queue;
    uint32_t present_family_index;
    uint32_t graphics_family_index;
    struct vulkan_renderer *renderer;
    int current_frame;
    bool framebuffer_resized;
    VkDebugUtilsMessengerEXT vk_debug_messenger;
};

void delete_vulkan_render_buffer(vulkan_state *vk_state, struct vulkan_render_buffer *self);
void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *self);
void delete_vulkan_swapchain(struct vulkan_swapchain *self);
void delete_vulkan_uniform_buffer(struct vulkan_uniform_buffer *self);
void delete_vulkan_state(vulkan_state *self);

#endif
