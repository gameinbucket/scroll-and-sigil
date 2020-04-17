#include "renderbuffer.h"

renderbuffer *renderbuffer_init(int position, int color, int texture, int vertex_limit, int index_limit) {
    renderbuffer *r = safe_malloc(sizeof(renderbuffer));
    r->position = position;
    r->color = color;
    r->texture = texture;
    r->vertex_pos = 0;
    r->vertex_size = vertex_limit * (position + color + texture) * sizeof(GLfloat);
    r->index_pos = 0;
    r->index_size = index_limit * sizeof(GLuint);
    r->index_offset = 0;
    r->vertices = safe_malloc(r->vertex_size);
    r->indices = safe_malloc(r->index_size);
    return r;
}

void renderbuffer_zero(renderbuffer *self) {
    self->vertex_pos = 0;
    self->index_pos = 0;
    self->index_offset = 0;
}
