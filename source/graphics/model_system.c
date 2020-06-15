#include "model_system.h"

model_system *create_model_system() {
    model_system *self = safe_calloc(1, sizeof(model_system));
    self->models = create_table(&table_string_equal, &table_string_hashcode);
    return self;
}

void model_system_add_model(model_system *self, char *name, model_info *info) {
    table_put(self->models, name, info);
}

model_info *model_system_get_model(model_system *self, char *name) {
    return table_get(self->models, name);
}

void delete_model_system(model_system *self) {
    printf("delete model_system %p\n", (void *)self);
}
