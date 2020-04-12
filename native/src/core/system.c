#include "system.h"

string *cmd(char *command) {
    char buffer[128];
    FILE *fp;
    if ((fp = popen(command, "r")) == NULL) {
        printf("popen failed");
        exit(1);
    }
    string *in = NULL;
    while (fgets(buffer, 128, fp) != NULL) {
        if (in == NULL) {
            in = string_init(buffer);
        } else {
            string *cat = string_append(in, buffer);
            if (cat != in) {
                string_free(in);
                in = cat;
            }
        }
    }
    if (pclose(fp)) {
        printf("popen close failed");
        exit(1);
    }
    return in;
}
