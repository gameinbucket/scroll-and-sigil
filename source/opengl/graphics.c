#include "graphics.h"

void graphics_update_fbo(framebuffer *f) {
    int len = f->texture_count;
    for (int i = 0; i < len; i++) {
        glBindTexture(GL_TEXTURE_2D, f->textures[i]);
        glTexImage2D(GL_TEXTURE_2D, 0, f->internal_formats[i], f->width, f->height, 0, f->formats[i], f->texture_types[i], NULL);
    }
    if (f->has_depth) {
        glBindTexture(GL_TEXTURE_2D, f->depth_texture);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH24_STENCIL8, f->width, f->height, 0, GL_DEPTH_STENCIL, GL_UNSIGNED_INT_24_8, NULL);
    }
    glBindTexture(GL_TEXTURE_2D, 0);
}

void graphics_update_vao(renderbuffer *b, GLuint draw_type) {
    glBindVertexArray(b->vao);

    glBindBuffer(GL_ARRAY_BUFFER, b->vbo);
    glBufferData(GL_ARRAY_BUFFER, b->vertex_pos * sizeof(GLfloat), b->vertices, draw_type);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, b->ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, b->index_pos * sizeof(GLuint), b->indices, draw_type);
}

void graphics_framebuffer_resize(framebuffer *f, int width, int height) {
    f->width = width;
    f->height = height;
    graphics_bind_fbo(f->fbo);
    graphics_update_fbo(f);
}

void graphics_make_fbo(framebuffer *f) {

    GLuint fbo;
    glGenFramebuffers(1, &fbo);
    f->fbo = fbo;

    graphics_bind_fbo(fbo);

    int len = f->texture_count;
    for (int i = 0; i < len; i++) {
        GLuint id;
        glGenTextures(1, &id);
        glBindTexture(GL_TEXTURE_2D, id);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, f->interpolate);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, f->interpolate);

        GLint color = GL_COLOR_ATTACHMENT0 + i;
        glFramebufferTexture2D(GL_FRAMEBUFFER, color, GL_TEXTURE_2D, id, 0);

        f->textures[i] = id;
        f->draw_buffers[i] = color;
    }

    glDrawBuffers(len, f->draw_buffers);

    if (f->has_depth) {
        GLuint id;
        glGenTextures(1, &id);
        glBindTexture(GL_TEXTURE_2D, id);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_TEXTURE_2D, id, 0);

        f->depth_texture = id;
    }

    graphics_update_fbo(f);

    int status = glCheckFramebufferStatus(GL_FRAMEBUFFER);
    if (status != GL_FRAMEBUFFER_COMPLETE) {
        fprintf(stderr, "Frame buffer status: %d\n", status);
        exit(1);
    }

    graphics_bind_fbo(0);
}

void graphics_make_shadow_map(shadowmap *s) {

    GLuint fbo;
    glGenFramebuffers(1, &fbo);
    s->fbo = fbo;

    graphics_bind_fbo(fbo);

    GLuint map;
    glGenTextures(1, &map);
    s->depth_texture = map;

    glBindTexture(GL_TEXTURE_2D, map);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);

    float border[4] = {1.0f, 1.0f, 1.0f, 1.0f};
    glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, border);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, map, 0);

    glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, s->size, s->size, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);

    glDrawBuffer(GL_NONE);
    glReadBuffer(GL_NONE);

    int status = glCheckFramebufferStatus(GL_FRAMEBUFFER);
    if (status != GL_FRAMEBUFFER_COMPLETE) {
        fprintf(stderr, "Shadow map status: %d\n", status);
        exit(1);
    }

    graphics_bind_fbo(0);
}

static void bind_vao_attributes(GLint position, GLint color, GLint texture, GLint normal, GLint bone) {

    GLsizei stride = (position + color + texture + normal + bone) * sizeof(GLfloat);
    GLint offset = 0;
    GLuint index = 0;

    if (position > 0) {
        glVertexAttribPointer(index, position, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
        index++;
        offset += position;
    }

    if (color > 0) {
        glVertexAttribPointer(index, color, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
        index++;
        offset += color;
    }

    if (texture > 0) {
        glVertexAttribPointer(index, texture, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
        index++;
        offset += texture;
    }

    if (normal > 0) {
        glVertexAttribPointer(index, normal, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
        index++;
        offset += normal;
    }

    if (bone > 0) {
        glVertexAttribPointer(index, bone, GL_FLOAT, false, stride, (GLvoid *)(offset * sizeof(GLfloat)));
        glEnableVertexAttribArray(index);
    }

    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
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

    if (b->map_buffer_range) {

        GLbitfield bits = GL_MAP_WRITE_BIT | GL_MAP_PERSISTENT_BIT | GL_MAP_COHERENT_BIT;

        glBufferStorage(GL_ARRAY_BUFFER, b->vertex_size, 0, bits);
        glBufferStorage(GL_ELEMENT_ARRAY_BUFFER, b->index_size, 0, bits);

        b->vertices = glMapBufferRange(GL_ARRAY_BUFFER, 0, b->vertex_size, bits);
        b->indices = glMapBufferRange(GL_ELEMENT_ARRAY_BUFFER, 0, b->index_size, bits);
    }

    bind_vao_attributes(b->position, b->color, b->texture, b->normal, b->bone);
}

void graphics_bind_fbo(GLuint fbo) {
    glBindFramebuffer(GL_FRAMEBUFFER, fbo);
}

void graphics_bind_vao(GLuint vao) {
    glBindVertexArray(vao);
}

void graphics_bind_texture(GLenum active, GLuint id) {
    glActiveTexture(active);
    glBindTexture(GL_TEXTURE_2D, id);
}

void graphics_set_view(GLint x, GLint y, GLsizei width, GLsizei height) {
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
    if (b->index_pos == 0) {
        return;
    }
    glBindVertexArray(b->vao);
    glDrawElements(GL_TRIANGLES, b->index_pos, GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

void graphics_update_and_draw(renderbuffer *b) {
    if (b->index_pos == 0) {
        return;
    }
    graphics_update_vao(b, GL_DYNAMIC_DRAW);
    glDrawElements(GL_TRIANGLES, b->index_pos, GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
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

void graphics_cull_front() {
    glCullFace(GL_FRONT);
}

void graphics_cull_back() {
    glCullFace(GL_BACK);
}

void graphics_clear_color() {
    glClear(GL_COLOR_BUFFER_BIT);
}

void graphics_clear_depth() {
    glClear(GL_DEPTH_BUFFER_BIT);
}

void graphics_clear_color_and_depth() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}
