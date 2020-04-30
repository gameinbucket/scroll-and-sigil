#include "main.h"

static const int SCREEN_WIDTH = 1000;
static const int SCREEN_HEIGHT = 800;

static bool run = true;

static VkInstanceCreateInfo vk_info_initialize(SDL_Window *window) {

    uint32_t vk_extension_count;
    SDL_Vulkan_GetInstanceExtensions(window, &vk_extension_count, NULL);
    const char **vk_extension_names = safe_calloc(vk_extension_count, sizeof(char *));
    SDL_Vulkan_GetInstanceExtensions(window, &vk_extension_count, vk_extension_names);

    VkApplicationInfo vk_app = {0};
    vk_app.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    vk_app.pNext = NULL;
    vk_app.pApplicationName = "Scroll And Sigil Vulkan";
    vk_app.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    vk_app.pEngineName = "None";
    vk_app.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    vk_app.apiVersion = VK_API_VERSION_1_0;

    VkInstanceCreateInfo vk_info = {0};
    vk_info.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    vk_info.pNext = NULL;
    vk_info.flags = 0;
    vk_info.pApplicationInfo = &vk_app;
    vk_info.enabledLayerCount = 0;
    vk_info.ppEnabledLayerNames = NULL;
    vk_info.enabledExtensionCount = vk_extension_count;
    vk_info.ppEnabledExtensionNames = vk_extension_names;

    return vk_info;
}

static struct swap_chain_support_details vk_query_swap_chain_support(vulkan_state *vk_state, VkPhysicalDevice device) {

    struct swap_chain_support_details details;
    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(device, vk_state->vk_surface, &details.capabilities);

    uint32_t format_count;
    vkGetPhysicalDeviceSurfaceFormatsKHR(device, vk_state->vk_surface, &format_count, NULL);

    if (format_count != 0) {
        details.formats = safe_calloc(format_count, sizeof(VkSurfaceFormatKHR));
        vkGetPhysicalDeviceSurfaceFormatsKHR(device, vk_state->vk_surface, &format_count, details.formats);
    } else {
        details.formats = NULL;
    }
    details.format_count = format_count;

    uint32_t present_mode_count;
    vkGetPhysicalDeviceSurfacePresentModesKHR(device, vk_state->vk_surface, &present_mode_count, NULL);

    if (present_mode_count != 0) {
        details.present_modes = safe_calloc(present_mode_count, sizeof(VkPresentModeKHR));
        vkGetPhysicalDeviceSurfacePresentModesKHR(device, vk_state->vk_surface, &present_mode_count, details.present_modes);
    } else {
        details.present_modes = NULL;
    }
    details.present_mode_count = present_mode_count;

    return details;
}

static bool vk_check_extension_support(VkPhysicalDevice device) {
    uint32_t extension_count;
    vkEnumerateDeviceExtensionProperties(device, NULL, &extension_count, NULL);

    VkExtensionProperties *extensions = safe_calloc(extension_count, sizeof(VkExtensionProperties));
    vkEnumerateDeviceExtensionProperties(device, NULL, &extension_count, extensions);

    bool good = false;

    for (uint32_t i = 0; i < extension_count; i++) {
        if (strcmp(extensions[i].extensionName, VK_KHR_SWAPCHAIN_EXTENSION_NAME)) {
            good = true;
        }
    }

    free(extensions);

    return good;
}

static bool is_vk_physical_device_suitable(vulkan_state *vk_state, VkPhysicalDevice device) {

    VkPhysicalDeviceProperties vk_device_properties;
    VkPhysicalDeviceFeatures vk_device_features;
    vkGetPhysicalDeviceProperties(device, &vk_device_properties);
    vkGetPhysicalDeviceFeatures(device, &vk_device_features);

    if (vk_device_properties.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU && vk_device_features.geometryShader) {

        bool present_family_found = false;
        bool graphics_family_found = false;

        uint32_t queue_family_count = 0;
        vkGetPhysicalDeviceQueueFamilyProperties(device, &queue_family_count, NULL);

        VkQueueFamilyProperties *queue_families = safe_calloc(queue_family_count, sizeof(VkQueueFamilyProperties));
        vkGetPhysicalDeviceQueueFamilyProperties(device, &queue_family_count, queue_families);

        for (uint32_t i = 0; i < queue_family_count; i++) {

            VkQueueFamilyProperties family = queue_families[i];

            if (family.queueFlags & VK_QUEUE_GRAPHICS_BIT) {
                vk_state->graphics_family_index = i;
                graphics_family_found = true;
            }

            VkBool32 present_support = false;
            vkGetPhysicalDeviceSurfaceSupportKHR(device, i, vk_state->vk_surface, &present_support);

            if (present_support) {
                vk_state->present_family_index = i;
                present_family_found = true;
            }
        }

        free(queue_families);

        bool extension_support = vk_check_extension_support(device);

        return present_family_found && graphics_family_found && extension_support;
    }

    return false;
}

