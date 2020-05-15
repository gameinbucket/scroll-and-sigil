#include "modelstate.h"

modelstate *create_modelstate() {
    modelstate *self = safe_calloc(1, sizeof(modelstate));
    self->models = create_table(&table_string_equal, &table_string_hashcode);
    return self;
}

void modelstate_add_model(modelstate *self, char *name, model_info *info) {
    table_put(self->models, name, info);
}

model_info *modelstate_get_model(modelstate *self, char *name) {
    return table_get(self->models, name);
}

void delete_modelstate(modelstate *self) {
    printf("delete modelstate %p\n", (void *)self);
}
