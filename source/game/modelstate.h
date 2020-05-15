#ifndef MODEL_STATE_H
#define MODEL_STATE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <zip.h>

#include "core/mem.h"
#include "data/table.h"
#include "graphics/model.h"

typedef struct modelstate modelstate;

struct modelstate {
    table *models;
};

modelstate *create_modelstate();
void modelstate_add_model(modelstate *self, char *name, model_info *info);
model_info *modelstate_get_model(modelstate *self, char *name);
void delete_modelstate(modelstate *self);

#endif
