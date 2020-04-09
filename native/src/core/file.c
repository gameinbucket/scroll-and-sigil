#include "file.h"

size_t file_size(const char *path) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        printf("Could not open file: %s", path);
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

string cat(const char *path) {
    size_t size = file_size(path);
    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        printf("Could not open file: %s", path);
        exit(1);
    }
    char *content = safe_malloc((size + 1) * sizeof(char));
    for (size_t i = 0; i < size; i++) {
        content[i] = fgetc(fp);
    }
    fclose(fp);
    string s = string_init_with_length(content, size);
    free(content);
    return s;
}

void core_write(const char *path, const char *content) {
    FILE *fp = fopen(path, "a");
    if (fp == NULL) {
        printf("Could not open file: %s", path);
        exit(1);
    }
    fputs(content, fp);
    fclose(fp);
}
