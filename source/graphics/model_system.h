#ifndef MODEL_SYSTEM_H
#define MODEL_SYSTEM_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <zip.h>

#include "common/mem.h"
#include "data/table.h"

#include "model.h"

typedef struct model_system model_system;

struct model_system {
    table *models;
};

model_system *create_model_system();
void model_system_add_model(model_system *self, char *name, model_info *info);
model_info *model_system_get_model(model_system *self, char *name);
void delete_model_system(model_system *self);

#endif
