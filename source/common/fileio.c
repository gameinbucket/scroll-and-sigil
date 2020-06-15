#include "fileio.h"

size_t file_size(char *path) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        fprintf(stderr, "Could not open file: %s", path);
        exit(1);
    }
    size_t num = 0;
    char ch;
    while ((ch = fgetc(fp)) != EOF) {
        num++;
    }
    fclose(fp);
    return num;
}

size_t file_binary_size(char *path) {
    FILE *fp = fopen(path, "rb");
    if (fp == NULL) {
        fprintf(stderr, "Could not open file: %s", path);
        exit(1);
    }
    size_t num = 0;
    char ch;
    while ((ch = fgetc(fp)) != EOF) {
        num++;
    }
    fclose(fp);
    return num;
}

string *cat(char *path) {
    size_t size = file_size(path);
    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        fprintf(stderr, "Could not open file: %s", path);
        exit(1);
    }
    char *content = safe_malloc((size + 1) * sizeof(char));
    for (size_t i = 0; i < size; i++) {
        content[i] = fgetc(fp);
    }
    fclose(fp);
    string *s = string_init_with_length(content, size);
    free(content);
    return s;
}

void core_write(char *path, char *content) {
    FILE *fp = fopen(path, "a");
    if (fp == NULL) {
        fprintf(stderr, "Could not open file: %s", path);
        exit(1);
    }
    fputs(content, fp);
    fclose(fp);
}

char *read_binary(char *path, size_t *size_pointer) {
    size_t size = file_binary_size(path);
    FILE *fp = fopen(path, "rb");
    if (fp == NULL) {
        fprintf(stderr, "Could not open file: %s", path);
        exit(1);
    }
    char *content = safe_malloc(size * sizeof(char));
    for (size_t i = 0; i < size; i++) {
        content[i] = fgetc(fp);
    }
    fclose(fp);
    *size_pointer = size;
    return content;
}
