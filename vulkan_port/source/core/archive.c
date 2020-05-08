#include "archive.h"

struct zip *open_zip_archive(char *path) {
    int err = 0;
    struct zip *z = zip_open(path, 0, &err);
    if (err != 0) {
        fprintf(stderr, "Error opening zip: %d\n", err);
        exit(1);
    }
    return z;
}

string *read_string_from_zip(struct zip *z, char *path) {
    struct zip_stat stat;
    zip_stat_init(&stat);
    zip_stat(z, path, 0, &stat);
    string *contents = string_allocate(stat.size);
    struct zip_file *zf = zip_fopen(z, path, 0);
    if (zf == NULL) {
        fprintf(stderr, "Zip file not found: %s\n", path);
        exit(1);
    }
    zip_fread(zf, contents, stat.size);
    zip_fclose(zf);
    return contents;
}

struct archive_blob read_blob_from_zip(struct zip *z, char *path) {
    struct zip_stat stat;
    zip_stat_init(&stat);
    zip_stat(z, path, 0, &stat);
    char *contents = safe_malloc(stat.size);
    struct zip_file *zf = zip_fopen(z, path, 0);
    if (zf == NULL) {
        fprintf(stderr, "Zip file not found: %s\n", path);
        exit(1);
    }
    zip_fread(zf, contents, stat.size);
    zip_fclose(zf);
    return (struct archive_blob){contents, stat.size};
}
