#include "vulkan_state.h"

void delete_vulkan_state(vulkan_state *self) {
    vkDestroyDevice(self->vk_device, NULL);
#ifdef VULKAN_ENABLE_VALIDATION
    delete_debug_utils_messennger(self->vk_instance, self->vk_debug_messenger, NULL);
#endif
    vkDestroySurfaceKHR(self->vk_instance, self->vk_surface, NULL);
    vkDestroyInstance(self->vk_instance, NULL);
}
