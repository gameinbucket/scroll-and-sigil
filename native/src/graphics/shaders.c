#include "shaders.h"

void show_info_log(GLuint object, PFNGLGETSHADERIVPROC func_get, PFNGLGETSHADERINFOLOGPROC func_info_log) {
    GLint log_length;
    char *log;

    func_get(object, GL_INFO_LOG_LENGTH, &log_length);
    log = malloc(log_length);
    func_info_log(object, log_length, NULL, log);
    fprintf(stderr, "%s", log);
    free(log);
}

GLint compile_shader(char *path, GLint type) {
    string code = cat(path);
    GLuint shader = glCreateShader(type);

    GLint shader_ok = GL_FALSE;

    glShaderSource(shader, 1, (const GLchar *const *)&code, NULL);
    glCompileShader(shader);

    string_free(code);

    glGetShaderiv(shader, GL_COMPILE_STATUS, &shader_ok);
    if (shader_ok != GL_TRUE) {
        printf("Failed to compile shader: %s\n", code);
        show_info_log(shader, glGetShaderiv, glGetShaderInfoLog);
        glDeleteShader(shader);
        exit(1);
    }

    return shader;
}

GLint compile_gl_program(char *vert, char *frag) {

    GLuint vertex = compile_shader(vert, GL_VERTEX_SHADER);
    GLuint fragment = compile_shader(frag, GL_FRAGMENT_SHADER);

    GLint program = glCreateProgram();

    glAttachShader(program, vertex);
    glAttachShader(program, fragment);
    glLinkProgram(program);

    GLint program_ok = GL_FALSE;

    glGetProgramiv(program, GL_LINK_STATUS, &program_ok);
    if (!program_ok) {
        fprintf(stderr, "Failed to link shader program:");
        show_info_log(program, glGetProgramiv, glGetProgramInfoLog);
        glDeleteProgram(program);
        exit(1);
    }

    return program;
}
