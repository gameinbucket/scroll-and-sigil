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
}

void graphics_set_orthographic(float *orthographic, float x, float y, float *mvp, float *mv) {
    matrix_identify(mv);
    matrix_translate(mv, x, y, 0);
    matrix_multiply(mvp, orthographic, mv);
}

void graphics_set_perspective(float *perspective, float x, float y, float z, float rx, float ry, float *mvp, float *mv) {
    matrix_identify(mv);
    if (rx != 0.0) {
        float sine = sin(rx);
        float cosine = cos(rx);
        matrix_rotate_x(mv, sine, cosine);
    }
    if (ry != 0.0) {
        float sine = sin(ry);
        float cosine = cos(ry);
        matrix_rotate_x(mv, sine, cosine);
    }
    matrix_translate(mv, x, y, z);
    matrix_multiply(mvp, perspective, mv);
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

void graphics_update_and_draw(renderbuffer *b) {
    glBindVertexArray(b->vao);
    glBindBuffer(GL_ARRAY_BUFFER, b->vbo);
    glBufferData(GL_ARRAY_BUFFER, b->vertex_limit * sizeof(GLfloat), b->vertices, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, b->ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, b->index_limit * sizeof(GLuint), b->indices, GL_DYNAMIC_DRAW);
    glDrawElements(GL_TRIANGLES, b->index_pos, GL_UNSIGNED_INT, 0);
}

void graphics_set_mvp(GLint program, float *mvp) {
    GLint location = glGetUniformLocation(program, "u_mvp\x00");
    glUniformMatrix4fv(location, 1, GL_FALSE, mvp);
}

void graphics_bind_fbo(GLint fbo) {
    glBindFramebuffer(GL_FRAMEBUFFER, fbo);
}

void graphics_bind_vao(GLint vao) {
    glBindVertexArray(vao);
}

void graphics_bind_and_draw(renderbuffer *b) {
    glBindVertexArray(b->vao);
    glDrawElements(GL_TRIANGLES, b->index_pos, GL_UNSIGNED_INT, 0);
}
