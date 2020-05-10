#include "renderbuffer.h"

renderbuffer *create_renderbuffer(int position, int color, int texture, int normal, int bone, int vertex_limit, int index_limit, bool map_buffer_range) {
    renderbuffer *r = safe_malloc(sizeof(renderbuffer));
    r->position = position;
    r->color = color;
    r->texture = texture;
    r->normal = normal;
    r->bone = bone;
    r->vertex_pos = 0;
    r->vertex_size = vertex_limit * (position + color + texture + normal + bone) * sizeof(GLfloat);
    r->index_pos = 0;
    r->index_size = index_limit * sizeof(GLuint);
    r->index_offset = 0;
    r->map_buffer_range = map_buffer_range;
    if (map_buffer_range) {
        r->vertices = NULL;
        r->indices = NULL;
    } else {
        r->vertices = safe_malloc(r->vertex_size);
        r->indices = safe_malloc(r->index_size);
    }
    return r;
}

void renderbuffer_zero(renderbuffer *self) {
    self->vertex_pos = 0;
    self->index_pos = 0;
    self->index_offset = 0;
}

void renderbuffer_free(renderbuffer *self) {
    if (!self->map_buffer_range) {
        free(self->vertices);
        free(self->indices);
    }
    free(self);
}
