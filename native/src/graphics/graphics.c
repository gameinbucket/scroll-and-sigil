#include "graphics.h"

void graphics_make_fbo(framebuffer *f) {
    glGenFramebuffers(1, &f->fbo);
}

void graphics_make_vao(renderbuffer *b) {

    GLuint vao;
    GLuint vbo;
    GLuint ebo;

    glCreateVertexArrays(1, &vao);
    glCreateBuffers(1, &vbo);
    glCreateBuffers(1, &ebo);

    glBindVertexArray(vao);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);

    b->vao = vao;
    b->vbo = vbo;
    b->ebo = ebo;

    int position = b->position;
    int color = b->color;
    int texture = b->texture;

    int stride = (position + color + texture) * 4;
    int index = 0;
    int offset = 0;

    if (position > 0) {
        glVertexAttribPointer(index, position, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
        index++;
        offset += position * 4;
    }

    if (color > 0) {
        glVertexAttribPointer(index, color, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
        index++;
        offset += color * 4;
    }

    if (texture > 0) {
        glVertexAttribPointer(index, texture, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
    }

    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
}

void graphics_update_vao(renderbuffer *b, GLuint draw_type) {
    glBindVertexArray(b->vao);
    glBindBuffer(GL_ARRAY_BUFFER, b->vbo);
    glBufferData(GL_ARRAY_BUFFER, b->vertex_limit * sizeof(GLfloat), b->vertices, draw_type);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, b->ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, b->index_limit * sizeof(GLuint), b->indices, draw_type);
}

void graphics_bind_fbo(GLint fbo) {
    glBindFramebuffer(GL_FRAMEBUFFER, fbo);
}

void graphics_bind_vao(GLint vao) {
    glBindVertexArray(vao);
}

void graphics_set_view(GLint x, GLint y, GLint width, GLint height) {
    glViewport(x, y, width, height);
    glScissor(x, y, width, height);
}

void graphics_draw_range(void *start, GLsizei count) {
    if (count == 0) {
        return;
    }
    glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, start);
}

void graphics_bind_and_draw(renderbuffer *b) {
    glBindVertexArray(b->vao);
    glDrawElements(GL_TRIANGLES, b->index_pos, GL_UNSIGNED_INT, 0);
}

void graphics_update_and_draw(renderbuffer *b) {
    graphics_update_vao(b, GL_DYNAMIC_DRAW);
    glDrawElements(GL_TRIANGLES, b->index_pos, GL_UNSIGNED_INT, 0);
}

void graphics_enable_depth() {
    glEnable(GL_DEPTH_TEST);
}

void graphics_disable_depth() {
    glDisable(GL_DEPTH_TEST);
}

void graphics_enable_cull() {
    glEnable(GL_CULL_FACE);
}

void graphics_disable_cull() {
    glDisable(GL_CULL_FACE);
}

void graphics_clear_color() {
    glClear(GL_COLOR_BUFFER_BIT);
}

void graphics_clear_color_and_depth() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}
