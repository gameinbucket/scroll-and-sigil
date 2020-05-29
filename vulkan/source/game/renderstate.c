#include "renderstate.h"

renderstate *create_renderstate() {
    return safe_calloc(1, sizeof(renderstate));
}

void delete_renderstate(renderstate *self) {
    printf("delete renderstate %p\n", (void *)self);
}
