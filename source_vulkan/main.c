#include <SDL2/SDL.h>
#include <SDL2/SDL_vulkan.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <vulkan/vulkan.h>

#include "mem.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

typedef struct vulkan_state vulkan_state;

struct vulkan_state {
    VkInstance vk_instance;
    VkSurfaceKHR vk_surface;
};

void window_init(SDL_Window **win, vulkan_state *vk_state) {

    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        fprintf(stderr, "Could not initialize SDL: %s\n", SDL_GetError());
        exit(1);
    }

    Uint32 window_flags = SDL_WINDOW_VULKAN | SDL_WINDOW_SHOWN;
    SDL_Window *window = SDL_CreateWindow("Scroll And Sigil Vulkan", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, window_flags);

    if (window == NULL) {
        fprintf(stderr, "Window could not be created: %s\n", SDL_GetError());
        exit(1);
    }

    uint32_t vk_extension_count;
    SDL_Vulkan_GetInstanceExtensions(window, &vk_extension_count, NULL);
    const char **vk_extension_names = safe_calloc(vk_extension_count, sizeof(char *));
    SDL_Vulkan_GetInstanceExtensions(window, &vk_extension_count, vk_extension_names);

    VkApplicationInfo vk_app;
    vk_app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    vk_app.pNext = NULL;
    vk_app.pApplicationName = "Scroll And Sigil Vulkan";
    vk_app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    vk_app.pEngineName = "None";
    vk_app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    vk_app.apiVersion = VK_API_VERSION_1_0;

    VkInstanceCreateInfo vk_info;
    vk_info.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    vk_info.pNext = NULL;
    vk_info.flags = 0;
    vk_info.pApplicationInfo = &vk_app;
    vk_info.enabledLayerCount = 0;
    vk_info.ppEnabledLayerNames = NULL;
    vk_info.enabledExtensionCount = vk_extension_count;
    vk_info.ppEnabledExtensionNames = vk_extension_names;

    VkInstance vk_instance;
    if (vkCreateInstance(&vk_info, NULL, &vk_instance) != VK_SUCCESS) {
        fprintf(stderr, "Failed: Vulkan Create Instance\n");
        exit(1);
    }

    uint32_t vk_device_count = 0;
    vkEnumeratePhysicalDevices(vk_instance, &vk_device_count, NULL);

    if (vk_device_count == 0) {
        fprintf(stderr, "Error: No GPU with vulkan support\n");
        exit(1);
    }

    VkPhysicalDevice *vk_devices = safe_calloc(vk_device_count, sizeof(VkPhysicalDevice));
    vkEnumeratePhysicalDevices(vk_instance, &vk_device_count, vk_devices);

    VkPhysicalDevice vk_physical = VK_NULL_HANDLE;

    for (uint32_t i = 0; i < vk_device_count; i++) {
        VkPhysicalDevice device = vk_devices[i];

        VkPhysicalDeviceProperties vk_device_properties;
        VkPhysicalDeviceFeatures vk_device_features;
        vkGetPhysicalDeviceProperties(device, &vk_device_properties);
        vkGetPhysicalDeviceFeatures(device, &vk_device_features);

        if (vk_device_properties.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU && vk_device_features.geometryShader) {
            vk_physical = device;
            break;
        }
    }

    if (vk_physical == VK_NULL_HANDLE) {
        fprintf(stderr, "Failed: No suitable GPU\n");
        exit(1);
    }

    // QueueFamilyIndices indices;

    VkSurfaceKHR vk_surface;
    if (!SDL_Vulkan_CreateSurface(window, vk_instance, &vk_surface)) {
        fprintf(stderr, "SDL Vulkan Create Surface: %s\n", SDL_GetError());
        exit(1);
    }

    vk_state->vk_instance = vk_instance;
    vk_state->vk_surface = vk_surface;

    *win = window;

    free(vk_extension_names);
    free(vk_devices);
}

void draw() {
}

void main_loop() {
    SDL_Event event;
    while (run) {
        while (SDL_PollEvent(&event) != 0) {
            switch (event.type) {
            case SDL_QUIT: run = false; break;
            case SDL_KEYDOWN: {
                switch (event.key.keysym.sym) {
                case SDLK_ESCAPE: run = false; break;
                }
            }
            }
        }
        draw();
    }
}

void vulkan_quit(vulkan_state *self) {
    vkDestroyInstance(self->vk_instance, NULL);
}

int main() {
    SDL_Window *window = NULL;
    vulkan_state vk_state;

    window_init(&window, &vk_state);

    SDL_StartTextInput();

    main_loop();

    SDL_StopTextInput();
    vulkan_quit(&vk_state);
    SDL_Quit();

    return 0;
}
