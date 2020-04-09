#include "system.h"

string new_popen(const char *command) {
    char buffer[128];
    FILE *fp;
    if ((fp = popen(command, "r")) == NULL) {
        printf("popen failed");
        exit(1);
    }
    string in = NULL;
    while (fgets(buffer, 128, fp) != NULL) {
        if (in == NULL) {
            in = string_init(buffer);
        } else {
            string cat = string_append(in, buffer);
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

string core_system(string command) {
    const int PARENT_WRITE_PIPE = 0;
    const int PARENT_READ_PIPE = 1;

    const int READ_FD = 0;
    const int WRITE_FD = 1;

    int pipes[2][2];

    printf("command == %s\n", command);

    if (pipe(pipes[PARENT_READ_PIPE]) != 0) {
        printf("pipe failed");
        exit(1);
    }

    if (pipe(pipes[PARENT_WRITE_PIPE]) != 0) {
        printf("pipe failed");
        exit(1);
    }

    if (fork()) {
        printf("fork\n");
        fflush(stdout);

        char buffer[256];
        int count;

        close(pipes[PARENT_WRITE_PIPE][READ_FD]);
        close(pipes[PARENT_READ_PIPE][WRITE_FD]);

        command = string_append(command, "\n");
        size_t len = string_len_size(command);

        if (write(pipes[PARENT_WRITE_PIPE][WRITE_FD], command, len)) {
        }

        count = read(pipes[PARENT_READ_PIPE][READ_FD], buffer, sizeof(buffer) - 1);
        if (count >= 0) {
            buffer[count] = 0;
            printf("buffer == %s\n", buffer);
        } else {
            printf("IO Error\n");
        }
    } else {
        printf("not fork\n");
        fflush(stdout);

        dup2(pipes[PARENT_WRITE_PIPE][READ_FD], STDIN_FILENO);
        dup2(pipes[PARENT_READ_PIPE][WRITE_FD], STDOUT_FILENO);

        close(pipes[PARENT_WRITE_PIPE][READ_FD]);
        close(pipes[PARENT_READ_PIPE][WRITE_FD]);
        close(pipes[PARENT_READ_PIPE][READ_FD]);
        close(pipes[PARENT_WRITE_PIPE][WRITE_FD]);
    }

    return string_init("foo");
}

system_std system_help(const char *command) {
    char buffer[256];
    FILE *fp;
    if ((fp = popen(command, "r")) == NULL) {
        printf("popen failed");
        exit(1);
    }
    string in = NULL;
    string err = NULL;
    while (fgets(buffer, 256, fp) != NULL) {
        if (in == NULL) {
            in = string_init(buffer);
        } else {
            string cat = string_append(in, buffer);
            if (cat != in) {
                string_free(in);
                in = cat;
            }
        }
    }
    int code = 0;
    if (pclose(fp)) {
        printf("popen close failed");
        exit(1);
    }
    system_std tuple = {in, err, code};
    return tuple;
}
