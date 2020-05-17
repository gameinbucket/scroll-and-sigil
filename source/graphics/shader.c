#include "shader.h"

void show_info_log(GLuint object, PFNGLGETSHADERIVPROC func_get, PFNGLGETSHADERINFOLOGPROC func_info_log) {
    GLint log_length;
    char *log;

    func_get(object, GL_INFO_LOG_LENGTH, &log_length);
    log = malloc(log_length);
    func_info_log(object, log_length, NULL, log);
    fprintf(stderr, "%s", log);
    free(log);
}

GLint shader_compile_source(struct zip *z, char *path, GLint type) {

    string *code;
    if (z != NULL) {
        code = read_string_from_zip(z, path);
    } else {
        code = cat(path);
    }

    GLuint shader = glCreateShader(type);

    GLint shader_ok = GL_FALSE;

    glShaderSource(shader, 1, (const GLchar *const *)&code, NULL);
    glCompileShader(shader);

    string_free(code);

    glGetShaderiv(shader, GL_COMPILE_STATUS, &shader_ok);
    if (shader_ok != GL_TRUE) {
        fprintf(stderr, "Failed to compile shader \"%s\": %s\n", path, code);
        show_info_log(shader, glGetShaderiv, glGetShaderInfoLog);
        glDeleteShader(shader);
        exit(1);
    }

    return shader;
}

shader *shader_make(struct zip *z, char *vert, char *frag) {

    GLuint vertex = shader_compile_source(z, vert, GL_VERTEX_SHADER);
    GLuint fragment = shader_compile_source(z, frag, GL_FRAGMENT_SHADER);

    GLuint program = glCreateProgram();

    glAttachShader(program, vertex);
    glAttachShader(program, fragment);
    glLinkProgram(program);

    GLint program_ok = GL_FALSE;

    glGetProgramiv(program, GL_LINK_STATUS, &program_ok);
    if (!program_ok) {
        fprintf(stderr, "Failed to link shader program: %s, %s\n", vert, frag);
        show_info_log(program, glGetProgramiv, glGetProgramInfoLog);
        glDeleteProgram(program);
        exit(1);
    }

    glDeleteShader(vertex);
    glDeleteShader(fragment);

    glUseProgram(program);

    GLint u_mvp = glGetUniformLocation(program, "u_mvp");

    GLint u_texture0 = glGetUniformLocation(program, "u_texture0");
    GLint u_texture1 = glGetUniformLocation(program, "u_texture1");
    GLint u_texture2 = glGetUniformLocation(program, "u_texture2");
    GLint u_texture3 = glGetUniformLocation(program, "u_texture3");

    glUniform1i(u_texture0, 0);
    glUniform1i(u_texture1, 1);
    glUniform1i(u_texture2, 2);
    glUniform1i(u_texture3, 3);

    glUseProgram(0);

#ifdef SHADER_DEBUG
    printf("shader id := %d\n", program);
    printf("shader name := %s\n", name);
    printf("shader uniform model view projection := %d\n", u_mvp);
    printf("shader texture 0 := %d\n", u_texture0);
    printf("shader texture 1 := %d\n", u_texture1);
    printf("shader texture 2 := %d\n", u_texture2);
    printf("shader texture 3 := %d\n", u_texture3);
#endif

    shader *s = safe_malloc(sizeof(shader));
    s->id = program;
    s->u_mvp = u_mvp;

    return s;
}
