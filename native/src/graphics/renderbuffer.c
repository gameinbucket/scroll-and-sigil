#include "renderbuffer.h"

renderbuffer *renderbuffer_init(int position, int color, int texture, int vertex_limit, int index_limit) {
    renderbuffer *r = safe_malloc(sizeof(renderbuffer));
    r->position = position;
    r->color = color;
    r->texture = texture;
    r->vertex_pos = 0;
    r->vertex_limit = vertex_limit;
    r->index_pos = 0;
    r->index_limit = index_limit;
    r->index_offset = 0;
    r->vertices = safe_malloc(sizeof(GLfloat) * vertex_limit);
    r->indices = safe_malloc(sizeof(GLuint) * index_limit);
    return r;
}

void renderbuffer_zero(renderbuffer *self) {
    self->vertex_pos = 0;
    self->index_pos = 0;
    self->index_offset = 0;
}
