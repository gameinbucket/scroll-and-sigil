#include "biped.h"

model *alloc_biped() {
    bone *bones = safe_calloc(BIPED_BONES, sizeof(bone));

    // Body

    bone_init(&bones[BIPED_BODY], 8, 16, 6, BIPED_SCALE);

    // Neck

    bone_init(&bones[BIPED_NECK], 3, 1.2, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_NECK], 0, bones[BIPED_BODY].height + bones[BIPED_NECK].height, 0);

    // Head

    bone_init(&bones[BIPED_HEAD], 6, 6, 6, BIPED_SCALE);
    bone_offset(&bones[BIPED_HEAD], 0, bones[BIPED_NECK].height + bones[BIPED_HEAD].height, 0);

    // Arms

    bone_init(&bones[BIPED_LEFT_ARM], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_LEFT_ARM], bones[BIPED_LEFT_ARM].width + bones[BIPED_BODY].width, bones[BIPED_BODY].height * 0.95, 0);
    bone_plane_offset(&bones[BIPED_LEFT_ARM], 0, -bones[BIPED_LEFT_ARM].height, 0);

    bone_init(&bones[BIPED_LEFT_FOREARM], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_LEFT_FOREARM], 0, -bones[BIPED_LEFT_ARM].height * 2, 0);
    bone_plane_offset(&bones[BIPED_LEFT_FOREARM], 0, -bones[BIPED_LEFT_FOREARM].height, 0);

    bone_init(&bones[BIPED_RIGHT_ARM], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_RIGHT_ARM], -(bones[BIPED_RIGHT_ARM].width + bones[BIPED_BODY].width), bones[BIPED_BODY].height * 0.95, 0);
    bone_plane_offset(&bones[BIPED_RIGHT_ARM], 0, -bones[BIPED_RIGHT_ARM].height, 0);

    bone_init(&bones[BIPED_RIGHT_FOREARM], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_RIGHT_FOREARM], 0, -bones[BIPED_RIGHT_ARM].height * 2, 0);
    bone_plane_offset(&bones[BIPED_RIGHT_FOREARM], 0, -bones[BIPED_RIGHT_FOREARM].height, 0);

    // Legs

    bone_init(&bones[BIPED_LEFT_LEG], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_LEFT_LEG], bones[BIPED_BODY].width - bones[BIPED_LEFT_LEG].width, -bones[BIPED_BODY].height, 0);
    bone_plane_offset(&bones[BIPED_LEFT_LEG], 0, -bones[BIPED_LEFT_LEG].height, 0);

    bone_init(&bones[BIPED_LEFT_KNEE], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_LEFT_KNEE], 0, -bones[BIPED_LEFT_LEG].height * 2, 0);
    bone_plane_offset(&bones[BIPED_LEFT_KNEE], 0, -bones[BIPED_LEFT_KNEE].height, 0);

    bone_init(&bones[BIPED_RIGHT_LEG], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_RIGHT_LEG], -(bones[BIPED_BODY].width - bones[BIPED_RIGHT_LEG].width), -bones[BIPED_BODY].height, 0);
    bone_plane_offset(&bones[BIPED_RIGHT_LEG], 0, -bones[BIPED_RIGHT_LEG].height, 0);

    bone_init(&bones[BIPED_RIGHT_KNEE], 3, 8, 3, BIPED_SCALE);
    bone_offset(&bones[BIPED_RIGHT_KNEE], 0, -bones[BIPED_RIGHT_LEG].height * 2, 0);
    bone_plane_offset(&bones[BIPED_RIGHT_KNEE], 0, -bones[BIPED_RIGHT_KNEE].height, 0);

    bone_attached(&bones[BIPED_BODY], 5);
    bones[BIPED_BODY].child[0] = &bones[BIPED_NECK];
    bones[BIPED_BODY].child[1] = &bones[BIPED_LEFT_ARM];
    bones[BIPED_BODY].child[2] = &bones[BIPED_RIGHT_ARM];
    bones[BIPED_BODY].child[3] = &bones[BIPED_LEFT_LEG];
    bones[BIPED_BODY].child[4] = &bones[BIPED_RIGHT_LEG];

    bone_attached(&bones[BIPED_NECK], 1);
    bones[BIPED_NECK].child[0] = &bones[BIPED_HEAD];

    bone_attached(&bones[BIPED_LEFT_ARM], 1);
    bones[BIPED_LEFT_ARM].child[0] = &bones[BIPED_LEFT_FOREARM];

    bone_attached(&bones[BIPED_RIGHT_ARM], 1);
    bones[BIPED_RIGHT_ARM].child[0] = &bones[BIPED_RIGHT_FOREARM];

    bone_attached(&bones[BIPED_LEFT_LEG], 1);
    bones[BIPED_LEFT_LEG].child[0] = &bones[BIPED_LEFT_KNEE];

    bone_attached(&bones[BIPED_RIGHT_LEG], 1);
    bones[BIPED_RIGHT_LEG].child[0] = &bones[BIPED_RIGHT_KNEE];

    model *m = safe_malloc(sizeof(model));
    m->bones = bones;
    m->bone_count = BIPED_BONES;
    m->animations = NULL;

    bone_recursive_join(&bones[BIPED_BODY], NULL);

    return m;
}
