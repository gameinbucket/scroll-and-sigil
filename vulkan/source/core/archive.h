#ifndef ARCHIVE_H
#define ARCHIVE_H

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <zip.h>

#include "string_util.h"

struct archive_blob {
    char *data;
    size_t size;
};

struct zip *open_zip_archive(char *path);

string *read_string_from_zip(struct zip *z, char *path);

struct archive_blob read_blob_from_zip(struct zip *z, char *path);

#endif
