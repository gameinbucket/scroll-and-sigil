#ifndef MEM_H

#include <stdio.h>
#include <stdlib.h>

void *safe_malloc(size_t size);
void *safe_realloc(void *mem, size_t size);

#endif