static bool vk_physical_device_initialize(vulkan_state *vk_state) {

    uint32_t vk_device_count = 0;
    vkEnumeratePhysicalDevices(vk_state->vk_instance, &vk_device_count, NULL);

    if (vk_device_count == 0) {
        fprintf(stderr, "Error: No GPU with vulkan support\n");
        exit(1);
    }

    VkPhysicalDevice *vk_devices = safe_calloc(vk_device_count, sizeof(VkPhysicalDevice));
    vkEnumeratePhysicalDevices(vk_state->vk_instance, &vk_device_count, vk_devices);

    for (uint32_t i = 0; i < vk_device_count; i++) {
        VkPhysicalDevice device = vk_devices[i];

        if (is_vk_physical_device_suitable(vk_state, device)) {
            vk_state->vk_physical = device;
            free(vk_devices);
            return true;
        }
    }

    fprintf(stderr, "Failed: No suitable GPU\n");
    exit(1);

    return false;
}

static void vk_create_logical_device(vulkan_state *vk_state) {

    const float queue_priority = 1.0f;

    int queue_count = 2;

    uint32_t queue_families[2] = {vk_state->present_family_index, vk_state->graphics_family_index};

    VkDeviceQueueCreateInfo vk_queue_info_list[2];

    for (int i = 0; i < queue_count; i++) {
        VkDeviceQueueCreateInfo vk_queue_info = {0};
        vk_queue_info.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        vk_queue_info.queueFamilyIndex = queue_families[i];
        vk_queue_info.queueCount = 1;
        vk_queue_info.pQueuePriorities = &queue_priority;

        vk_queue_info_list[i] = vk_queue_info;
    }

    VkPhysicalDeviceFeatures vk_device_features = {0};

    VkDeviceCreateInfo vk_create_info = {0};
    vk_create_info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    vk_create_info.pQueueCreateInfos = vk_queue_info_list;
    vk_create_info.queueCreateInfoCount = queue_count;
    vk_create_info.pEnabledFeatures = &vk_device_features;
    vk_create_info.enabledExtensionCount = VULKAN_DEVICE_EXTENSION_COUNT;
    vk_create_info.ppEnabledExtensionNames = VULKAN_DEVICE_EXTENSIONS;

    if (vkCreateDevice(vk_state->vk_physical, &vk_create_info, NULL, &vk_state->vk_device) != VK_SUCCESS) {
        fprintf(stderr, "Failed: Vulkan Create Device\n");
        exit(1);
    }

    vkGetDeviceQueue(vk_state->vk_device, vk_state->present_family_index, 0, &vk_state->vk_present_queue);
    vkGetDeviceQueue(vk_state->vk_device, vk_state->graphics_family_index, 0, &vk_state->vk_graphics_queue);
}

static void window_init(SDL_Window **win, vulkan_state *vk_state) {

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

    VkInstanceCreateInfo vk_info = vk_info_initialize(window);

    if (vkCreateInstance(&vk_info, NULL, &vk_state->vk_instance) != VK_SUCCESS) {
        fprintf(stderr, "Failed: Vulkan Create Instance\n");
        exit(1);
    }

    if (!SDL_Vulkan_CreateSurface(window, vk_state->vk_instance, &vk_state->vk_surface)) {
        fprintf(stderr, "SDL Vulkan Create Surface: %s\n", SDL_GetError());
        exit(1);
    }

    vk_physical_device_initialize(vk_state);
    vk_create_logical_device(vk_state);

    *win = window;
}

static void draw() {
}

static void main_loop() {
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

static void vulkan_quit(vulkan_state *self) {
    vkDestroyDevice(self->vk_device, NULL);
    vkDestroySurfaceKHR(self->vk_instance, self->vk_surface, NULL);
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
