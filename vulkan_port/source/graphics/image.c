#include "image.h"

struct png_blob_handle {
    char *data;
    png_size_t offset;
};

static void png_read_from_buffer(png_structp png, png_bytep out, png_size_t read_length) {
    png_voidp io_ptr = png_get_io_ptr(png);
    struct png_blob_handle *handle = io_ptr;
    memcpy(out, handle->data + handle->offset, read_length);
    handle->offset += read_length;
}

simple_image *read_png_file(struct zip *z, char *path) {

    png_structp png = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    if (!png) {
        fprintf(stderr, "Error: NULL libpng png pointer\n");
        exit(1);
    }

    png_infop info = png_create_info_struct(png);
    if (!info) {
        fprintf(stderr, "Error: NULL libpng info\n");
        exit(1);
    }

    if (setjmp(png_jmpbuf(png))) {
        exit(1);
    }

    FILE *fp = NULL;
    struct png_blob_handle blob_handle;

    if (z != NULL) {
        struct archive_blob blob = read_blob_from_zip(z, path);
        blob_handle.data = blob.data;
        blob_handle.offset = 0;
        png_set_read_fn(png, (png_voidp)&blob_handle, &png_read_from_buffer);
    } else {
        fp = fopen(path, "rb");
        png_init_io(png, fp);
    }

    png_read_info(png, info);

    png_uint_32 width = png_get_image_width(png, info);
    png_uint_32 height = png_get_image_height(png, info);
    png_byte color_type = png_get_color_type(png, info);
    png_byte bit_depth = png_get_bit_depth(png, info);

    if (bit_depth == 16) {
        png_set_strip_16(png);
    }

    if (color_type == PNG_COLOR_TYPE_PALETTE) {
        png_set_palette_to_rgb(png);
    }

    if (color_type == PNG_COLOR_TYPE_GRAY && bit_depth < 8) {
        png_set_expand_gray_1_2_4_to_8(png);
    }

    if (png_get_valid(png, info, PNG_INFO_tRNS)) {
        png_set_tRNS_to_alpha(png);
    }

    if (color_type == PNG_COLOR_TYPE_RGB || color_type == PNG_COLOR_TYPE_GRAY || color_type == PNG_COLOR_TYPE_PALETTE) {
        png_set_filler(png, 0xff, PNG_FILLER_AFTER);
    }

    if (color_type == PNG_COLOR_TYPE_GRAY || color_type == PNG_COLOR_TYPE_GRAY_ALPHA) {
        png_set_gray_to_rgb(png);
    }

    png_read_update_info(png, info);

    png_size_t row_size = png_get_rowbytes(png, info);

    png_byte *pixels = safe_malloc(row_size * height);

    png_byte *row_ptrs[height];
    for (png_uint_32 i = 0; i < height; i++) {
        row_ptrs[i] = pixels + i * row_size;
    }

    png_read_image(png, &row_ptrs[0]);

    if (z != NULL) {
        free(blob_handle.data);
    } else {
        fclose(fp);
    }

    png_destroy_read_struct(&png, &info, NULL);

    simple_image *img = safe_calloc(1, sizeof(simple_image));
    img->width = width;
    img->height = height;
    img->pixels = pixels;

    return img;
}

void simple_image_free(simple_image *self) {
    free(self->pixels);
    free(self);
}
