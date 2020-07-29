NAME = scroll-and-sigil-headless

SOURCE = $(wildcard source/shared/**/*.c) $(wildcard source/headless/*.c)
HEADERS = $(wildcard source/shared/**/*.h) $(wildcard source/headless/*.h)
OBJECTS = $(patsubst source/%.c,compiled/objects/%.o,$(SOURCE))
DEPENDENCY = $(patsubst %.o,%.d,$(OBJECTS))
INCLUDE = -Isource/shared -Isource/headless

COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 $(INCLUDE) -Wno-unused -Wno-unused-parameter
LINKER_FLAGS = -lm
CC = gcc

ifneq ($(shell uname), Linux)
	CC = clang
	COMPILER_FLAGS += -Wno-nullability-extension
endif

.PHONY: all release clean test

all: COMPILER_FLAGS += -g
all: $(NAME)

release: COMPILER_FLAGS += -O3
release: $(NAME)

-include $(DEPENDENCY)

$(NAME): $(HEADERS) $(OBJECTS)
	$(PREFIX) $(CC) $(OBJECTS) $(COMPILER_FLAGS) -o $(NAME) $(LINKER_FLAGS)

compiled/objects/%.o: source/%.c
	@mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) -MMD -o $@

clean:
	rm -f ./$(NAME)
	rm -rf ./compiled/objects

TEST_SOURCE = $(wildcard tests/*.c) $(wildcard source/common/*.c) $(wildcard source/data/*.c)

test: $(TEST_SOURCE)
	$(CC) $(TEST_SOURCE) $(COMPILER_FLAGS) -o testing $(LIBS)
	@ ./testing
