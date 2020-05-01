#include "file.h"

static size_t file_binary_size(char *path) {
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
